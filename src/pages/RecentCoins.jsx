// RecentCoins.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import { createThirdwebClient, getContract, readContract } from 'thirdweb'
import { base } from 'thirdweb/chains'
import CoinBox from '../components/CoinBox'
import { useStateContext } from '../context'

/**
 * “Most Recent Active Coins” Page
 *
 * - Pulls from DEX: getMostRecentTXedCoinsByBatches(from, to)
 *   returns (address[] tokenAs, Coin[] coinInfos, uint256 totalActive)
 *   where Coin tuple is:
 *     (address tokenA,
 *      uint256 tokenAReserve,
 *      uint256 usdcReserve,
 *      uint256 totalPurchased,
 *      bool lpCreated,
 *      address creator,
 *      uint256 createdAt,
 *      uint256 totalVolume,
 *      string URI,
 *      uint256 creatorFeesUSDC,
 *      uint256 creatorFeesTokenA)
 *
 * - Shows 20 items, updates every 5s
 * - “Load More” appends +20 (same order) and keeps 5s refresh for the whole loaded window
 */



const PINATA_GATEWAY_FALLBACK = 'bronze-sticky-guanaco-654.mypinata.cloud'

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



const fetchJSON = async (url) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed meta ${res.status}`)
  return res.json()
}

export default function RecentCoins() {
  const navigate = useNavigate()
  const { client, dex } = useThirdweb()
  const {address} = useStateContext();
  const PAGE = 20
  const [limit, setLimit] = useState(PAGE) // how many to show (0..limit)
  const [totalActive, setTotalActive] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [coins, setCoins] = useState([]) // array of enriched items
  const intervalRef = useRef(null)

  const pinataGateway =PINATA_GATEWAY_FALLBACK
  const pinataToken = import.meta.env.VITE_PINATA_API || ''

  const POLYRPC = `https://8453.rpc.thirdweb.com/${import.meta.env.VITE_THIRDWEB_CLIENT}`
  const provider = useMemo(() => {
    return window.ethereum
      ? new ethers.providers.Web3Provider(window.ethereum)
      : new ethers.providers.JsonRpcProvider(POLYRPC)
  }, [POLYRPC])
  // Put these helpers near the top of the file (below fetchJSON is fine)
