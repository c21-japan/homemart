#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { load } from 'cheerio'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUUMO_URL = 'https://suumo.jp/ikkodate/__JJ_JJ010FJ001_arz1060z2bsz1020z2kkcz1126506001z2kkcz1126506002z2kkcz1126506005z2kkcz1126506006z2kkcz1126506007z2kkcz1126506008z2kkcz1126506009z2kkcz1126506010z2kkcz1126506011z2kkcz1126506013z2kkcz1126506014z2kkcz1126506015.html'
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'suumo')
const IMAGE_DIR = path.join(OUTPUT_DIR, 'images')
const LOGO_PATH = path.join(OUTPUT_DIR, 'logo.png')
const OUTPUT_JSON = path.join(OUTPUT_DIR, 'properties.json')
const VIDEO_URL = 'https://homemart-one.vercel.app/'

const COMPANY_NAME = 'センチュリー21ホームマート'
const COMPANY_TEL = '0120-43-8639'
const COMPANY_ADDRESS = '奈良県北葛城郡広陵町笠287-1'

const DEFAULT_LIMIT = 20
const DEFAULT_DELAY_MIN = 5000
const DEFAULT_DELAY_MAX = 9000

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const sanitizeText = (value = '') =>
  value
    .replace(/住まいるプラス\s*1|住まいるプラス１|近畿住宅流通本店|近畿住宅流通/gi, COMPANY_NAME)
    .replace(/センチュリー21ホームマートセンチュリー21ホームマート/g, COMPANY_NAME)
    .replace(/\b0?\d{2,4}-\d{2,4}-\d{3,4}\b/g, COMPANY_TEL)
    .replace(/奈良県北葛城郡広陵町笠287-1/g, COMPANY_ADDRESS)
    .replace(/\[\s*■.*?\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const hashId = (input) => crypto.createHash('md5').update(input).digest('hex').slice(0, 12)

const ensureDirs = async () => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  await fs.mkdir(IMAGE_DIR, { recursive: true })
  try {
    const files = await fs.readdir(IMAGE_DIR)
    await Promise.all(
      files
        .filter((file) => file.endsWith('.jpg'))
        .map((file) => fs.unlink(path.join(IMAGE_DIR, file)))
    )
  } catch {
    // ignore cleanup errors
  }
}

const fetchWithTimeout = async (url, options = {}, timeoutMs = 20000) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

const downloadImage = async (url, destPath, attempts = 3) => {
  let lastError
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetchWithTimeout(url, {}, 30000)
      if (!response.ok) {
        throw new Error(`Image download failed: ${response.status} ${url}`)
      }
      const buffer = Buffer.from(await response.arrayBuffer())
      await fs.writeFile(destPath, buffer)
      return
    } catch (error) {
      lastError = error
      await sleep(1000 * (i + 1))
    }
  }
  throw lastError
}

const overlayLogo = async (imagePath) => {
  const image = sharp(imagePath)
  const metadata = await image.metadata()

  if (!metadata.width || !metadata.height) return

  const baseWidth = Math.max(160, Math.min(240, Math.round(metadata.width * 0.25)))
  const targetWidth = Math.min(metadata.width, Math.round(baseWidth * 1.5))
  const logoBuffer = await sharp(LOGO_PATH)
    .resize({ width: targetWidth })
    .png()
    .toBuffer()

  const logoMeta = await sharp(logoBuffer).metadata()

  const left = Math.max(0, metadata.width - (logoMeta.width || targetWidth))
  const top = Math.max(0, metadata.height - (logoMeta.height || targetWidth))

  const tempPath = `${imagePath}.tmp`
  await image
    .composite([{ input: logoBuffer, left, top }])
    .jpeg({ quality: 90 })
    .toFile(tempPath)
  await fs.rename(tempPath, imagePath)
}

const fetchHtml = async (url) => {
  const response = await fetchWithTimeout(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  }, 30000)
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${url}`)
  }
  return response.text()
}

const extractDetailLinks = (html) => {
  const $ = load(html)
  const links = new Set()
  $('a').each((_, el) => {
    const href = $(el).attr('href') || ''
    if (!href.includes('/ikkodate/')) return
    if (!href.includes('/nc_')) return
    const cleaned = href.split('?')[0]
    const url = cleaned.startsWith('http') ? cleaned : `https://suumo.jp${cleaned}`
    links.add(url)
  })
  return Array.from(links)
}

