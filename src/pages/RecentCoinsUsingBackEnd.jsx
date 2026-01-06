// RecentCoins_WithBackend_Fixed.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import CoinBox from '../components/CoinBox'
import { useStateContext } from '../context'

/**
 * BACKEND-POWERED "Most Recent Active Coins" - FIXED VERSION
 * - Uses backend API for fast coin listing
 * - Search works by passing query to backend
 * - Sort and filter work through backend API
 * - No RPC calls for listing (only for metadata)
 * - No gas limit issues
 */

const PAGE_SIZE = 20
const REFRESH_MS = 10000
const PINATA_GATEWAY_FALLBACK = 'bronze-sticky-guanaco-654.mypinata.cloud'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

console.log('🔗 Using API:', API_BASE)

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

const debounce = (fn, ms = 300) => {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

/* --------------------------- Fetch JSON -------------------------- */

const fetchJSON = async (url) => {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed ${res.status}`)
  return res.json()
}

/* ---------------------------- Component -------------------------- */

export default function RecentCoins() {
  const navigate = useNavigate()
  const { address } = useStateContext()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [coins, setCoins] = useState([])
  const [totalCoins, setTotalCoins] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [animatingAddresses, setAnimatingAddresses] = useState(new Set())
  const [live, setLive] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(0)

  // Controls
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [filterLP, setFilterLP] = useState(false)
  const [filterLogo, setFilterLogo] = useState(false)
  const [view, setView] = useState('grid')

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

  /* -------- ORIGINAL helpers (KEEP EXACTLY) -------- */

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
    try {
      const [name, symbol, decimals] = await Promise.all([
        erc20.name(),
        erc20.symbol(),
        erc20.decimals(),
      ])
      return { name, symbol, decimals: Number(decimals) }
    } catch (e) {
      console.warn('Failed to get token basics for', tokenAddr)
      return { name: '', symbol: '', decimals: 18 }
    }
  }

  /* ----------------------- Enrich coin data ----------------------- */

  const enrichCoin = async (apiCoin) => {
    // Token basics
    let basics = { name: '', symbol: '', decimals: 18 }
    try {
      basics = await getTokenBasics(apiCoin.address)
    } catch {
      /* ignore */
    }

    // Metadata (EXACT ORIGINAL flow)
    let meta = { name: '', description: '', logo: '', banner: '', website: '', x: '', telegram: '' }
    try {
      const metaURL = gatewayURLFromURI(apiCoin.URI)
      if (metaURL) {
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

    const logoUrl = meta.logo

    return {
      address: apiCoin.address,
      name: meta.name || basics.name || '',
      symbol: basics.symbol || '',
      decimals: basics.decimals || 18,
      price: BigInt(apiCoin.currentPrice || '0'),
      priceDecimals: 18,
      usdcReserve: BigInt(apiCoin.usdcReserve || '0'),
      tokenReserve: BigInt(apiCoin.tokenAReserve || '0'),
      percentagePurchased: apiCoin.percentagePurchased || 0,
      lpCreated: apiCoin.lpCreated || false,
      createdAt: apiCoin.createdAt || 0,
      totalVolume: BigInt(apiCoin.totalVolume || '0'),
      lastActivity: apiCoin.lastActivity || 0,
      logo: logoUrl ? logoUrl.substring(8) + `?pinataGatewayToken=${pinataToken}` : '',
    }
  }

  /* --------------------------- Load coins ------------------------- */

  const loadCoins = useCallback(async (pageNum = 1, searchQuery = '') => {
    setLoading(true)
    setError('')

    try {
      console.log('🔍 Loading coins:', { pageNum, searchQuery, sortBy, filterLP, filterLogo })

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: PAGE_SIZE.toString(),
        sortBy,
      })

      // Add search query if provided
      if (searchQuery && searchQuery.trim()) {
        params.set('search', searchQuery.trim())
      }

      // Add filters
      if (filterLP) {
        params.set('lpOnly', 'true')
      }
      if (filterLogo) {
        params.set('hasLogo', 'true')
      }

      const url = `${API_BASE}/api/coins?${params.toString()}`
      console.log('  API URL:', url)

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('  Response:', {
        total: data.total,
        coinsReturned: data.coins.length,
        page: data.page,
        totalPages: data.totalPages,
      })

      // Enrich coins with token metadata (in parallel batches)
      const BATCH_SIZE = 5
      const enriched = []
      
      for (let i = 0; i < data.coins.length; i += BATCH_SIZE) {
        const batch = data.coins.slice(i, i + BATCH_SIZE)
        const batchResults = await Promise.all(
          batch.map((c) => enrichCoin(c).catch((e) => {
            console.error('Error enriching coin:', c.address, e.message)
            return null
          }))
        )
        enriched.push(...batchResults.filter(Boolean))
      }

      setCoins(enriched)
      setTotalCoins(data.total)
      setCurrentPage(data.page)
      setTotalPages(data.totalPages)
      setLastUpdated(data.lastUpdated || Date.now())
      
      console.log('✅ Loaded', enriched.length, 'coins')
    } catch (e) {
      console.error('❌ Error loading coins:', e)
      setError(`Failed to load coins: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }, [sortBy, filterLP, filterLogo, pinataGateway, pinataToken, provider])

  /* ----------------------- Search debouncing ---------------------- */

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [query])

  /* ----------------------- Load on mount and changes -------------- */

  // Load coins when filters, sort, or search changes
  useEffect(() => {
    console.log('🔄 Reloading due to change:', { debouncedQuery, sortBy, filterLP, filterLogo })
    loadCoins(1, debouncedQuery)
    
    // Disable live updates when searching
    if (debouncedQuery) {
      setLive(false)
    }
  }, [debouncedQuery, sortBy, filterLP, filterLogo, loadCoins])

  /* ----------------------- Auto-refresh (live mode) --------------- */

  const runRefresh = useCallback(async () => {
    if (!live || debouncedQuery) return
    
    try {
      const prev = prevCoinsRef.current || []
      await loadCoins(currentPage, debouncedQuery)
      
      // Detect new coins for animation
      const prevAddrs = new Set(prev.map((c) => c.address))
      const newAnim = new Set()
      coins.forEach((c) => {
        if (!prevAddrs.has(c.address)) {
          newAnim.add(c.address)
        }
      })
      
      if (newAnim.size > 0) {
        setAnimatingAddresses(newAnim)
        setTimeout(() => setAnimatingAddresses(new Set()), 600)
      }
    } catch (e) {
      console.error('Refresh error:', e)
    }
  }, [live, debouncedQuery, loadCoins, currentPage, coins])

  useEffect(() => {
    prevCoinsRef.current = coins
  }, [coins])

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    if (live && !debouncedQuery) {
      intervalRef.current = setInterval(runRefresh, REFRESH_MS)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [live, runRefresh, debouncedQuery])

  /* ------------------------- Pagination --------------------------- */

  const onLoadMore = () => {
    const nextPage = currentPage + 1
    if (nextPage <= totalPages) {
      loadCoins(nextPage, debouncedQuery)
    }
  }

  const onPageChange = (pageNum) => {
    loadCoins(pageNum, debouncedQuery)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ------------------------- Format helpers ----------------------- */

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) return '—'
    const d = new Date(lastUpdated)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }, [lastUpdated])

  /* ----------------------------- UI ------------------------------- */

  return (
    <div className="min-h-screen py-6 md:py-8">
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-5 md:mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Most Recent Active Coins</h1>
            <p className="text-white/60 text-sm mt-1">
              {debouncedQuery ? (
                <>
                  Search results for "<span className="text-white">{debouncedQuery}</span>" - {' '}
                  <span className="text-white">{totalCoins}</span> {totalCoins === 1 ? 'coin' : 'coins'} found
                </>
              ) : (
                <>
                  Showing <span className="text-white">{coins.length}</span> of{' '}
                  <span className="text-white">{totalCoins}</span> coins
                </>
              )}
              {!debouncedQuery && live && (
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
              onClick={() => setLive((v) => (!debouncedQuery ? !v : v))}
              disabled={!!debouncedQuery}
              className={classNames(
                'px-3 py-2 rounded-lg text-sm border transition',
                !debouncedQuery && live
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-white/5 text-white/80 border-white/15 hover:bg-white/10',
                debouncedQuery ? 'opacity-50 cursor-not-allowed' : ''
              )}
            >
              {!debouncedQuery && live ? 'Auto Refresh: On' : 'Auto Refresh: Off'}
            </button>
          </div>
        </div>

        <div className="mb-5 md:mb-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-60">
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20zM4 9.5C4 6.46 6.46 4 9.5 4S15 6.46 15 9.5 12.54 15 9.5 15 4 12.54 4 9.5" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, symbol, or address…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-white/90 placeholder:text-white/50 py-1"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-white/60 hover:text-white/90 transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

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

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
            <div className="font-semibold mb-2">⚠️ {error}</div>
            <button
              onClick={() => loadCoins(1, debouncedQuery)}
              className="px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-100 hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        )}

        {loading && coins.length === 0 ? (
          <div className={classNames(view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-3')}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden p-4">
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
          <div className="text-white/70 bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            {debouncedQuery ? (
              <>
                <p className="text-lg mb-2">No coins found matching "{debouncedQuery}"</p>
                <button
                  onClick={() => setQuery('')}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 mt-2"
                >
                  Clear Search
                </button>
              </>
            ) : (
              'No coins found. Create one using depositCoin().'
            )}
          </div>
        ) : (
          <Fragment>
            <div className={classNames(view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-3')}>
              {coins.map((c) => (
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
                    logo={c.logo}
                    onOpen={() => navigate(`/coin/${c.address}`)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={classNames(
                    'px-3 py-2 rounded-lg border transition',
                    currentPage === 1
                      ? 'bg-white/5 text-white/30 border-white/10 cursor-not-allowed'
                      : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
                  )}
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={classNames(
                          'w-10 h-10 rounded-lg border transition',
                          currentPage === pageNum
                            ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40'
                            : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
                        )}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={classNames(
                    'px-3 py-2 rounded-lg border transition',
                    currentPage === totalPages
                      ? 'bg-white/5 text-white/30 border-white/10 cursor-not-allowed'
                      : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
                  )}
                >
                  Next
                </button>
              </div>
            )}

            <div className="text-center text-white/60 text-sm mt-4">
              Page {currentPage} of {totalPages} • {totalCoins} total coins
            </div>
          </Fragment>
        )}
      </div>
    </div>
  )
}