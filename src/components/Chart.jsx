import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ethers } from 'ethers'
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts'

/**
 * CandleChart15mRolling
 *
 * Props:
 *   transactions : [{ timestamp: bigint|number, tokenAAmount: bigint(18d), usdcAmount: bigint(6d) }]
 *   bucketSeconds: number = 900  // 15 minutes
 *   windowHours  : number = 24   // rolling time window
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

  // Heartbeat to keep the “current bucket” alive and sliding
  const [heartbeat, setHeartbeat] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setHeartbeat(h => h + 1), 5000)
    return () => clearInterval(id)
  }, [])

  // ---- Normalize + sort tx rows (price = USDC / token); fix ms→sec ----
  const txRows = useMemo(() => {
    const rows = (Array.isArray(transactions) ? transactions : [])
      .map((tx) => {
        try {
          let t = Number(tx.timestamp ?? 0n)
          if (t > 1e12) t = Math.floor(t / 1000) // ms -> sec
          if (!Number.isFinite(t) || t <= 0) return null

          // NOTE: using ethers v5 utils style here (as in your snippet)
          const usdc = parseFloat(
            ethers.utils.formatUnits(String(tx.usdcAmount ?? 0n), 6)
          )
          const token = parseFloat(
            ethers.utils.formatUnits(String(tx.tokenAAmount ?? 0n), 18)
          )
          if (!Number.isFinite(usdc) || !Number.isFinite(token) || token <= 0) return null

          const p = usdc / token
          const v = Math.abs(usdc)
          if (!Number.isFinite(p) || p <= 0) return null
          return { time: t, price: p, vol: Number.isFinite(v) ? v : 0 }
        } catch {
          return null
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.time - b.time)
    return rows
  }, [transactions])

  // ---- Rolling window [start, end] aligned to bucket; ALWAYS include NOW bucket ----
  const { windowStartAligned, windowEndAligned } = useMemo(() => {
    const nowSec = Math.floor(Date.now() / 1000)
    const endAligned = Math.floor(nowSec / bucketSeconds) * bucketSeconds  // pin to *current* bucket
    const winSec = Math.max(1, windowHours) * 3600
    const startAligned = Math.floor((endAligned - winSec) / bucketSeconds) * bucketSeconds
    return { windowStartAligned: startAligned, windowEndAligned: endAligned }
  }, [bucketSeconds, windowHours, heartbeat])

  // ---- Build continuous 15m candles; last bucket mirrors most recent price (true “now”) ----
  const { candles, volumes, nowPrice } = useMemo(() => {
    const outC = []
    const outV = []

    // Map tx by bucket
    const byBucket = new Map()
    for (const r of txRows) {
      if (r.time < windowStartAligned) continue
      const k = Math.floor(r.time / bucketSeconds) * bucketSeconds
      if (!byBucket.has(k)) byBucket.set(k, [])
      byBucket.get(k).push(r)
    }

    // Find the latest known trade price up to (and including) end
    let lastKnownPrice = 0
    if (txRows.length) {
      const last = txRows[txRows.length - 1]
      lastKnownPrice = last.price
    }

    // Seed prevClose as last price <= windowStart, else first inside window, else lastKnownPrice
    let prevClose = 0
    if (txRows.length) {
      for (let i = txRows.length - 1; i >= 0; i--) {
        if (txRows[i].time <= windowStartAligned) {
          prevClose = txRows[i].price
          break
        }
      }
      if (prevClose === 0) {
        const firstIn = txRows.find(r => r.time >= windowStartAligned)
        prevClose = firstIn ? firstIn.price : (lastKnownPrice || 0)
      }
    }

    const eps = 1e-12

    for (let t = windowStartAligned; t <= windowEndAligned; t += bucketSeconds) {
      const arr = byBucket.get(t) || []
      let open, high, low, close, volSum

      if (arr.length) {
        open = arr[0].price
        close = arr[arr.length - 1].price
        high = open
        low = open
        volSum = 0
        for (const a of arr) {
          if (a.price > high) high = a.price
          if (a.price < low) low = a.price
          volSum += a.vol
        }
        prevClose = close
      } else {
        // No trades this bucket → carry forward last price we knew
        const carry = prevClose || lastKnownPrice || 0
        open = carry
        high = carry
        low  = carry
        close = carry
        volSum = 0
      }

      outC.push({ time: t, open, high, low, close })
      outV.push({
        time: t,
        value: volSum,
        color:
          volSum > 0
            ? (close - open > eps
                ? 'rgba(8,153,129,0.65)'
                : (close - open < -eps ? 'rgba(242,54,69,0.65)' : 'rgba(160,160,160,0.55)'))
            : 'rgba(128,128,128,0.35)',
      })
    }

    // Ensure at least 2 bars (lib likes a bit of history)
    if (outC.length === 1) {
      const only = outC[0]
      const padT = only.time - bucketSeconds
      outC.unshift({ time: padT, open: only.open, high: only.open, low: only.open, close: only.open })
      outV.unshift({ time: padT, value: 0, color: 'rgba(128,128,128,0.35)' })
    }

    const lastBar = outC[outC.length - 1]
    const currentPrice = lastBar ? lastBar.close : (lastKnownPrice || 0)

    return { candles: outC, volumes: outV, nowPrice: currentPrice }
  }, [txRows, bucketSeconds, windowStartAligned, windowEndAligned])

  // ---- Init chart once ----
  useEffect(() => {
    if (!containerRef.current) return
    if (chartRef.current?.remove) chartRef.current.remove()

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || height,
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#d1d4dc' },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.06)' },
        horzLines: { color: 'rgba(255,255,255,0.06)' },
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
      crosshair: { mode: 1 },
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#089981',
      downColor: '#F23645',
      borderUpColor: '#089981',
      borderDownColor: '#F23645',
      wickUpColor: '#089981',
      wickDownColor: '#F23645',
      // Higher precision so “now” isn’t rounded away
      priceFormat: { type: 'price', precision: 10, minMove: 0.0000000001 },
      lastValueVisible: true,
      priceLineVisible: true,
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: 'left',
      priceFormat: { type: 'volume' },
      lastValueVisible: false,
    })

    // 80% candles, 20% volume
    chart.priceScale('right').applyOptions({ scaleMargins: { top: 0.05, bottom: 0.2 } })
    chart.priceScale('left').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
      borderColor: 'rgba(255,255,255,0.1)',
    })

    // Responsive
    const ro = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight || height,
      })
    })
    ro.observe(containerRef.current)

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries
    resizeObsRef.current = ro

    return () => {
      try {
        if (resizeObsRef.current && containerRef.current) {
          resizeObsRef.current.unobserve(containerRef.current)
        }
      } catch {}
      resizeObsRef.current = null
      try { chartRef.current?.remove() } catch {}
      chartRef.current = null
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
    }
  }, [height])

  // ---- Seed + update series (includes current bucket) ----
  useEffect(() => {
    const cs = candleSeriesRef.current
    const vs = volumeSeriesRef.current
    const ch = chartRef.current
    if (!cs || !vs || !ch) return

    const n = candles.length
    const spacing = n <= 30 ? 18 : n <= 100 ? 12 : n <= 300 ? 8 : 6
    ch.timeScale().applyOptions({ barSpacing: spacing })

    if (!cs._seededOnce) {
      cs.setData(candles)
      vs.setData(volumes)
      cs._seededOnce = true
      cs._lastTime = n ? candles[n - 1].time : undefined
      ch.timeScale().fitContent()
      // draw a price line for “now”
      if (Number.isFinite(nowPrice) && nowPrice > 0) {
        cs.applyOptions({
          priceLineColor: '#ffffff',
          priceLineWidth: 1,
          priceLineStyle: 1,
        })
      }
      return
    }

    if (!n) return
    const latestC = candles[n - 1]
    const latestV = volumes[n - 1]
    const lastTime = cs._lastTime

    if (lastTime === undefined) {
      cs.setData(candles)
      vs.setData(volumes)
      cs._lastTime = latestC.time
      return
    }

    // Same-bucket tick → update; next bucket → append via update(newer time)
    if (latestC.time === lastTime) {
      cs.update(latestC)
      vs.update(latestV)
    } else if (latestC.time > lastTime) {
      cs.update(latestC) // appends when time is newer
      vs.update(latestV)
      cs._lastTime = latestC.time
    } else {
      // Out-of-order safety fallback
      cs.setData(candles)
      vs.setData(volumes)
      cs._lastTime = latestC.time
    }
  }, [candles, volumes, nowPrice])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height, minHeight: height, position: 'relative' }}
    />
  )
}