const extractByLabel = ($, labels) => {
  const labelList = Array.isArray(labels) ? labels : [labels]
  let value = ''
  $('tr').each((_, row) => {
    if (value) return
    const ths = $(row).find('th')
    const tds = $(row).find('td')
    if (!ths.length || !tds.length) return
    ths.each((idx, th) => {
      if (value) return
      const thText = ($(th).text() || '').replace(/\s+/g, '')
      if (!labelList.some((label) => thText.includes(label))) return
      const td = tds.eq(idx).length ? tds.eq(idx) : $(th).next('td')
      if (td.length) value = td.text()
    })
  })

  if (value) return value

  $('dt').each((_, dt) => {
    if (value) return
    const dtText = ($(dt).text() || '').replace(/\s+/g, '')
    if (labelList.some((label) => dtText.includes(label))) {
      const dd = $(dt).next('dd')
      if (dd.length) value = dd.text()
    }
  })

  return value
}

const extractTransportation = ($) => {
  const raw = extractByLabel($, ['交通'])
  if (!raw) return []
  const lines = raw
    .split(/\n|<br\s*\/?>/i)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const results = []
  const pattern = /(.*?)[「『]([^」』]+)[」』].*?(徒歩|歩)([^\\s]+)/g

  lines.forEach((line) => {
    let matched = false
    let match
    while ((match = pattern.exec(line)) !== null) {
      matched = true
      results.push({
        line: sanitizeText(match[1]),
        station: sanitizeText(match[2]),
        walk_time: sanitizeText(`${match[3]}${match[4]}`)
      })
    }
    if (!matched) {
      results.push({
        line: '',
        station: sanitizeText(line),
        walk_time: ''
      })
    }
  })

  return results
}

const extractImages = ($) => {
  const urls = []
  $('a.carousel_item-object').each((_, el) => {
    const src = $(el).attr('data-src') || ''
    if (!src || src.startsWith('data:')) return
    if (/logo|icon|sprite|blank/i.test(src)) return
    urls.push(src)
  })

  $('input[id^="imgKukakuMadori_"][id$="orgn"]').each((_, el) => {
    const value = $(el).attr('value') || ''
    const url = value.split(',')[0]
    if (!url) return
    urls.push(url)
  })

  return Array.from(new Set(urls))
}

const extractImageMeta = ($) => {
  const images = []
  $('a.carousel_item-object').each((_, el) => {
    const src = $(el).attr('data-src') || ''
    if (!src || src.startsWith('data:')) return
    if (/logo|icon|sprite|blank/i.test(src)) return
    images.push({
      url: src,
      category: $(el).attr('data-category') || '',
      caption: $(el).attr('data-caption') || ''
    })
  })

  $('input[id^="imgKukakuMadori_"][id$="orgn"]').each((_, el) => {
    const value = $(el).attr('value') || ''
    const [url, label] = value.split(',')
    if (!url) return
    images.push({
      url,
      category: label || '間取り図',
      caption: ''
    })
  })

  return images
}

