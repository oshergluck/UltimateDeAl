// MyCoins.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CoinBox from '../components/CoinBox'
import { useStateContext } from '../context'

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3001'
const PINATA_GATEWAY_FALLBACK = 'bronze-sticky-guanaco-654.mypinata.cloud'

/* --------------------------- Fetch JSON -------------------------- */
const fetchJSON = async (url) => {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed ${res.status}`)
  return res.json()
}

/* -------- SAME helpers as RecentCoins (KEEP SAME IDEA) -------- */
const normalizeIpfsOrHttp = (u, pinataGateway, pinataToken) => {
  if (!u) return ''
  if (u.startsWith('ipfs://')) {
    const cidPath = u.slice('ipfs://'.length)
    // NOTE: in your RecentCoins you left base as `` (empty) by mistake,
    // but it still works because you mainly pass gateway urls.
    // Here we do the correct gateway build while keeping behavior consistent.
    const base = `https://${pinataGateway}/ipfs/${cidPath}`
    return pinataToken ? `${base}?pinataGatewayToken=${pinataToken}` : base
  }
  if (u.startsWith('//')) return `https:${u}`
  if (u.startsWith('http://') || u.startsWith('https://')) return u
  return `https://${u}`
}

const gatewayURLFromURI = (uri) => {
  if (!uri) return ''
  if (uri.startsWith('ipfs://')) return uri.replace('ipfs://', '')
  return uri
}

/* ----------------------------- UI ------------------------------- */

export default function MyCoins() {
  const navigate = useNavigate()
  const { address } = useStateContext()

  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const intervalRef = useRef(null)

  const pinataGateway = PINATA_GATEWAY_FALLBACK
  const pinataToken = import.meta.env.VITE_PINATA_API || ''

  /* -------------------- Enrich coin via URI --------------------- */
  const enrichCoinFromURI = useCallback(
    async (apiCoin) => {
      // Metadata (same flow as RecentCoins)
      let meta = { name: '', description: '', logo: '', banner: '', website: '', x: '', telegram: '' }

      try {
        const metaCID = gatewayURLFromURI(apiCoin.URI)
        if (metaCID) {
          const m = await fetchJSON(
            `https://${pinataGateway}/ipfs/${metaCID}${pinataToken ? `?pinataGatewayToken=${pinataToken}` : ''}`
          )

          const rawLogo = m?.media?.logo_gateway || m?.image || ''
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
        // ignore meta errors
      }

      const logoUrl = meta.logo

      // IMPORTANT: match RecentCoins output format for CoinBox:
      // CoinBox likely does: "https://" + logo
      // so we remove https:// here to avoid https://https://
      const logoForCoinBox = logoUrl
        ? logoUrl.substring(8) + (pinataToken ? `&pinataGatewayToken=${pinataToken}` : '')
        : ''

      return {
        address: apiCoin.address,
        name: meta.name || apiCoin.metaName || apiCoin.tokenName || 'Unknown',
        symbol: apiCoin.tokenSymbol || '',
        decimals: 18,

        price: BigInt(apiCoin.currentPrice || '0'),
        priceDecimals: 18,
        usdcReserve: BigInt(apiCoin.usdcReserve || '0'),
        tokenReserve: BigInt(apiCoin.tokenAReserve || '0'),
        percentagePurchased: apiCoin.percentagePurchased || 0,
        lpCreated: apiCoin.lpCreated || false,
        createdAt: apiCoin.createdAt || 0,
        totalVolume: BigInt(apiCoin.totalVolume || '0'),

        // ✅ This is what CoinBox expects (same as RecentCoins)
        logo: logoUrl ? logoUrl.substring(8) + `?pinataGatewayToken=${pinataToken}` : '',
      }
    },
    [pinataGateway, pinataToken]
  )

  /* ----------------------- Fetch user coins ---------------------- */
  const fetchUserCoins = useCallback(async () => {
    if (!address) return

    if (coins.length === 0) setLoading(true)
    setError('')

    try {
      const url = `${API_BASE_URL}/api/coins?creator=${address}&limit=100&sortBy=recent`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`API Error: ${res.status}`)
      const data = await res.json()

      const list = data.coins || []

      // Enrich in small batches like you did (avoid too many IPFS fetches at once)
      const BATCH_SIZE = 6
      const enriched = []

      for (let i = 0; i < list.length; i += BATCH_SIZE) {
        const batch = list.slice(i, i + BATCH_SIZE)
        const batchResults = await Promise.all(
          batch.map(async (c) => {
            try {
              return await enrichCoinFromURI(c)
            } catch (e) {
              // fallback: still show coin without logo
              return {
                address: c.address,
                name: c.metaName || c.tokenName || 'Unknown',
                symbol: c.tokenSymbol || '',
                decimals: 18,
                price: BigInt(c.currentPrice || '0'),
                priceDecimals: 18,
                usdcReserve: BigInt(c.usdcReserve || '0'),
                tokenReserve: BigInt(c.tokenAReserve || '0'),
                percentagePurchased: c.percentagePurchased || 0,
                lpCreated: c.lpCreated || false,
                createdAt: c.createdAt || 0,
                totalVolume: BigInt(c.totalVolume || '0'),
                logo: '',
              }
            }
          })
        )
        enriched.push(...batchResults)
      }

      setCoins(enriched)
    } catch (e) {
      console.error('Fetch error:', e)
      setError(`Failed to load your coins. ${e?.message || ''}`)
    } finally {
      setLoading(false)
    }
  }, [address, coins.length, enrichCoinFromURI])

  useEffect(() => {
    window.scrollTo(0, 0)

    fetchUserCoins()

    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(fetchUserCoins, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchUserCoins])

  return (
    <div className="min-h-screen py-8">
      <div className="sm:max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">My Created Coins</h1>
          <div className="text-white/60 text-sm">
            {address ? address.slice(0, 6) + '...' + address.slice(-4) : ''}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading && coins.length === 0 ? (
          <div className="text-white/80">Loading your coins...</div>
        ) : coins.length === 0 ? (
          <div className="text-white/60">You haven’t created any coins yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coins.map((c) => (
              <CoinBox
                key={c.address}
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
