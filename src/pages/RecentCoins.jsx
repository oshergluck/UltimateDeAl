// RecentCoins.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import { createThirdwebClient, getContract, readContract } from 'thirdweb'
import { base } from 'thirdweb/chains'
import CoinBox from '../components/CoinBox'
import { useStateContext } from '../context'

/**
 * Modernized "Most Recent Active Coins"
 * - GLOBAL on-chain search (case-insensitive) via searchCoinsAll(string)
 * - EXACT ORIGINAL IPFS/logo handling preserved (substring(8) etc.) — DO NOT CHANGE
 * - Sort & filters client-side
 * - Live auto-refresh (only when no active query)
 * - “Load More” shows more of the current list without duplicates
 */

const USE_INTERNAL_CARD = false // set true to use internal card instead of CoinBox
const PAGE_SIZE = 20
const REFRESH_MS = 5000
const PINATA_GATEWAY_FALLBACK = 'bronze-sticky-guanaco-654.mypinata.cloud'

/* ----------------------------- Utils ----------------------------- */

const classNames = (...xs) => xs.filter(Boolean).join(' ')
const shortAddr = (a = '') => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '')

const formatUSD6 = (n) => {
  if (n == null) return '—'
  const num = Number(n) / 1e6
  if (!isFinite(num)) return '—'
  return num >= 1000
    ? `$${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    : `$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

const formatDec18 = (n) => {
  if (n == null) return '—'
  const num = Number(n) / 1e18
  if (!isFinite(num)) return '—'
  if (num === 0) return '0'
  if (num < 0.000001) return num.toExponential(2)
  if (num < 1) return num.toLocaleString(undefined, { maximumFractionDigits: 8 })
  return num.toLocaleString(undefined, { maximumFractionDigits: 6 })
}

const formatPct = (p) => (p == null ? '—' : `${p.toFixed(1)}%`)

const debounce = (fn, ms = 300) => {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

// ensure uniqueness by address, preserving order
const dedupeByAddress = (arr) => {
  const seen = new Set()
  const out = []
  for (const it of arr) {
    if (!it?.address) continue
    if (seen.has(it.address.toLowerCase())) continue
    seen.add(it.address.toLowerCase())
    out.push(it)
  }
  return out
}

/* ------------------------- Thirdweb hook ------------------------- */

const useThirdweb = () => {
  const client = useMemo(
    () =>
      createThirdwebClient({
        clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || import.meta.env.VITE_THIRDWEB_CLIENT,
      }),
    []
  )
  const dex = useMemo(
    () =>
      getContract({
        client,
        chain: base,
        address: import.meta.env.VITE_DEX_ADDRESS,
      }),
    [client]
  )
  return { client, dex }
}

/* --------------------------- Fetch JSON -------------------------- */

const fetchJSON = async (url) => {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed meta ${res.status}`)
  return res.json()
}

/* ---------------------------- Component -------------------------- */

export default function RecentCoins() {
  const navigate = useNavigate()
  const { dex } = useThirdweb()
  const { address } = useStateContext()

  const [limit, setLimit] = useState(PAGE_SIZE)
  const [totalActive, setTotalActive] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [coins, setCoins] = useState([])
  const [rawCoins, setRawCoins] = useState([])
  const [animatingAddresses, setAnimatingAddresses] = useState(new Set())
  const [live, setLive] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(0)

  // Controls
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent') // 'recent' | 'volume' | 'price' | 'sold' | 'lp'
  const [filterLP, setFilterLP] = useState(false)
  const [filterLogo, setFilterLogo] = useState(false)
  const [density, setDensity] = useState('comfortable') // 'comfortable' | 'compact'
  const [view, setView] = useState('grid') // 'grid' | 'list'

  const pinataGateway = PINATA_GATEWAY_FALLBACK
  const pinataToken = import.meta.env.VITE_PINATA_API || ''

  const POLYRPC = `https://8453.rpc.thirdweb.com/${import.meta.env.VITE_THIRDWEB_CLIENT}`
  const provider = useMemo(() => {
    return window.ethereum
      ? new ethers.providers.Web3Provider(window.ethereum)
      : new ethers.providers.JsonRpcProvider(POLYRPC)
  }, [POLYRPC])

  const intervalRef = useRef(null)
  const prevCoinsRef = useRef([])

  /* -------- ORIGINAL helpers from your first code (KEEP EXACTLY) -------- */

  const normalizeIpfsOrHttp = (u, pinataGateway, pinataToken) => {
    if (!u) return ''
    if (u.startsWith('ipfs://')) {
      const cidPath = u.slice('ipfs://'.length)
      const base = `https://${pinataGateway}/ipfs/${cidPath}`
      return pinataToken ? `${base}?pinataGatewayToken=${pinataToken}` : base
    }
    if (u.startsWith('//')) return `https:${u}`
    if (u.startsWith('http://') || u.startsWith('https://')) return u
    return `https://${u}`
  }

  const gatewayURLFromURI = (uri) => {
    if (!uri) return ''
    if (uri.startsWith('ipfs://')) {
      const cid = uri.replace('ipfs://', '')
      return `https://${PINATA_GATEWAY_FALLBACK}/ipfs/${cid}${pinataToken ? `?pinataGatewayToken=${pinataToken}` : ''}`
    }
    return uri
  }

  /* -------------------------- EVM helpers ------------------------- */

  const getTokenBasics = async (tokenAddr) => {
    const erc20 = new ethers.Contract(
      tokenAddr,
      [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)',
      ],
      provider
    )
    const [name, symbol, decimals] = await Promise.all([erc20.name(), erc20.symbol(), erc20.decimals()])
    return { name, symbol, decimals: Number(decimals) }
  }

  const parseCoinTuple = (tuple) => ({
    tokenA: tuple[0],
    tokenAReserve: BigInt(tuple[1] ?? 0n),
    usdcReserve: BigInt(tuple[2] ?? 0n),
    totalPurchased: BigInt(tuple[3] ?? 0n),
    lpCreated: Boolean(tuple[4]),
    creator: tuple[5],
    createdAt: Number(tuple[6] ?? 0),
    totalVolume: BigInt(tuple[7] ?? 0n),
    URI: tuple[8] || '',
    creatorFeesUSDC: BigInt(tuple[9] ?? 0n),
    creatorFeesTokenA: BigInt(tuple[10] ?? 0n),
  })

  /* ----------------------- Data enrichment ------------------------ */

  const enrichBatch = async (addresses, coinInfos) => {
    const tasks = addresses.map(async (addr, i) => {
      const c = parseCoinTuple(coinInfos[i])

      // live coin info from contract
      let coinInfoParsed = {
        tokenAReserve: c.tokenAReserve,
        usdcReserve: c.usdcReserve,
        totalPurchased: c.totalPurchased,
        lpCreated: c.lpCreated,
        percentagePurchased: 0,
        currentPrice: 0n,
        URI: c.URI,
        creatorFeesUSDC: c.creatorFeesUSDC,
        creatorFeesTokenA: c.creatorFeesTokenA,
      }

      try {
        const info = await readContract({
          contract: dex,
          method:
            'function getCoinInfo(address) view returns (uint256,uint256,uint256,bool,uint256,uint256,string,uint256,uint256,uint256,uint256,address)',
          params: [addr],
        })
        // NOTE: if your getCoinInfo signature differs, adjust indexes accordingly
        coinInfoParsed = {
          tokenAReserve: BigInt(info[0] ?? c.tokenAReserve),
          usdcReserve: BigInt(info[1] ?? c.usdcReserve),
          totalPurchased: BigInt(info[2] ?? c.totalPurchased),
          lpCreated: Boolean(info[3] ?? c.lpCreated),
          percentagePurchased: Number(info[4] ?? 0),
          currentPrice: BigInt(info[5] ?? 0n),
          URI: info[6] ?? c.URI,
          creatorFeesUSDC: BigInt(info[7] ?? c.creatorFeesUSDC),
          creatorFeesTokenA: BigInt(info[8] ?? c.creatorFeesTokenA),
        }
      } catch {
        // keep c fallbacks
      }

      // token basics
      let basics = { name: '', symbol: '', decimals: 18 }
      try {
        basics = await getTokenBasics(addr)
      } catch {
        /* ignore */
      }

      // EXACT ORIGINAL META & LOGO FLOW (kept as-is)
      let meta = { name: '', description: '', logo: '', banner: '', website: '', x: '', telegram: '' }
      try {
        const metaURL = gatewayURLFromURI(coinInfoParsed.URI)
        if (metaURL) {
          // (Yes, this duplicates gateway in your original; kept EXACTLY.)
          const m = await fetchJSON(`https://${pinataGateway}/ipfs/${metaURL}?pinataGatewayToken=${pinataToken}`)
          const rawLogo = m?.media?.logo_gateway
          const rawBanner = m?.media?.banner_gateway ?? m?.media?.banner ?? ''

          meta = {
            name: m?.name || '',
            description: m?.description || '',
            logo: normalizeIpfsOrHttp(rawLogo, pinataGateway, pinataToken),
            banner: normalizeIpfsOrHttp(rawBanner, pinataGateway, pinataToken),
            website: m?.links?.website || '',
            x: m?.links?.x || '',
            telegram: m?.links?.telegram || '',
          }
        }
      } catch {
        /* ignore meta errors */
      }

      // final logo exactly as your original:
      const logoUrl = meta.logo

      return {
        address: addr,
        name: meta.name || basics.name || '',
        symbol: basics.symbol || '',
        decimals: basics.decimals || 18,
        price: coinInfoParsed.currentPrice, // 18d
        priceDecimals: 18,
        usdcReserve: coinInfoParsed.usdcReserve, // 6d
        tokenReserve: coinInfoParsed.tokenAReserve,
        percentagePurchased: coinInfoParsed.percentagePurchased,
        lpCreated: coinInfoParsed.lpCreated,
        createdAt: c.createdAt,
        totalVolume: c.totalVolume,
        logo: logoUrl ? logoUrl.substring(8) + `?pinataGatewayToken=${pinataToken}` : '', // <-- EXACT
      }
    })
    const enriched = await Promise.all(tasks)
    return dedupeByAddress(enriched)
  }

  /* --------------------------- Fetch window ----------------------- */

  const fetchWindow = useCallback(
    async (from, to) => {
      if (!dex) return { list: [], total: 0 }
      const result = await readContract({
        contract: dex,
        method:
          'function getMostRecentTXedCoinsByBatches(uint256,uint256) view returns (address[], (address,uint256,uint256,uint256,bool,address,uint256,uint256,string,uint256,uint256)[], uint256)',
        params: [from, to],
      })

      const addrs = result?.[0] || []
      const tuples = result?.[1] || []
      const total = Number(result?.[2] || 0)
      const enriched = await enrichBatch(addrs, tuples)
      return { list: enriched, total }
    },
    [dex]
  )

  // GLOBAL on-chain search (case-insensitive, returns ALL matches)
  const fetchSearchAll = useCallback(
    async (q) => {
      if (!dex) return { list: [], total: 0 }
      const result = await readContract({
        contract: dex,
        method:
          'function searchCoinsAll(string) view returns (address[], (address,uint256,uint256,uint256,bool,address,uint256,uint256,string,uint256,uint256)[], uint256)',
        params: [q],
      })

      const addrs = result?.[0] || []
      const tuples = result?.[1] || []
      const total = Number(result?.[2] || 0)
      const enriched = await enrichBatch(addrs, tuples) // ALL matches
      return { list: enriched, total }
    },
    [dex]
  )

  const loadInitial = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { list, total } = await fetchWindow(0, PAGE_SIZE)
      setRawCoins(list)         // full list for current mode
      setTotalActive(total)     // total count
      setLimit(PAGE_SIZE)       // show first page
      setLastUpdated(Date.now())
    } catch (e) {
      setError('Failed to load recent coins')
    } finally {
      setLoading(false)
    }
  }, [fetchWindow])

  const runRefresh = useCallback(async () => {
    if (query) return // do not refresh while searching
    try {
      const { list, total } = await fetchWindow(0, Math.max(PAGE_SIZE, limit))
      const prev = prevCoinsRef.current || []
      const mapPrev = new Map(prev.map((c, i) => [c.address, i]))
      const newAnim = new Set()
      list.forEach((c, i) => {
        const pi = mapPrev.get(c.address)
        if (pi === undefined || i < pi) newAnim.add(c.address)
      })
      if (newAnim.size > 0) {
        setAnimatingAddresses(newAnim)
        setTimeout(() => setAnimatingAddresses(new Set()), 600)
      }
      setRawCoins(list)
      setTotalActive(total)
      setLastUpdated(Date.now())
    } catch {
      /* ignore periodic errors */
    }
  }, [fetchWindow, limit, query])

  /* --------------------------- Effects ---------------------------- */

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await loadInitial()
      if (cancelled) return
      if (live && !query) {
        intervalRef.current && clearInterval(intervalRef.current)
        intervalRef.current = setInterval(runRefresh, REFRESH_MS)
      }
    })()
    return () => {
      cancelled = true
      intervalRef.current && clearInterval(intervalRef.current)
    }
  }, []) // mount once

  useEffect(() => {
    prevCoinsRef.current = rawCoins
  }, [rawCoins])

  useEffect(() => {
    // live auto-refresh while no search query
    intervalRef.current && clearInterval(intervalRef.current)
    if (live && !query) {
      intervalRef.current = setInterval(runRefresh, REFRESH_MS)
    }
    return () => {
      intervalRef.current && clearInterval(intervalRef.current)
    }
  }, [live, runRefresh, query])

  const onLoadMore = async () => {
    // just increase slice; DO NOT refetch (prevents duplicates)
    setLimit((x) => x + PAGE_SIZE)
  }

  /* --------------------- Client filters & sort --------------------- */

  const applyFiltersAndSort = useCallback(() => {
    // Base list from rawCoins (already in "recent tx" order from contract)
    let base = dedupeByAddress(rawCoins)

    // Apply filters
    if (filterLP) base = base.filter((c) => c.lpCreated === true)
    if (filterLogo) base = base.filter((c) => !!c.logo)

    let list = base

    // IMPORTANT:
    // - "recent": KEEP CONTRACT ORDER (no extra sort)
    // - others: clone & sort
    if (sortBy !== 'recent') {
      list = [...base]
      switch (sortBy) {
        case 'volume':
          list.sort((a, b) => {
            const av = a.totalVolume ?? 0n
            const bv = b.totalVolume ?? 0n
            if (av === bv) return 0
            return bv > av ? 1 : -1 // descending
          })
          break
        case 'price':
          list.sort((a, b) => {
            const ap = a.price ?? 0n
            const bp = b.price ?? 0n
            if (ap === bp) return 0
            return bp > ap ? 1 : -1 // descending
          })
          break
        case 'sold':
          list.sort((a, b) => (b.percentagePurchased || 0) - (a.percentagePurchased || 0))
          break
        case 'lp':
          list.sort((a, b) => Number(b.lpCreated) - Number(a.lpCreated))
          break
        default:
          // fallback: recent (keep as-is)
          break
      }
    }

    setCoins(list)
  }, [rawCoins, filterLP, filterLogo, sortBy])

  useEffect(() => {
    applyFiltersAndSort()
  }, [applyFiltersAndSort])

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) return '—'
    const d = new Date(lastUpdated)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }, [lastUpdated])

  /* ------------------------ Global search ------------------------- */

  // debounced global search caller
  const doSearch = useMemo(
    () =>
      debounce(async (v) => {
        const q = v.trim()
        setQuery(q)
        // disable live refresh while searching
        if (q && live) setLive(false)

        setLoading(true)
        try {
          if (q.length === 0) {
            // back to recent-mode window
            const { list, total } = await fetchWindow(0, PAGE_SIZE)
            setRawCoins(list)
            setTotalActive(total)
            setLimit(PAGE_SIZE)
          } else {
            // GLOBAL on-chain search (case-insensitive)
            const { list, total } = await fetchSearchAll(q)
            setRawCoins(list)      // ALL matches (deduped in enrichBatch)
            setTotalActive(total)
            setLimit(PAGE_SIZE)    // show first page only
          }
          setLastUpdated(Date.now())
        } catch {
          // keep silent here
        } finally {
          setLoading(false)
        }
      }, 300),
    [fetchWindow, fetchSearchAll, live]
  )

  /* ----------------------------- UI ------------------------------- */

  return (
    <div className="min-h-screen  py-6 md:py-8">
      <style>{`
        @keyframes popin {
          0% { transform: translateY(-6px) scale(0.98); opacity: 0.0; }
          60% { transform: translateY(0) scale(1.02); opacity: 1; }
          100% { transform: translateY(0) scale(1); }
        }
        .animate-pop-in { animation: popin 600ms cubic-bezier(.2,.8,.2,1); }
        .shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.12), rgba(255,255,255,.06));
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
        }
        @keyframes shimmer { 0% {background-position: 200% 0} 100% {background-position: -200% 0} }
      `}</style>

      <div className="mx-auto px-4 md:px-6 w-full sm:max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-5 md:mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Most Recent Active Coins</h1>
            <p className="text-white/60 text-sm mt-1">
              Showing <span className="text-white">{Math.min(limit, coins.length)}</span> of{' '}
              <span className="text-white">{coins.length}</span>
              {!query && live && (
                <span className="ml-2 inline-flex items-center gap-2 text-xs text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-white/60">
              Updated: <span className="text-white">{lastUpdatedLabel}</span>
            </div>
            <button
              onClick={() => setLive((v) => (!query ? !v : v))} // disable toggle while searching
              className={classNames(
                'px-3 py-2 rounded-lg text-sm border transition',
                !query && live
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-white/5 text-white/80 border-white/15 hover:bg-white/10'
              )}
              title={!query && live ? 'Auto-refresh is ON' : 'Auto-refresh is OFF'}
            >
              {!query && live ? 'Auto Refresh: On' : 'Auto Refresh: Off'}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-5 md:mb-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-60">
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20zM4 9.5C4 6.46 6.46 4 9.5 4S15 6.46 15 9.5 12.54 15 9.5 15 4 12.54 4 9.5" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, symbol, or address…"
                onChange={(e) => doSearch(e.target.value)}
                className="w-full bg-transparent outline-none text-white/90 placeholder:text-white/50 py-1"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <label className="text-xs text-white/60">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-800 text-white/90 outline-none mt-1 rounded-[8px] px-2 py-1"
              >
                <option value="recent" className="bg-gray-800">Most Recent</option>
                <option value="volume" className="bg-gray-800">Total Volume</option>
                <option value="price" className="bg-gray-800">Price</option>
                <option value="lp" className="bg-gray-800">LP Status</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between">
              <label className="text-xs text-white/60">LP Only</label>
              <button
                onClick={() => setFilterLP((v) => !v)}
                className={classNames(
                  'px-2 py-1 rounded-lg text-xs border transition',
                  filterLP ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40' : 'bg-white/5 text-white/70 border-white/10'
                )}
              >
                {filterLP ? 'On' : 'Off'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between">
              <label className="text-xs text-white/60">Has Logo</label>
              <button
                onClick={() => setFilterLogo((v) => !v)}
                className={classNames(
                  'px-2 py-1 rounded-lg text-xs border transition',
                  filterLogo ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40' : 'bg-white/5 text-white/70 border-white/10'
                )}
              >
                {filterLogo ? 'On' : 'Off'}
              </button>
            </div>
          </div>

          {/* View / Density */}
          <div className="lg:col-span-12 flex flex-wrap gap-2">
            <div className="bg-white/5 border border-white/10 rounded-xl px-2 py-1 flex items-center">
              <button
                onClick={() => setView('grid')}
                className={classNames('px-3 py-1 rounded-lg text-sm', view === 'grid' ? 'bg-white/10 text-white' : 'text-white/70')}
              >
                Grid
              </button>
              <button
                onClick={() => setView('list')}
                className={classNames('px-3 py-1 rounded-lg text-sm', view === 'list' ? 'bg-white/10 text-white' : 'text-white/70')}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadInitial}
              className="px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-100 hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {loading && rawCoins.length === 0 ? (
          <div className={classNames(view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-3')}>
            {Array.from({ length: Math.min(PAGE_SIZE, limit) }).map((_, i) => (
              <div key={i} className={classNames('rounded-2xl border border-white/10 bg-white/5 overflow-hidden', density === 'compact' ? 'p-3' : 'p-4')}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl shimmer" />
                  <div className="flex-1">
                    <div className="h-4 rounded shimmer w-1/3 mb-2" />
                    <div className="h-3 rounded shimmer w-1/2" />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="h-3 rounded shimmer" />
                  <div className="h-3 rounded shimmer" />
                  <div className="h-3 rounded shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : coins.length === 0 ? (
          <div className="text-white/70 bg-white/5 border border-white/10 rounded-2xl p-8 text-center">No active coins match your filters yet.</div>
        ) : (
          <Fragment>
            {USE_INTERNAL_CARD ? (
              <div className={classNames(view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-3')}>
                {coins.slice(0, limit).map((c) => (
                  <button
                    key={c.address}
                    onClick={() => navigate(`/coin/${c.address}`)}
                    className={classNames(
                      'text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.08] transition overflow-hidden',
                      density === 'compact' ? 'p-3' : 'p-4',
                      animatingAddresses.has(c.address) ? 'animate-pop-in' : ''
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={c.logo || '/favicon.ico'}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-white/10 bg-white/10"
                        onError={(e) => (e.currentTarget.src = '/favicon.ico')}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="truncate text-white font-medium">
                            {c.name || c.symbol || shortAddr(c.address)}
                          </div>
                          {c.lpCreated ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/30 text-emerald-300">LP</span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-400/10 border border-yellow-400/30 text-yellow-200">Curve</span>
                          )}
                        </div>
                        <div className="text-xs text-white/60 truncate">
                          {c.symbol ? `${c.symbol} · ` : ''}{shortAddr(c.address)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <Metric label="Price" value={formatDec18(c.price)} />
                      <Metric label="USDC Res." value={formatUSD6(c.usdcReserve)} />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className={classNames(view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-3')}>
                {coins.slice(0, limit).map((c) => (
                  <div key={c.address} className={classNames(animatingAddresses.has(c.address) ? 'animate-pop-in' : '')}>
                    <CoinBox
                      address={c.address}
                      name={c.name}
                      symbol={c.symbol}
                      decimals={c.decimals}
                      price={c.price}
                      priceDecimals={c.priceDecimals}
                      usdcReserve={c.usdcReserve}
                      tokenReserve={c.tokenReserve}
                      percentagePurchased={c.percentagePurchased}
                      lpCreated={c.lpCreated}
                      createdAt={c.createdAt}
                      totalVolume={c.totalVolume}
                      logo={c.logo} // EXACT original behavior preserved
                      onOpen={() => navigate(`/coin/${c.address}`)}
                    />
                  </div>
                ))}
              </div>
            )}

            {limit < coins.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={onLoadMore}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 inline-flex items-center gap-2"
                >
                  Load More
                </button>
              </div>
            )}
          </Fragment>
        )}
      </div>
    </div>
  )
}

/* ------------------------ Small subcomponents -------------------- */

function Metric({ label, value }) {
  return (
    <div className="bg-black/20 border border-white/10 rounded-xl px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-white/50">{label}</div>
      <div className="text-sm text-white truncate">{value}</div>
    </div>
  )
}
