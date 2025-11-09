import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import { createThirdwebClient, getContract, readContract } from 'thirdweb'
import { useReadContract } from 'thirdweb/react'
import { base } from 'thirdweb/chains'
import CoinBox from '../components/CoinBox'
import { useStateContext } from '../context'

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

export default function MyCoins() {
  const navigate = useNavigate()
  const { client, dex } = useThirdweb()
  const { address } = useStateContext()
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const intervalRef = useRef(null)

  const pinataGateway = import.meta.env.VITE_PINATA_GATEWAY || PINATA_GATEWAY_FALLBACK
  const pinataToken = import.meta.env.VITE_PINATA_API || ''

  const POLYRPC = `https://8453.rpc.thirdweb.com/${import.meta.env.VITE_THIRDWEB_CLIENT}`
  const provider = useMemo(() => {
    return window.ethereum
      ? new ethers.providers.Web3Provider(window.ethereum)
      : new ethers.providers.JsonRpcProvider(POLYRPC)
  }, [POLYRPC])

  const normalizeIpfsOrHttp = (u, pinataGateway, pinataToken) => {
    if (!u) return ''
    if (u.startsWith('ipfs://')) {
      const cidPath = u.slice('ipfs://'.length)
      console.log(u);
      const base = `https://${pinataGateway}/ipfs/${cidPath}`
      return pinataToken ? `${base}?pinataGatewayToken=${pinataToken}` : base
    }
    if (u.startsWith('//')) return `https:${u}`
    if (u.startsWith('http://') || u.startsWith('https://')) return u
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

  const PRICE_DECIMALS_18 = 18;
  useEffect(() => {
    window.scrollTo(0, 0);
  },[]);
const enrichCoins = async (coinTuples) => {
  const tasks = coinTuples.map(async (c) => {
    const parsed = {
      tokenA: c.tokenA,
      tokenAReserve: BigInt(c.tokenAReserve ?? 0n),
      usdcReserve: BigInt(c.usdcReserve ?? 0n),
      totalPurchased: BigInt(c.totalPurchased ?? 0n),
      lpCreated: Boolean(c.lpCreated),
      creator: c.creator,
      createdAt: Number(c.createdAt ?? 0),
      totalVolume: BigInt(c.totalVolume ?? 0n),
      URI: c.URI || '',
      creatorFeesUSDC: BigInt(c.creatorFeesUSDC ?? 0n),
      creatorFeesTokenA: BigInt(c.creatorFeesTokenA ?? 0n),
      virtualTokenReserve: BigInt(c.virtualTokenReserve ?? 0n),
      virtualUSDCReserve: BigInt(c.virtualUSDCReserve ?? 0n),
    };

    // token basics
    let basics = { name: '', symbol: '', decimals: 18 };
    try { basics = await getTokenBasics(parsed.tokenA); } catch {}

    // ---- KEEP YOUR EXISTING IPFS/METADATA CODE AS-IS ----
    let meta = { name: '', description: '', logo: '', banner: '' };
    try {
      if (parsed.URI) {
        const url = normalizeIpfsOrHttp(parsed.URI, pinataGateway, pinataToken);
        const m = await fetchJSON(`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${parsed.URI}/?pinataGatewayToken=${pinataToken}`);
        const rawLogo = m?.media?.logo_gateway;
        const rawBanner = m?.media?.banner_gateway;
        meta = {
          name: m?.name || basics.name,
          description: m?.description || '',
          logo: rawLogo.substring(8)+`?pinataGatewayToken=${pinataToken}`,
          banner: rawBanner.substring(8)+`?pinataGatewayToken=${pinataToken}`,
        };
      }
    } catch {}
    // -----------------------------------------------------

    // Align price with RecentCoins: read getCoinInfo()
    // returns (uint256 tokenAReserve, uint256 usdcReserve, uint256 totalPurchased,
    //          bool lpCreated, uint256 percentagePurchased, uint256 currentPrice(18d),
    //          string URI, uint256 creatorFeesUSDC, uint256 creatorFeesTokenA)
    let price18 = 0n;
    let liveTokenRes = parsed.tokenAReserve;
    let liveUsdcRes  = parsed.usdcReserve;
    let percentagePurchased = 0;

    try {
      const info = await readContract({
        contract: dex,
        method: 'function getCoinInfo(address) view returns (uint256,uint256,uint256,bool,uint256,uint256,string,uint256,uint256)',
        params: [parsed.tokenA],
      });

      liveTokenRes = BigInt(info[0] ?? liveTokenRes);
      liveUsdcRes  = BigInt(info[1] ?? liveUsdcRes);
      percentagePurchased = Number(info[4] ?? 0);
      price18 = BigInt(info[5] ?? 0n); // already 18 decimals, same as RecentCoins
    } catch {
      // Fallback if getCoinInfo unavailable: derive price with virtual reserves & correct decimals.
      // price(18d) = ( (usdc(6d)+virtUSDC) * 10^(18+decimals) ) / ( (token(dec)+virtToken) * 10^6 )
      const effToken = parsed.tokenAReserve + parsed.virtualTokenReserve;
      const effUSDC  = parsed.usdcReserve  + parsed.virtualUSDCReserve;
      if (effToken > 0n) {
        price18 = (effUSDC * (10n ** (18n + BigInt(basics.decimals)))) / (effToken * 10n ** 6n);
      }
    }

    return {
      address: parsed.tokenA,
      name: meta.name || basics.name,
      symbol: basics.symbol,
      decimals: basics.decimals,
      price: price18,                    // <- now matches RecentCoins
      priceDecimals: PRICE_DECIMALS_18,  // 18
      usdcReserve: liveUsdcRes,
      tokenReserve: liveTokenRes,
      percentagePurchased,
      lpCreated: parsed.lpCreated,
      createdAt: parsed.createdAt,
      totalVolume: parsed.totalVolume,
      logo: meta.logo,
    };
  });

  return Promise.all(tasks);
};

  
  const loadCoins = useCallback(async () => {
    if (!address || !dex) return
    setLoading(true)
    setError('')
    try {
      const result = await readContract({
        contract: dex,
        method:
          'function getAllCoinsCreated(address user) view returns ((address tokenA,uint256 tokenAReserve,uint256 usdcReserve,uint256 totalPurchased,bool lpCreated,address creator,uint256 createdAt,uint256 totalVolume,string URI,uint256 creatorFeesUSDC,uint256 creatorFeesTokenA,uint256 virtualTokenReserve,uint256 virtualUSDCReserve)[] userCoins)',
        params: [address],
      })
      const coinsRaw = result || []
      const enriched = await enrichCoins(coinsRaw)
      setCoins(enriched)
    } catch (e) {
      console.error(e)
      setError('Failed to load your coins.')
    } finally {
      setLoading(false)
    }
  }, [address, dex])

  useEffect(() => {
    loadCoins()
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      loadCoins()
    }, 5000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [loadCoins])

  return (
    <div className="min-h-screen linear-gradient1 py-8">
      <div className="sm:max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">My Created Coins</h1>
          <div className="text-white/60 text-sm">{address ? address.slice(0, 6) + '...' + address.slice(-4) : ''}</div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {loading && coins.length === 0 ? (
          <div className="text-white/80">Loading your coins…</div>
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