const normalizeIpfsOrHttp = (u, pinataGateway, pinataToken) => {
    if (!u) return ''
    // ipfs://CID or ipfs://CID/path
    if (u.startsWith('ipfs://')) {
      const cidPath = u.slice('ipfs://'.length) // CID or CID/...
      const base = `https://${pinataGateway}/ipfs/${cidPath}`
      return pinataToken ? `${base}?pinataGatewayToken=${pinataToken}` : base
    }
    // protocol-relative: //domain/path
    if (u.startsWith('//')) return `https:${u}`
    // already absolute http(s)
    if (u.startsWith('http://') || u.startsWith('https://')) return u
    // plain domain/path → make it https absolute
    return `https://${u}`
  }
  
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

  const gatewayURLFromURI = (uri) => {
    if (!uri) return ''
    // support ipfs://CID or direct http(s)
    if (uri.startsWith('ipfs://')) {
      const cid = uri.replace('ipfs://', '')
      console.log(cid);
      return `https://${PINATA_GATEWAY_FALLBACK}/ipfs/${cid}${pinataToken ? `?pinataGatewayToken=${pinataToken}` : ''}`
    }
    return uri
  }

  const parseCoinTuple = (tuple) => {
    // tuple indices aligned with the contract Coin struct
    return {
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
    }
  }

  const enrichBatch = async (addresses, coinInfos) => {
    // fetch token basics + metadata for each
    const tasks = addresses.map(async (addr, i) => {
      const c = parseCoinTuple(coinInfos[i])
      // get extra live info (current price & percentage) via getCoinInfo(address)
      // signature in your current contract:
      // returns (uint256,uint256,uint256,bool,uint256,uint256,string,uint256,uint256)
      const info = await readContract({
        contract: dex,
        method:
          'function getCoinInfo(address) view returns (uint256,uint256,uint256,bool,uint256,uint256,string,uint256,uint256)',
        params: [addr],
      })
      const coinInfoParsed = {
        tokenAReserve: BigInt(info[0] ?? c.tokenAReserve),
        usdcReserve: BigInt(info[1] ?? c.usdcReserve),
        totalPurchased: BigInt(info[2] ?? c.totalPurchased),
        lpCreated: Boolean(info[3] ?? c.lpCreated),
        percentagePurchased: Number(info[4] ?? 0),
        currentPrice: BigInt(info[5] ?? 0n), // 18 decimals per your contract
        URI: info[6] ?? c.URI,
        creatorFeesUSDC: BigInt(info[7] ?? c.creatorFeesUSDC),
        creatorFeesTokenA: BigInt(info[8] ?? c.creatorFeesTokenA),
      }

      // token basics
      let basics = { name: '', symbol: '', decimals: 18 }
      try {
        basics = await getTokenBasics(addr)
      } catch {
        // ignore
      }

      // metadata
      // metadata
let meta = { name: '', description: '', logo: '', banner: '', website: '', x: '', telegram: '' }
try {
  const metaURL = gatewayURLFromURI(coinInfoParsed.URI)
  if (metaURL) {
    console.log(metaURL);
    const m = await fetchJSON(`https://${pinataGateway}/ipfs/${metaURL}?pinataGatewayToken=${pinataToken}`)
    console.log(m);
    // prefer explicit *gateway* fields; fall back to common fields if needed
    const rawLogo = m?.media?.logo_gateway

    const rawBanner =
      m?.media?.banner_gateway ??
      m?.media?.banner ??
      ''

    meta = {
      name: m?.name || '',
      description: m?.description || '',
      // DO NOT strip protocol; normalize safely instead
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

// final logo url (already normalized; no extra https:// prefixing)
const logoUrl = meta.logo

      return {
        address: addr,
        name: meta.name || basics.name || '',
        symbol: basics.symbol || '',
        decimals: basics.decimals || 18,
        price: coinInfoParsed.currentPrice, // 18d
        priceDecimals: 18,
        usdcReserve: coinInfoParsed.usdcReserve, // 6d
        tokenReserve: coinInfoParsed.tokenAReserve, // token decimals
        percentagePurchased: coinInfoParsed.percentagePurchased,
        lpCreated: coinInfoParsed.lpCreated,
        createdAt: c.createdAt,
        totalVolume: c.totalVolume, // keep as provided (cumulative)
        logo: logoUrl.substring(8)+`?pinataGatewayToken=${pinataToken}`,
      }
    })
    return Promise.all(tasks)
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  },[]);

  const fetchWindow = useCallback(
    async (from, to) => {
      if (!dex) return { list: [], total: 0 }
      const result = await readContract({
        contract: dex,
        method:
          'function getMostRecentTXedCoinsByBatches(uint256,uint256) view returns (address[], (address,uint256,uint256,uint256,bool,address,uint256,uint256,string,uint256,uint256)[], uint256)',
        params: [from, to],
      })

      const addrs = result[0] || []
      const tuples = result[1] || []
      const total = Number(result[2] || 0)
      const enriched = await enrichBatch(addrs, tuples)
      return { list: enriched, total }
    },
    [dex]
  )

  const loadInitial = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { list, total } = await fetchWindow(0, limit)
      setCoins(list)
      setTotalActive(total)
    } catch (e) {
      setError('Failed to load recent coins')
    } finally {
      setLoading(false)
    }
  }, [fetchWindow, limit])

  const refreshTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(async () => {
      try {
        const { list, total } = await fetchWindow(0, limit)
        setCoins(list)     // keep same window size, just refresh
        setTotalActive(total)
      } catch {
        // ignore refresh errors
      }
    }, 5000)
  }, [fetchWindow, limit])

  const onLoadMore = async () => {
    const newLimit = limit + 20
    setLimit(newLimit)
    // fetch appended window and replace
    try {
      setLoading(true)
      const { list, total } = await fetchWindow(0, newLimit)
      setCoins(list)
      setTotalActive(total)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await loadInitial()
      if (!cancelled) refreshTimer()
    })()
    return () => {
      cancelled = true
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // mount once

  // Rebuild refresh timer when limit changes
  useEffect(() => {
    refreshTimer()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [limit, refreshTimer])

  return (
    <div className="min-h-screen linear-gradient1 py-8">
      <div className="sm:max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Most Recent Active Coins</h1>
          <div className="text-white/60 text-sm">
            Showing <span className="text-white">{Math.min(limit, totalActive)}</span> of{' '}
            <span className="text-white">{totalActive}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading && coins.length === 0 ? (
          <div className="text-white/80">Loading coins…</div>
        ) : (
          <>
            {coins.length === 0 ? (
              <div className="text-white/60">No active coins yet.</div>
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

            {limit < totalActive && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={onLoadMore}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
