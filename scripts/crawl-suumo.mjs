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
    .replace(/住まいるプラス1|近畿住宅流通/gi, COMPANY_NAME)
    .replace(/\b0?\d{2,4}-\d{2,4}-\d{3,4}\b/g, COMPANY_TEL)
    .replace(/奈良県北葛城郡広陵町笠287-1/g, COMPANY_ADDRESS)
    .replace(/\s+/g, ' ')
    .trim()

const hashId = (input) => crypto.createHash('md5').update(input).digest('hex').slice(0, 12)

const ensureDirs = async () => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  await fs.mkdir(IMAGE_DIR, { recursive: true })
}

const downloadImage = async (url, destPath) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status} ${url}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  await fs.writeFile(destPath, buffer)
}

const overlayLogo = async (imagePath) => {
  const image = sharp(imagePath)
  const metadata = await image.metadata()

  if (!metadata.width || !metadata.height) return

  const targetWidth = Math.max(160, Math.min(240, Math.round(metadata.width * 0.25)))
  const logoBuffer = await sharp(LOGO_PATH)
    .resize({ width: targetWidth })
    .png()
    .toBuffer()

  const logoMeta = await sharp(logoBuffer).metadata()
  const margin = Math.round(Math.min(metadata.width, metadata.height) * 0.03)

  const left = Math.max(0, metadata.width - (logoMeta.width || targetWidth) - margin)
  const top = Math.max(0, metadata.height - (logoMeta.height || targetWidth) - margin)

  await image
    .composite([{ input: logoBuffer, left, top }])
    .jpeg({ quality: 90 })
    .toFile(imagePath)
}

const fetchHtml = async (url) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  })
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
    const th = $(row).find('th').first()
    const td = $(row).find('td').first()
    if (!th.length || !td.length) return
    const thText = (th.text() || '').replace(/\s+/g, '')
    if (labelList.some((label) => thText.includes(label))) {
      value = td.text()
    }
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
      sanitizeText($('.property_view_detail_type').first().text())

    const description = sanitizeText(
      extractDescription($) ||
      $('.overview, .detailinfo-table, .section_detail').first().text()
    )

    const layout = sanitizeText(extractByLabel($, ['間取り']))
    const landArea = sanitizeText(extractByLabel($, ['土地面積']))
    const buildingArea = sanitizeText(extractByLabel($, ['建物面積']))
    const traffic = sanitizeText(extractByLabel($, ['交通']))

    const images = extractImages($)
    const imageMeta = extractImageMeta($)
    const mainImageUrl = images[0] || ''
    const featureList = extractFeatureList(detailHtml)

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
      features: featureList.map((item) => sanitizeText(item)).filter(Boolean),
      images: localImages,
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
