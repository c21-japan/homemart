'use client'

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  fcp: number | null
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  })

  useEffect(() => {
    // パフォーマンス指標の取得
    const getPerformanceMetrics = () => {
      if ('PerformanceObserver' in window) {
        // First Contentful Paint (FCP)
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
          if (fcpEntry) {
            setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }))
          }
        })
        fcpObserver.observe({ entryTypes: ['paint'] })

        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          if (lastEntry) {
            setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fidEntry = entries[entries.length - 1] as PerformanceEventTiming
          if (fidEntry && 'processingStart' in fidEntry) {
            setMetrics(prev => ({ ...prev, fid: fidEntry.processingStart - fidEntry.startTime }))
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Cumulative Layout Shift (CLS)
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          setMetrics(prev => ({ ...prev, cls: clsValue }))
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // Time to First Byte (TTFB)
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigationEntry) {
          setMetrics(prev => ({ ...prev, ttfb: navigationEntry.responseStart - navigationEntry.requestStart }))
        }
      }
    }

    // ページ読み込み完了後にメトリクスを取得
    if (document.readyState === 'complete') {
      getPerformanceMetrics()
    } else {
      window.addEventListener('load', getPerformanceMetrics)
    }

    return () => {
      window.removeEventListener('load', getPerformanceMetrics)
    }
  }, [])

  // 開発環境でのみ表示
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const getPerformanceScore = (metric: keyof PerformanceMetrics): string => {
    const value = metrics[metric]
    if (value === null) return '測定中...'
    
    switch (metric) {
      case 'fcp':
        return value < 1800 ? '🟢 良好' : value < 3000 ? '🟡 要改善' : '🔴 不良'
      case 'lcp':
        return value < 2500 ? '🟢 良好' : value < 4000 ? '🟡 要改善' : '🔴 不良'
      case 'fid':
        return value < 100 ? '🟢 良好' : value < 300 ? '🟡 要改善' : '🔴 不良'
      case 'cls':
        return value < 0.1 ? '🟢 良好' : value < 0.25 ? '🟡 要改善' : '🔴 不良'
      case 'ttfb':
        return value < 800 ? '🟢 良好' : value < 1800 ? '🟡 要改善' : '🔴 不良'
      default:
        return '測定中...'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">パフォーマンス監視</h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">FCP:</span>
          <span className="font-mono">
            {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : '測定中...'}
          </span>
          <span>{getPerformanceScore('fcp')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">LCP:</span>
          <span className="font-mono">
            {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : '測定中...'}
          </span>
          <span>{getPerformanceScore('lcp')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">FID:</span>
          <span className="font-mono">
            {metrics.fid ? `${Math.round(metrics.fid)}ms` : '測定中...'}
          </span>
          <span>{getPerformanceScore('fid')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">CLS:</span>
          <span className="font-mono">
            {metrics.cls ? metrics.cls.toFixed(3) : '測定中...'}
          </span>
          <span>{getPerformanceScore('cls')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">TTFB:</span>
          <span className="font-mono">
            {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : '測定中...'}
          </span>
          <span>{getPerformanceScore('ttfb')}</span>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          開発環境でのみ表示されます
        </p>
      </div>
    </div>
  )
}
