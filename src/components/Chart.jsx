import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ethers } from 'ethers'
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts'

/**
 * CandleChart15mRolling (mobile-first)
 *
 * Props:
 *   transactions : [{ timestamp, tokenAAmount, usdcAmount }]
 *   bucketSeconds: number = 900   // 15 minutes
 *   windowHours  : number = 24
 *   height       : number = 420
 */
export default function CandleChart15mRolling({
  transactions = [],
  bucketSeconds = 900,
  windowHours = 24,
  height = 420,
}) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const candleSeriesRef = useRef(null)
  const volumeSeriesRef = useRef(null)
  const resizeObsRef = useRef(null)

  // Keep “now bucket” alive
  const [heartbeat, setHeartbeat] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setHeartbeat(h => h + 1), 5000)
    return () => clearInterval(id)
  }, [])

  // ---------- Tiny price formatter: 0.000005678 -> "0.0⁵678"
  const formatTinyPrice = (p) => {
    if (p == null || !Number.isFinite(p) || p <= 0) return '0'
    const str = Number(p).toFixed(12) // enough precision for micro prices
    if (!str.includes('.')) return str
    const [intPart, decPart] = str.split('.')
    const m = decPart.match(/^(0+)(\d+)/)
    if (m && m[1].length >= 3) {
      const zeros = m[1].length - 1 // keep one visible 0 after dot
      const rest = m[2].slice(0, 3) // next significant digits
      const superscripts = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹']
      const sup = String(zeros).split('').map(d => superscripts[d] ?? d).join('')
      return `0.0${sup}${rest}`
    }
    // fallback for “normal” smalls
    return Number(p).toPrecision(6)
  }

  // ---------- Normalize incoming transactions
  const txRows = useMemo(() => {
    const rows = (Array.isArray(transactions) ? transactions : [])
      .map((tx) => {
        try {
          let t = Number(tx.timestamp ?? 0n)
          if (t > 1e12) t = Math.floor(t / 1000) // ms -> sec
          if (!Number.isFinite(t) || t <= 0) return null

          const usdc = parseFloat(ethers.utils.formatUnits(String(tx.usdcAmount ?? 0n), 6))
          const token = parseFloat(ethers.utils.formatUnits(String(tx.tokenAAmount ?? 0n), 18))
          if (!Number.isFinite(usdc) || !Number.isFinite(token) || token <= 0) return null

          const price = usdc / token
          const vol = Math.abs(usdc)
          if (!Number.isFinite(price) || price <= 0) return null
          return { time: t, price, vol: Number.isFinite(vol) ? vol : 0 }
        } catch { return null }
      })
      .filter(Boolean)
      .sort((a, b) => a.time - b.time)
    return rows
  }, [transactions])

  // ---------- Window anchoring (first tx -> now)
  const { windowStartAligned, windowEndAligned } = useMemo(() => {
    const nowSec = Math.floor(Date.now() / 1000)
    const endAligned = Math.floor(nowSec / bucketSeconds) * bucketSeconds

    if (txRows.length === 0) {
      const winSec = Math.max(1, windowHours) * 3600
      const startAligned = Math.floor((endAligned - winSec) / bucketSeconds) * bucketSeconds
      return { windowStartAligned: startAligned, windowEndAligned: endAligned }
    }

    const firstTxBucket = Math.floor(txRows[0].time / bucketSeconds) * bucketSeconds
    return { windowStartAligned: firstTxBucket, windowEndAligned: endAligned }
  }, [txRows, bucketSeconds, windowHours, heartbeat])

  // ---------- Build candles (carry-forward open) + volumes
  const { candles, volumes, nowPrice } = useMemo(() => {
    const outC = []
    const outV = []
    const byBucket = new Map()
    for (const r of txRows) {
      if (r.time < windowStartAligned) continue
      const k = Math.floor(r.time / bucketSeconds) * bucketSeconds
      if (!byBucket.has(k)) byBucket.set(k, [])
      byBucket.get(k).push(r)
    }

    const lastKnownPrice = txRows.length ? txRows[txRows.length - 1].price : 0
    let prevClose = 0
    if (txRows.length) {
      const firstIn = txRows.find(r => r.time >= windowStartAligned)
      prevClose = firstIn ? firstIn.price : lastKnownPrice
    }
    const safeCarry = (x) => (Number.isFinite(x) && x > 0 ? x : (lastKnownPrice > 0 ? lastKnownPrice : 0))
    const eps = 1e-12

    for (let t = windowStartAligned; t <= windowEndAligned; t += bucketSeconds) {
      const arr = byBucket.get(t) || []

      let open = safeCarry(prevClose), high = open, low = open, close = open, volSum = 0
      if (arr.length) {
        for (const a of arr) {
          if (a.price > high) high = a.price
          if (a.price < low ) low  = a.price
          volSum += a.vol
        }
        close = arr[arr.length - 1].price
      }

      // Skip pre-first-trade empty bucket
      if (outC.length === 0 && arr.length === 0) continue

      outC.push({ time: t, open, high, low, close })
      outV.push({
        time: t,
        value: volSum,
        color:
          volSum > 0
            ? (close - open > eps
                ? 'rgba(16,185,129,0.70)'
                : (close - open < -eps ? 'rgba(239,68,68,0.70)' : 'rgba(160,160,160,0.55)'))
            : 'rgba(128,128,128,0.35)',
      })
      prevClose = close
    }

    const lastBar = outC[outC.length - 1]
    const currentPrice = lastBar ? lastBar.close : (lastKnownPrice || 0)
    return { candles: outC, volumes: outV, nowPrice: currentPrice }
  }, [txRows, bucketSeconds, windowStartAligned, windowEndAligned])

  // ---------- INIT CHART (mobile-first) ----------
  useEffect(() => {
    if (!containerRef.current) return
    if (chartRef.current?.remove) chartRef.current.remove()

    const width = containerRef.current.clientWidth
    const isMobile = width <= 640
    const chart = createChart(containerRef.current, {
      width,
      height: containerRef.current.clientHeight || height,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#e5e7eb',
        fontSize: isMobile ? 11 : 12,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.06)' },
        horzLines: { color: 'rgba(255,255,255,0.06)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.08)',
        scaleMargins: isMobile ? { top: 0.03, bottom: 0.22 } : { top: 0.05, bottom: 0.2 },
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.08)',
        timeVisible: true,
        secondsVisible: false,
        tickMarkMaxCharacterLength: isMobile ? 6 : 8,
        rightOffset: 2,
      },
      crosshair: { mode: 1 },
      // Apply tiny-price formatting globally (price scale & crosshair price labels)
      localization: { priceFormatter: formatTinyPrice },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, touch: true },
      handleScale:  { axisPressedMouseMove: true, pinch: true, mouseWheel: true },
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
      borderVisible: !isMobile ? true : false, // chunkier bodies on mobile
      wickVisible: true,
      // Custom formatter also for series values
      priceFormat: { type: 'custom', formatter: formatTinyPrice, minMove: 0.00000001 },
      lastValueVisible: true,
      priceLineVisible: true,
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: 'left',
      priceFormat: { type: 'volume' },
      lastValueVisible: false,
    })

    // Give volume a bit more room on mobile
    chart.priceScale('left').applyOptions({
      scaleMargins: isMobile ? { top: 0.78, bottom: 0 } : { top: 0.8, bottom: 0 },
      borderColor: 'rgba(255,255,255,0.08)',
    })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries

    // Responsive: show MORE bars on mobile with thicker candles
    const applyResponsiveBarSpacing = () => {
      if (!containerRef.current || !chartRef.current) return
      const w = containerRef.current.clientWidth
      const mobile = w <= 640
      const targetBars = mobile ? 110 : 120 // more bars on phones
      const spacing = Math.max(6, Math.min(14, Math.floor(w / targetBars))) // 6–14 px per bar
      chartRef.current.timeScale().applyOptions({ barSpacing: spacing })
    }
    applyResponsiveBarSpacing()

    const ro = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight || height,
      })
      applyResponsiveBarSpacing()
    })
    ro.observe(containerRef.current)
    resizeObsRef.current = ro

    return () => {
      try { resizeObsRef.current && containerRef.current && resizeObsRef.current.unobserve(containerRef.current) } catch {}
      resizeObsRef.current = null
      try { chartRef.current?.remove() } catch {}
      chartRef.current = null
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
    }
  }, [height])

  // ---------- Seed & live update ----------
  useEffect(() => {
    const cs = candleSeriesRef.current
    const vs = volumeSeriesRef.current
    const ch = chartRef.current
    if (!cs || !vs || !ch) return

    const n = candles.length
    if (!cs._seededOnce) {
      cs.setData(candles)
      vs.setData(volumes)
      cs._seededOnce = true
      cs._lastTime = n ? candles[n - 1].time : undefined
      ch.timeScale().fitContent()
      if (Number.isFinite(nowPrice) && nowPrice > 0) {
        cs.applyOptions({ priceLineColor: '#ffffff', priceLineWidth: 1, priceLineStyle: 1 })
      }
      return
    }

    if (!n) return
    const latestC = candles[n - 1]
    const latestV = volumes[n - 1]
    const lastTime = cs._lastTime

    if (lastTime === undefined) {
      cs.setData(candles); vs.setData(volumes)
      cs._lastTime = latestC.time
      ch.timeScale().fitContent()
      return
    }

    if (latestC.time === lastTime) {
      cs.update(latestC); vs.update(latestV)
    } else if (latestC.time > lastTime) {
      cs.update(latestC); vs.update(latestV)
      cs._lastTime = latestC.time
    } else {
      // Out-of-order: reset
      cs.setData(candles); vs.setData(volumes)
      cs._lastTime = latestC.time
    }
  }, [candles, volumes, nowPrice])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height, minHeight: height, position: 'relative' }}
      className="rounded-2xl overflow-hidden"
    />
  )
}
