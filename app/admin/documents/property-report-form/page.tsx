'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'

// フォームデータの型定義
interface FormData {
  // 基本情報
  propertyName: string
  sellerName: string
  phoneNumber: string
  usage: string
  
  // 物件状況
  leak: string
  leakDetail: string
  termite: string
  pipe: string
  pipeDetail: string
  fire: string
  
  // 付帯設備
  waterHeater: boolean
  waterHeaterDefect: boolean
  waterHeaterDefectDetail: string
  kitchen: Record<string, boolean>
  bathroom: Record<string, boolean>
  toilet: Record<string, boolean>
  aircon: Record<string, boolean>
  floorHeating: boolean
  storage: Record<string, boolean>
  other: Record<string, boolean>
  
  // 周辺環境
  noise: string
  noiseDetail: string
  incident: string
  incidentDetail: string
  construction: string
  otherNotes: string
}

// 初期データ
const initialFormData: FormData = {
  propertyName: '',
  sellerName: '',
  phoneNumber: '',
  usage: '',
  leak: '',
  leakDetail: '',
  termite: '',
  pipe: '',
  pipeDetail: '',
  fire: '',
  waterHeater: false,
  waterHeaterDefect: false,
  waterHeaterDefectDetail: '',
  kitchen: {
    sink: false,
    gasStove: false,
    ihStove: false,
    rangeHood: false,
    dishwasher: false,
    waterFilter: false
  },
  bathroom: {
    bathtub: false,
    shower: false,
    reheating: false,
    bathDryer: false
  },
  toilet: {
    toilet: false,
    washlet: false
  },
  aircon: {
    living: false,
    bedroom: false,
    other: false
  },
  floorHeating: false,
  storage: {
    closet: false,
    shoeBox: false,
    screenDoor: false,
    fusuma: false
  },
  other: {
    intercom: false,
    tvAntenna: false,
    fireAlarm: false
  },
  noise: '',
  noiseDetail: '',
  incident: '',
  incidentDetail: '',
  construction: '',
  otherNotes: ''
}