const extractFeatureList = (html) => {
  const match = html.match(/tokuchoPickupList\\s*:\\s*\\[(.*?)\\]/s)
  if (!match) return []
  const raw = `[${match[1]}]`
  try {
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

const extractDescription = ($) => {
  let description = ''
  $('.section').each((_, section) => {
    if (description) return
    const heading = $(section).find('.section_h2-header_title').first().text()
    if (heading && heading.includes('物件の特徴')) {
      description = $(section).find('p.fs14').first().text()
    }
  })

  if (!description) {
    description = $('p.fs14').first().text()
  }

  return description
}

const extractEventInfo = (html) => {
  const match = html.match(/現地説明会[^<]*<br>[^<]*|見学会[^<]*<br>[^<]*/i)
  if (!match) return ''
  return match[0].replace(/<br\s*\/?>/gi, '\n')
}

const extractOverview = ($) => {
  const labels = [
    '建物構造',
    '築年月',
    '築年数',
    '駐車場',
    '私道負担',
    '道路',
    '接道',
    '建ぺい率',
    '容積率',
    '地目',
    '土地権利',
    '国土法',
    '取引態様',
    '諸費用',
    '都市計画',
    '用途地域',
    '建築確認番号',
    '引渡し',
    '現況'
  ]
  const overview = {}
  labels.forEach((label) => {
    const value = sanitizeText(extractByLabel($, [label]))
    if (value) overview[label] = value
  })
  return overview
}

const extractEquipmentNotes = (imageMeta) => {
  const keywords = /(QUIE|クワイエ|住宅性能|性能評価|複層ガラス|制震|耐震|断熱|省エネ|保証)/i
  const notes = imageMeta
    .map((meta) => sanitizeText(meta.caption || ''))
    .filter((caption) => caption && keywords.test(caption))
  return Array.from(new Set(notes))
}

const extractSurroundings = (imageMeta) => {
  const target = new Set([
    '駅',
    'スーパー',
    'コンビニ',
    '小学校',
    '中学校',
    '幼稚園・保育園',
    '病院',
    '公園',
    'ドラッグストア',
    'ショッピングセンター',
    '郵便局',
    '銀行'
  ])
  return imageMeta
    .filter((meta) => target.has(meta.category))
    .map((meta) => {
      const caption = sanitizeText(meta.caption || '')
      const match = caption.match(/(.+?)まで(\d+\\w*)\\s*徒歩(\\d+分)?/)
      return {
        category: meta.category,
        name: match ? sanitizeText(match[1]) : caption,
        distance: match ? match[2] : '',
        walk_time: match ? match[3] || '' : ''
      }
    })
    .filter((item) => item.name)
}

const extractSitePlan = ($) => {
  let image = ''
  let caption = ''
  $('.secTitleInnerR').each((_, el) => {
    const title = $(el).text().trim()
    if (title === '区画図') {
      const section = $(el).closest('.mt20')
      image = section.find('img').attr('src') || ''
      caption = section.find('p').first().text() || ''
    }
  })
  return { image, caption }
}

const extractUnits = ($) => {
  const units = []
  $('.secTitleInnerR').each((_, el) => {
    const title = $(el).text().trim()
    if (title !== '間取り図') return
    const section = $(el).closest('.mt20')
    section.find('li.dibz').each((__, item) => {
      const name = $(item).find('.icLoupeSide').first().text().trim()
      const image = $(item).find('img').first().attr('src') || ''
      const data = {}
      $(item)
        .find('dt')
        .each((idx, dt) => {
          const label = $(dt).text().trim()
          const dd = $(dt).next('dd').text().trim().replace(/^：/, '')
          data[label] = dd
        })
      units.push({
        name,
        price: data['価格'] || '',
        layout: data['間取り'] || '',
        land_area: data['土地面積'] || '',
        building_area: data['建物面積'] || '',
        floor_plan_image: image
      })
    })
  })
  return units
}

const crawl = async ({ limit, delayMin, delayMax }) => {
  await ensureDirs()

  const useSystemChrome = process.env.USE_SYSTEM_CHROME === '1'
  if (useSystemChrome) {
    console.log('USE_SYSTEM_CHROME=1 is set, but this crawler uses fetch/cheerio.')
  }

  const listHtml = await fetchHtml(SUUMO_URL)
  const detailLinks = extractDetailLinks(listHtml)
  const targets = detailLinks.slice(0, limit)

  const results = []

  for (let index = 0; index < targets.length; index += 1) {
    const url = targets[index]
    const detailHtml = await fetchHtml(url)
    const $ = load(detailHtml)

    const title = sanitizeText($('h1').first().text()) || `物件 ${index + 1}`
    const price =
      sanitizeText($('.section_h1-price, .property_view_main__price, .price').first().text()) ||
      sanitizeText(extractByLabel($, ['価格', '販売価格']))

    const address =
      sanitizeText(extractByLabel($, ['所在地', '住所'])) ||
      sanitizeText($('.property_view_detail_address').first().text())

    const propertyType =
      sanitizeText(extractByLabel($, ['物件種目', '種別'])) ||
      '新築戸建'

    const description = sanitizeText(
      extractDescription($) ||
      $('.overview, .detailinfo-table, .section_detail').first().text()
    )

    const layout = sanitizeText(extractByLabel($, ['間取り']))
    const landArea = sanitizeText(extractByLabel($, ['土地面積']))
    const buildingArea = sanitizeText(extractByLabel($, ['建物面積']))
    const traffic = sanitizeText(extractByLabel($, ['交通']))
    const transportation = extractTransportation($)
    const sitePlan = extractSitePlan($)
    const units = extractUnits($)
    const eventInfo = sanitizeText(extractEventInfo(detailHtml))
    const overview = extractOverview($)

    const images = extractImages($)
    const imageMeta = extractImageMeta($)
    const mainImageUrl = images[0] || ''
    const featureList = extractFeatureList(detailHtml)
    const equipmentNotes = extractEquipmentNotes(imageMeta)
    const surroundings = extractSurroundings(imageMeta)

    const slug = hashId(url)
    const localImages = []

    for (let imgIndex = 0; imgIndex < images.length; imgIndex += 1) {
      const imageUrl = images[imgIndex]
      if (!imageUrl) continue
      const imagePath = path.join(IMAGE_DIR, `${slug}_${imgIndex + 1}.jpg`)
      try {
        await downloadImage(imageUrl, imagePath)
        await overlayLogo(imagePath)
        localImages.push(`/suumo/images/${slug}_${imgIndex + 1}.jpg`)
      } catch (error) {
        console.error(`Image failed for ${url}:`, error)
      }
    }

    let sitePlanImageLocal = ''
    if (sitePlan.image) {
      const imagePath = path.join(IMAGE_DIR, `${slug}_siteplan.jpg`)
      try {
        await downloadImage(sitePlan.image, imagePath)
        await overlayLogo(imagePath)
        sitePlanImageLocal = `/suumo/images/${slug}_siteplan.jpg`
      } catch (error) {
        console.error(`Site plan failed for ${url}:`, error)
      }
    }

    const unitData = []
    for (let unitIndex = 0; unitIndex < units.length; unitIndex += 1) {
      const unit = units[unitIndex]
      let floorPlanLocal = ''
      if (unit.floor_plan_image) {
        const imagePath = path.join(IMAGE_DIR, `${slug}_unit${unitIndex + 1}_floorplan.jpg`)
        try {
        await downloadImage(unit.floor_plan_image, imagePath)
        floorPlanLocal = `/suumo/images/${slug}_unit${unitIndex + 1}_floorplan.jpg`
      } catch (error) {
        console.error(`Floor plan failed for ${url}:`, error)
      }
      }
      unitData.push({
        name: sanitizeText(unit.name || ''),
        price: sanitizeText(unit.price || ''),
        layout: sanitizeText(unit.layout || ''),
        land_area: sanitizeText(unit.land_area || ''),
        building_area: sanitizeText(unit.building_area || ''),
        floor_plan_image: floorPlanLocal || unit.floor_plan_image || ''
      })
    }

    results.push({
      id: slug,
      title: title || `物件 ${index + 1}`,
      price: price || '',
      address,
      property_type: propertyType || '新築戸建',
      description,
      layout,
      land_area: landArea,
      building_area: buildingArea,
      traffic,
      transportation,
      event_info: eventInfo,
      features: featureList.map((item) => sanitizeText(item)).filter(Boolean),
      overview,
      equipment_notes: equipmentNotes,
      surroundings,
      images: localImages,
      site_plan_image: sitePlanImageLocal,
      units: unitData,
      image_meta: imageMeta.map((meta) => ({
        url: meta.url,
        category: sanitizeText(meta.category || ''),
        caption: sanitizeText(meta.caption || '')
      })),
      image_url: localImages[0] || '',
      source_url: url,
      company_name: COMPANY_NAME,
      company_tel: COMPANY_TEL,
      company_address: COMPANY_ADDRESS,
      video_url: VIDEO_URL,
      fetched_at: new Date().toISOString()
    })

    if (index < targets.length - 1) {
      const delay = randomBetween(delayMin, delayMax)
      await sleep(delay)
    }
  }

  await fs.writeFile(OUTPUT_JSON, JSON.stringify({
    source: 'suumo',
    url: SUUMO_URL,
    fetched_at: new Date().toISOString(),
    items: results
  }, null, 2))

  console.log(`Saved ${results.length} items to ${OUTPUT_JSON}`)
}

const args = process.argv.slice(2)
const limitArg = Number(args.find((arg) => arg.startsWith('--limit='))?.split('=')[1])
const delayMinArg = Number(args.find((arg) => arg.startsWith('--delay-min='))?.split('=')[1])
const delayMaxArg = Number(args.find((arg) => arg.startsWith('--delay-max='))?.split('=')[1])

crawl({
  limit: Number.isFinite(limitArg) && limitArg > 0 ? limitArg : DEFAULT_LIMIT,
  delayMin: Number.isFinite(delayMinArg) && delayMinArg > 0 ? delayMinArg : DEFAULT_DELAY_MIN,
  delayMax: Number.isFinite(delayMaxArg) && delayMaxArg > 0 ? delayMaxArg : DEFAULT_DELAY_MAX
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