export default function PropertyReportFormPage() {
  const [currentSection, setCurrentSection] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)

  const totalSections = 6

  // メモ化された計算値
  const progress = useMemo(() => (currentSection / totalSections) * 100, [currentSection])
  
  const isLastSection = useMemo(() => currentSection === totalSections, [currentSection])
  const isFirstSection = useMemo(() => currentSection === 1, [currentSection])

  // 最適化されたハンドラー
  const handleInputChange = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleNestedChange = useCallback((parent: keyof FormData, field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as Record<string, boolean>),
        [field]: value,
      },
    }))
  }, [])

  const validateSection = useCallback((sectionNumber: number) => {
    switch (sectionNumber) {
      case 1:
        return formData.propertyName && formData.sellerName && formData.phoneNumber && formData.usage
      case 2:
        return formData.leak && formData.termite && formData.pipe && formData.fire
      default:
        return true
    }
  }, [formData])

  const nextSection = useCallback(() => {
    if (validateSection(currentSection) && currentSection < totalSections) {
      setCurrentSection(currentSection + 1)
      window.scrollTo(0, 0)
    } else if (!validateSection(currentSection)) {
      alert('必須項目を入力してください')
    }
  }, [currentSection, validateSection])

  const prevSection = useCallback(() => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1)
      window.scrollTo(0, 0)
    }
  }, [currentSection])

  const submitForm = useCallback(() => {
    console.log('送信データ:', formData)
    alert('送信完了しました')
  }, [formData])

  // 共通のボタンスタイル
  const buttonStyles = {
    primary: "bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors",
    secondary: "bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors",
    success: "bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
  }

  // 共通のセクションヘッダー
  const SectionHeader = ({ number, title, color }: { number: number; title: string; color: string }) => (
    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
      <span className={`${color} text-sm font-medium px-3 py-1 rounded-full mr-3`}>{number}</span>
      {title}
    </h2>
  )

  // 共通の入力フィールド
  const InputField = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )

  // 共通のラジオボタングループ
  const RadioGroup = ({ 
    name, 
    value, 
    onChange, 
    options 
  }: { 
    name: string; 
    value: string; 
    onChange: (value: string) => void; 
    options: { value: string; label: string }[] 
  }) => (
    <div className="space-y-3">
      {options.map((option) => (
        <label key={option.value} className="flex items-center">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="mr-3"
          />
          {option.label}
        </label>
      ))}
    </div>
  )

  // 共通のチェックボックスグループ
  const CheckboxGroup = ({ 
    items, 
    values, 
    onChange 
  }: { 
    items: { key: string; label: string }[]; 
    values: Record<string, boolean>; 
    onChange: (key: string, value: boolean) => void 
  }) => (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <label key={item.key} className="flex items-center">
          <input
            type="checkbox"
            checked={values[item.key] || false}
            onChange={(e) => onChange(item.key, e.target.checked)}
            className="mr-2"
          />
          {item.label}
        </label>
      ))}
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">物件状況等報告書・付帯設備表</h1>
        <p className="text-gray-600">センチュリー21 ホームマート</p>
      </div>

      {/* プログレスバー */}
      <div className="bg-gray-200 rounded-full h-4 mb-6">
        <div 
          className="bg-blue-600 h-4 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-center text-sm text-gray-600 mb-6">
        {Math.round(progress)}% 完了
      </div>

      {/* セクション1: 基本情報 */}
      {currentSection === 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <SectionHeader number={1} title="📋 基本情報" color="bg-blue-100 text-blue-800" />
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>ご記入前にお読みください</strong><br />
                  こちらの情報は売買契約の重要な資料となります。<br />
                  売主様が知っている情報は全て正確にご記入ください。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <InputField label="物件名（マンション名・部屋番号）" required>
              <input
                type="text"
                value={formData.propertyName}
                onChange={(e) => handleInputChange('propertyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例：〇〇マンション 301号室"
              />
            </InputField>

            <InputField label="売主様のお名前" required>
              <input
                type="text"
                value={formData.sellerName}
                onChange={(e) => handleInputChange('sellerName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例：山田 太郎"
              />
            </InputField>

            <InputField label="ご連絡先電話番号" required>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例：090-1234-5678"
              />
            </InputField>

            <InputField label="現在の使用状況" required>
              <RadioGroup
                name="usage"
                value={formData.usage}
                onChange={(value) => handleInputChange('usage', value)}
                options={[
                  { value: 'self', label: '自己使用中' },
                  { value: 'vacant', label: '空き家' },
                  { value: 'rental', label: '賃貸中' }
                ]}
              />
            </InputField>
          </div>

          <div className="flex justify-end mt-8">
            <button onClick={nextSection} className={buttonStyles.primary}>
              次へ進む →
            </button>
          </div>
        </div>
      )}

      {/* セクション2: 物件の状況 */}
      {currentSection === 2 && (
        <div className="bg-white rounded-lg shadow p-6">
          <SectionHeader number={2} title="🏠 物件の状況確認" color="bg-green-100 text-green-800" />

          <div className="space-y-6">
            <InputField label="雨漏り" required>
              <RadioGroup
                name="leak"
                value={formData.leak}
                onChange={(value) => handleInputChange('leak', value)}
                options={[
                  { value: 'no', label: '発見していない' },
                  { value: 'past', label: '過去にあった（修繕済）' },
                  { value: 'current', label: '現在ある' }
                ]}
              />
              {(formData.leak === 'past' || formData.leak === 'current') && (
                <div className="mt-4">
                  <textarea
                    value={formData.leakDetail}
                    onChange={(e) => handleInputChange('leakDetail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="例：リビングの天井から雨漏り、2023年5月に修繕済み"
                  />
                </div>
              )}
            </InputField>

            <InputField label="シロアリの害" required>
              <RadioGroup
                name="termite"
                value={formData.termite}
                onChange={(value) => handleInputChange('termite', value)}
                options={[
                  { value: 'no', label: '発見していない' },
                  { value: 'past', label: '過去にあった（駆除済）' },
                  { value: 'current', label: '現在ある' }
                ]}
              />
            </InputField>

            <InputField label="給排水管の故障" required>
              <RadioGroup
                name="pipe"
                value={formData.pipe}
                onChange={(value) => handleInputChange('pipe', value)}
                options={[
                  { value: 'no', label: '発見していない' },
                  { value: 'yes', label: '現在ある' }
                ]}
              />
              {formData.pipe === 'yes' && (
                <div className="mt-4">
                  <textarea
                    value={formData.pipeDetail}
                    onChange={(e) => handleInputChange('pipeDetail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="例：キッチンの水栓から少し水漏れがある"
                  />
                </div>
              )}
            </InputField>

            <InputField label="過去の火災・ボヤ" required>
              <RadioGroup
                name="fire"
                value={formData.fire}
                onChange={(value) => handleInputChange('fire', value)}
                options={[
                  { value: 'no', label: '無い' },
                  { value: 'yes', label: '有る' }
                ]}
              />
            </InputField>
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={prevSection} className={buttonStyles.secondary}>
              ← 戻る
            </button>
            <button onClick={nextSection} className={buttonStyles.primary}>
              次へ進む →
            </button>
          </div>
        </div>
      )}

      {/* セクション3: 付帯設備 */}
      {currentSection === 3 && (
        <div className="bg-white rounded-lg shadow p-6">
          <SectionHeader number={3} title="🚿 キッチン・水回り設備" color="bg-purple-100 text-purple-800" />

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">給湯設備</h3>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.waterHeater}
                      onChange={(e) => handleInputChange('waterHeater', e.target.checked)}
                      className="mr-2"
                    />
                    有り
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.waterHeaterDefect}
                      onChange={(e) => handleInputChange('waterHeaterDefect', e.target.checked)}
                      className="mr-2"
                    />
                    故障・不具合あり
                  </label>
                </div>
              </div>
              {formData.waterHeaterDefect && (
                <textarea
                  value={formData.waterHeaterDefectDetail}
                  onChange={(e) => handleInputChange('waterHeaterDefectDetail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="故障・不具合の詳細をご記入ください"
                />
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">キッチン設備</h3>
              <CheckboxGroup
                items={[
                  { key: 'sink', label: '流し台' },
                  { key: 'gasStove', label: 'ガスコンロ' },
                  { key: 'ihStove', label: 'IHコンロ' },
                  { key: 'rangeHood', label: 'レンジフード' },
                  { key: 'dishwasher', label: '食器洗い機' },
                  { key: 'waterFilter', label: '浄水器' }
                ]}
                values={formData.kitchen}
                onChange={(key, value) => handleNestedChange('kitchen', key, value)}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">浴室設備</h3>
              <CheckboxGroup
                items={[
                  { key: 'bathtub', label: '浴槽' },
                  { key: 'shower', label: 'シャワー' },
                  { key: 'reheating', label: '追い焚き機能' },
                  { key: 'bathDryer', label: '浴室乾燥機' }
                ]}
                values={formData.bathroom}
                onChange={(key, value) => handleNestedChange('bathroom', key, value)}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">トイレ設備</h3>
              <CheckboxGroup
                items={[
                  { key: 'toilet', label: '便器' },
                  { key: 'washlet', label: '温水洗浄便座' }
                ]}
                values={formData.toilet}
                onChange={(key, value) => handleNestedChange('toilet', key, value)}
              />
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={prevSection} className={buttonStyles.secondary}>
              ← 戻る
            </button>
            <button onClick={nextSection} className={buttonStyles.primary}>
              次へ進む →
            </button>
          </div>
        </div>
      )}

      {/* セクション4: その他設備 */}
      {currentSection === 4 && (
        <div className="bg-white rounded-lg shadow p-6">
          <SectionHeader number={4} title="🏠 その他の設備" color="bg-indigo-100 text-indigo-800" />

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">空調設備</h3>
              <CheckboxGroup
                items={[
                  { key: 'living', label: 'エアコン（リビング）' },
                  { key: 'bedroom', label: 'エアコン（寝室）' },
                  { key: 'other', label: 'エアコン（その他）' }
                ]}
                values={formData.aircon}
                onChange={(key, value) => handleNestedChange('aircon', key, value)}
              />
              <label className="flex items-center mt-3">
                <input
                  type="checkbox"
                  checked={formData.floorHeating}
                  onChange={(e) => handleInputChange('floorHeating', e.target.checked)}
                  className="mr-2"
                />
                床暖房
              </label>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">収納・建具</h3>
              <CheckboxGroup
                items={[
                  { key: 'closet', label: 'クローゼット' },
                  { key: 'shoeBox', label: '下駄箱' },
                  { key: 'screenDoor', label: '網戸' },
                  { key: 'fusuma', label: 'ふすま' }
                ]}
                values={formData.storage}
                onChange={(key, value) => handleNestedChange('storage', key, value)}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">その他</h3>
              <CheckboxGroup
                items={[
                  { key: 'intercom', label: 'インターホン' },
                  { key: 'tvAntenna', label: 'TV共視聴設備' },
                  { key: 'fireAlarm', label: '火災警報器' }
                ]}
                values={formData.other}
                onChange={(key, value) => handleNestedChange('other', key, value)}
              />
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={prevSection} className={buttonStyles.secondary}>
              ← 戻る
            </button>
            <button onClick={nextSection} className={buttonStyles.primary}>
              次へ進む →
            </button>
          </div>
        </div>
      )}

      {/* セクション5: 周辺環境 */}
      {currentSection === 5 && (
        <div className="bg-white rounded-lg shadow p-6">
          <SectionHeader number={5} title="🏘️ 周辺環境・その他の告知事項" color="bg-orange-100 text-orange-800" />

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>重要な告知事項</strong><br />
                  以下の項目は買主様の購入判断に影響する可能性があります。<br />
                  売主様が知っている情報は必ずご記入ください。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <InputField label="騒音・振動・臭気等">
              <RadioGroup
                name="noise"
                value={formData.noise}
                onChange={(value) => handleInputChange('noise', value)}
                options={[
                  { value: 'no', label: '特に無い' },
                  { value: 'yes', label: '有る' }
                ]}
              />
              {formData.noise === 'yes' && (
                <div className="mt-4">
                  <textarea
                    value={formData.noiseDetail}
                    onChange={(e) => handleInputChange('noiseDetail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="例：隣接する道路の交通音が気になることがある"
                  />
                </div>
              )}
            </InputField>

            <InputField label="過去の事件・事故等">
              <RadioGroup
                name="incident"
                value={formData.incident}
                onChange={(value) => handleInputChange('incident', value)}
                options={[
                  { value: 'no', label: '無い' },
                  { value: 'yes', label: '有る' }
                ]}
              />
              {formData.incident === 'yes' && (
                <div className="mt-4">
                  <textarea
                    value={formData.incidentDetail}
                    onChange={(e) => handleInputChange('incidentDetail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="内容をご記入ください"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                ※物件内や近隣で起きた事件・事故で、買主様にお伝えすべきと思われる事項
              </p>
            </InputField>

            <InputField label="近隣の建築計画">
              <RadioGroup
                name="construction"
                value={formData.construction}
                onChange={(value) => handleInputChange('construction', value)}
                options={[
                  { value: 'no', label: '知らない' },
                  { value: 'yes', label: '知っている' }
                ]}
              />
            </InputField>

            <InputField label="その他買主様にお伝えすべき事項">
              <textarea
                value={formData.otherNotes}
                onChange={(e) => handleInputChange('otherNotes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="その他、買主様にお伝えしておきたいことがあればご記入ください"
              />
            </InputField>
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={prevSection} className={buttonStyles.secondary}>
              ← 戻る
            </button>
            <button onClick={nextSection} className={buttonStyles.primary}>
              次へ進む →
            </button>
          </div>
        </div>
      )}

      {/* セクション6: 確認画面 */}
      {currentSection === 6 && (
        <div className="bg-white rounded-lg shadow p-6">
          <SectionHeader number={6} title="✅ 入力内容の確認" color="bg-green-100 text-green-800" />

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>最終確認</strong><br />
                  以下の内容で提出します。内容に間違いがないかご確認ください。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">基本情報</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">物件名:</span> {formData.propertyName || '未入力'}</div>
                <div><span className="font-medium">売主様:</span> {formData.sellerName || '未入力'}</div>
                <div><span className="font-medium">電話番号:</span> {formData.phoneNumber || '未入力'}</div>
                <div><span className="font-medium">使用状況:</span> {
                  formData.usage === 'self' ? '自己使用中' :
                  formData.usage === 'vacant' ? '空き家' :
                  formData.usage === 'rental' ? '賃貸中' : '未選択'
                }</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">物件状況</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">雨漏り:</span> {
                  formData.leak === 'no' ? '発見していない' :
                  formData.leak === 'past' ? '過去にあった（修繕済）' :
                  formData.leak === 'current' ? '現在ある' : '未選択'
                }</div>
                <div><span className="font-medium">シロアリ:</span> {
                  formData.termite === 'no' ? '発見していない' :
                  formData.termite === 'past' ? '過去にあった（駆除済）' :
                  formData.termite === 'current' ? '現在ある' : '未選択'
                }</div>
                <div><span className="font-medium">給排水管:</span> {
                  formData.pipe === 'no' ? '発見していない' :
                  formData.pipe === 'yes' ? '現在ある' : '未選択'
                }</div>
                <div><span className="font-medium">火災・ボヤ:</span> {
                  formData.fire === 'no' ? '無い' :
                  formData.fire === 'yes' ? '有る' : '未選択'
                }</div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input type="checkbox" id="agree" className="mr-3" />
              <span className="text-sm text-gray-700">
                上記の内容に間違いがないことを確認しました
              </span>
            </label>
          </div>

          <div className="flex justify-between">
            <button onClick={prevSection} className={buttonStyles.secondary}>
              ← 修正する
            </button>
            <button onClick={submitForm} className={buttonStyles.success}>
              送信する
            </button>
          </div>
        </div>
      )}

      {/* 戻るボタン */}
      <div className="mt-6">
        <Link
          href="/admin/documents"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          事務書類管理に戻る
        </Link>
      </div>
    </div>
  )
}
