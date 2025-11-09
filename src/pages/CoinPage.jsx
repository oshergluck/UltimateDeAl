// CoinPage.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import { TransactionButton } from 'thirdweb/react'
import { createThirdwebClient, getContract, prepareContractCall, readContract } from 'thirdweb'
import { base } from 'thirdweb/chains'
import { PinataSDK } from 'pinata'
import { IPFSMediaViewer, CandleChart15mAdvanced } from '../components'
import { usdcoinusdclogo } from '../assets'
import { useStateContext } from '../context'

const CoinPage = () => {
  const { tokenAddress } = useParams()
  const navigate = useNavigate()
  const { address } = useStateContext()

  // ENV / consts
  const DEX_ADDRESS = import.meta.env.VITE_DEX_ADDRESS
  const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT
  const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`
  const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

  // thirdweb + pinata
  const client = useMemo(
    () => createThirdwebClient({ clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || import.meta.env.VITE_THIRDWEB_CLIENT }),
    []
  )
  const pinata = useMemo(
    () =>
      new PinataSDK({
        pinataJwt: import.meta.env.VITE_PINATA_JWT,
        pinataGateway: import.meta.env.VITE_PINATA_GATEWAY || 'bronze-sticky-guanaco-654.mypinata.cloud',
      }),
    []
  )

  const dex = useMemo(() => getContract({ client, chain: base, address: DEX_ADDRESS }), [client, DEX_ADDRESS])
  const usdcContract = useMemo(() => getContract({ client: client, chain: base, address: USDC }), [client])
  const tokenContract = useMemo(() => getContract({ client: client, chain: base, address: tokenAddress }), [client, tokenAddress])

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [activeTab, setActiveTab] = useState('buy')
  const [balanceT, setBalanceT] = useState(0)
  const [balanceUSDC, setBalanceUSDC] = useState(0)

  // Data slices
  const [tokenInfo, setTokenInfo] = useState({ name: '', symbol: '', decimals: 18, totalSupply: '0' })
  const [coinData, setCoinData] = useState({
    tokenAReserve: 0n,
    usdcReserve: 0n,
    totalPurchased: 0n,
    lpCreated: false,
    percentagePurchased: 0,
    currentPrice: 0n,
    URI: '',
    creatorFeesUSDC: 0n,
    creatorFeesTokenA: 0n,
    virtualTokenReserve: 0n,
    virtualUSDCReserve: 0n,
    creator: '',
  })
  const [metadata, setMetadata] = useState({
    name: '',
    description: '',
    logo: '',
    banner: '',
    website: '',
    x: '',
    telegram: '',
  })
  const [transactions, setTransactions] = useState([])
  const [holders, setHolders] = useState([])

  // Refresh “signals” (only re-fetch slices that change)
  const [txTick, setTxTick] = useState(0) // triggers re-fetch of transactions (and chart)
  const [infoTick, setInfoTick] = useState(0) // triggers re-fetch of coin info (price/reserves)
  const [autoRefreshTick, setAutoRefreshTick] = useState(0)
  const [buyQuote, setBuyQuote] = useState({
    tokenOut: 0n, platformFee: 0n, creatorFee: 0n, usdcNet: 0n,
    pricePerTokenGross: 0n, enoughTokenLiquidity: false
  })
  const [sellQuote, setSellQuote] = useState({
    usdcGross: 0n, platformFee: 0n, creatorFee: 0n, usdcNet: 0n,
    pricePerTokenGross: 0n, enoughUSDCReserve: true
  })
  
  const [buyAmount, setBuyAmount] = useState('')
  const [sellAmount, setSellAmount] = useState('')
  const [buyPreview, setBuyPreview] = useState({ tokens: '0', fees: '0' })
  const [sellPreview, setSellPreview] = useState({ usdc: '0', fees: '0' })

  // ---------- helpers ----------
  const formatUnits = (value, decimals, maxDecimals = 3) => {
    try {
      const formatted = ethers.utils.formatUnits(value?.toString?.() ?? value, decimals)
      const parts = formatted.split('.')
      if (parts.length === 2 && parts[1].length > maxDecimals) return `${parts[0]}.${parts[1].substring(0, maxDecimals)}`
      return formatted
    } catch {
      return '0'
    }
  }

  const formatCurrency = (value, decimals = 6) => {
    const formatted = formatUnits(value, decimals, 8)
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 }).format(formatted)
  }

  const formatPriceFull = (value, decimals = 12, maxDecimals = 18) => {
    try {
      const s = ethers.utils.formatUnits(value?.toString?.() ?? value, decimals)
      const [intp, fracp = ''] = s.split('.')
      const frac = fracp.slice(0, maxDecimals).replace(/0+$/, '')
      return frac.length ? `${intp}.${frac}` : intp
    } catch {
      return '0'
    }
  }

  // ---------- fetchers ----------
  const fetchTokenBasics = async () => {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      readContract({ contract: tokenContract, method: 'function name() view returns (string)', params: [] }),
      readContract({ contract: tokenContract, method: 'function symbol() view returns (string)', params: [] }),
      readContract({ contract: tokenContract, method: 'function decimals() view returns (uint8)', params: [] }),
      readContract({ contract: tokenContract, method: 'function totalSupply() view returns (uint256)', params: [] }),
    ])

    setTokenInfo({ name, symbol, decimals: Number(decimals), totalSupply })
  }

  const fetchCoinInfo = async () => {
    const coinInfo = await readContract({
      contract: dex,
      method:
        'function getCoinInfo(address) view returns (uint256,uint256,uint256,bool,uint256,uint256,string,uint256,uint256,uint256,uint256,address)',
      params: [tokenAddress],
    })
    setCoinData({
      tokenAReserve: coinInfo[0],
      usdcReserve: coinInfo[1],
      totalPurchased: coinInfo[2],
      lpCreated: coinInfo[3],
      percentagePurchased: Number(coinInfo[4]),
      currentPrice: coinInfo[5],
      URI: coinInfo[6],
      creatorFeesUSDC: coinInfo[7],
      creatorFeesTokenA: coinInfo[8],
      virtualTokenReserve: coinInfo[9],
      virtualUSDCReserve: coinInfo[10],
      creator: coinInfo[11],
    })
  }

  const fetchTransactions = async () => {
    const txHistory = await readContract({
      contract: dex,
      method: 'function getTransactionHistory(address,uint256) view returns ((address,uint256,uint256,uint256,uint256,bool)[])',
      params: [tokenAddress, 400],
    })

    const parsed = (txHistory ?? [])
      .map((tx) => {
        const user = tx[0] ?? tx.user ?? '0x0000000000000000000000000000000000000000'
        const tokenAAmount = BigInt(tx[1] ?? tx.tokenAAmount ?? 0n)
        const usdcAmount = BigInt(tx[2] ?? tx.usdcAmount ?? 0n)
        const price = BigInt(tx[3] ?? tx.price ?? 0n)
        const tsRaw = tx[4] ?? tx.timestamp ?? 0n
        const timestampNum = Number(tsRaw)
        const timestamp = Number.isFinite(timestampNum) ? timestampNum : 0
        const isBuy = Boolean(tx[5] ?? tx.isBuy ?? false)
        return { user, tokenAAmount, usdcAmount, price, timestamp, isBuy }
      })
      .filter((t) => t.timestamp > 0)
      .sort((a, b) => a.timestamp - b.timestamp)

    setTransactions(parsed)
  }

  const fetchHolders = async () => {
    try {
      const holderInfo = await readContract({
        contract: dex,
        method: 'function getTokenHoldersInfo(address) view returns ((address,uint256)[])',
        params: [tokenAddress],
      })
  
      const parsed = (holderInfo || []).map((h) =>
        Array.isArray(h) ? { holder: h[0], balance: h[1] || 0n } : { holder: h.holder, balance: h.balance || 0n }
      )
  
      // sort by balance DESC, drop zeros
      const sorted = parsed
        .filter(h => (h.balance ?? 0n) > 0n)
        .sort((a, b) => (b.balance > a.balance ? 1 : b.balance < a.balance ? -1 : 0))
  
      setHolders(sorted)
    } catch {
      setHolders([])
    }
  }
  

  const fetchMetadata = async (uri) => {
    if (!uri) return
    try {
      const cid = String(uri).replace('ipfs://', '')
      const response = await fetch(
        `https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${cid}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`
      )
      const data = await response.json()
      setMetadata({
        name: data.name || '',
        description: data.description || '',
        logo: data.media?.logo_gateway ? data.media.logo_gateway.substring(8) : '',
        banner: data.media?.banner_gateway ? data.media.banner_gateway.substring(8) : '',
        website: data.links?.website || '',
        x: data.links?.x || '',
        telegram: data.links?.telegram || '',
      })
    } catch {
      // ignore
    }
  }

  // ---------- balances ----------
  useEffect(() => {
    const runTotalBalance = async () => {
      try {
        const data = await readContract({
          contract: tokenContract,
          method: 'function balanceOf(address account) public view returns (uint256)',
          params: [address],
        })
        const data1 = await readContract({
          contract: usdcContract,
          method: 'function balanceOf(address account) public view returns (uint256)',
          params: [address],
        })
        setBalanceT(formatUnits(data, 18,18))
        setBalanceUSDC(formatUnits(data1, 6,6))
      } catch {
        setBalanceT('0')
        setBalanceUSDC('0')
      }
    }
    if (address && tokenContract && usdcContract) runTotalBalance()
  }, [address, tokenContract, usdcContract, transactions]) // recheck after txs

  // ---------- initial load ----------
  useEffect(() => {
    let mounted = true
    const run = async () => {
      if (!tokenAddress) return
      setLoading(true)
      setError('')
      try {
        await fetchTokenBasics()
        await fetchCoinInfo()
        await Promise.all([fetchTransactions(), fetchHolders()])
        if (mounted) {
          // fetch metadata after we’re sure about URI
          const ci = await readContract({
            contract: dex,
            method:
              'function getCoinInfo(address) view returns (uint256,uint256,uint256,bool,uint256,uint256,string,uint256,uint256,uint256,uint256)',
            params: [tokenAddress],
          })
          await fetchMetadata(ci[6])
        }
      } catch (e) {
        setError('Failed to load token data')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [tokenAddress])

  

  // ---------- live events (only bump ticks) ----------
  useEffect(() => {
    if (!DEX_ADDRESS || !tokenAddress) return
    const provider = window.ethereum
      ? new ethers.providers.Web3Provider(window.ethereum)
      : new ethers.providers.JsonRpcProvider(POLYRPC)

    const DEX_ABI = [
      'event TokensPurchased(address indexed user, address indexed tokenA, uint256 usdcAmount, uint256 tokenAmount, uint256 pricePerToken, uint256 platformFee, uint256 creatorFee)',
      'event TokensSold(address indexed user, address indexed tokenA, uint256 tokenAmount, uint256 usdcAmount, uint256 pricePerToken, uint256 platformFee, uint256 creatorFee)',
    ]
    const dexEthers = new ethers.Contract(DEX_ADDRESS, DEX_ABI, provider)
    let timer = null
    const bump = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        setInfoTick((x) => x + 1)
        setTxTick((x) => x + 1)
      }, 300)
    }
    const lower = tokenAddress.toLowerCase()
    const onPurchased = (_u, tokenA) => {
      if (String(tokenA).toLowerCase() === lower) bump()
    }
    const onSold = (_u, tokenA) => {
      if (String(tokenA).toLowerCase() === lower) bump()
    }

    dexEthers.on('TokensPurchased', onPurchased)
    dexEthers.on('TokensSold', onSold)

    return () => {
      clearTimeout(timer)
      try {
        dexEthers.off('TokensPurchased', onPurchased)
        dexEthers.off('TokensSold', onSold)
      } catch {}
    }
  }, [DEX_ADDRESS, tokenAddress, POLYRPC])
  useEffect(() => {
    window.scrollTo(0, 0);
  },[]);
  // ---------- targeted re-fetches ----------
  useEffect(() => {
    if (infoTick > 0) fetchCoinInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoTick])

  useEffect(() => {
    if (txTick > 0){ fetchTransactions();
        fetchHolders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txTick])

  // ---------- BUY preview ----------
  // ---------- BUY preview (uses getBuyQuote) ----------
useEffect(() => {
    const calc = async () => {
      const v = parseFloat(buyAmount)
      if (!v || v <= 0) {
        setBuyPreview({ tokens: '0', fees: '0' })
        setBuyQuote({
          tokenOut: 0n, platformFee: 0n, creatorFee: 0n, usdcNet: 0n,
          pricePerTokenGross: 0n, enoughTokenLiquidity: false
        })
        return
      }
      try {
        const usdcIn = BigInt(ethers.utils.parseUnits(buyAmount, 6).toString())
        const res = await readContract({
          contract: dex,
          method: 'function getBuyQuote(address,uint256) view returns (uint256,uint256,uint256,uint256,uint256,bool)',
          params: [tokenAddress, usdcIn],
        })
        // tuple: (tokenOut, platformFee, creatorFee, usdcNet, pricePerTokenGross, enoughTokenLiquidity)
        const [tokenOut, platformFee, creatorFee, usdcNet, pricePerTokenGross, enoughTokenLiquidity] = res
        setBuyQuote({ tokenOut, platformFee, creatorFee, usdcNet, pricePerTokenGross, enoughTokenLiquidity })
        setBuyPreview({
          tokens: formatUnits(tokenOut || 0n, tokenInfo.decimals),
          fees: formatUnits((platformFee || 0n) + (creatorFee || 0n), 6),
        })
      } catch {
        setBuyPreview({ tokens: '0', fees: '0' })
        setBuyQuote({
          tokenOut: 0n, platformFee: 0n, creatorFee: 0n, usdcNet: 0n,
          pricePerTokenGross: 0n, enoughTokenLiquidity: false
        })
      }
    }
    calc()
    // re-run when inputs or reserves change
  }, [buyAmount, tokenAddress, tokenInfo.decimals, dex, coinData.virtualTokenReserve, coinData.virtualUSDCReserve])
// ---------- SELL preview (uses getSellQuote) ----------
useEffect(() => {
    const calc = async () => {
      const v = parseFloat(sellAmount)
      if (!v || v <= 0) {
        setSellPreview({ usdc: '0', fees: '0' })
        setSellQuote({
          usdcGross: 0n, platformFee: 0n, creatorFee: 0n, usdcNet: 0n,
          pricePerTokenGross: 0n, enoughUSDCReserve: true
        })
        return
      }
      try {
        const tokenIn = BigInt(ethers.utils.parseUnits(sellAmount, tokenInfo.decimals).toString())
        const res = await readContract({
          contract: dex,
          method: 'function getSellQuote(address,uint256) view returns (uint256,uint256,uint256,uint256,uint256,bool)',
          params: [tokenAddress, tokenIn],
        })
        // tuple: (usdcGross, platformFee, creatorFee, usdcNet, pricePerTokenGross, enoughUSDCReserve)
        const [usdcGross, platformFee, creatorFee, usdcNet, pricePerTokenGross, enoughUSDCReserve] = res
        setSellQuote({ usdcGross, platformFee, creatorFee, usdcNet, pricePerTokenGross, enoughUSDCReserve })
        setSellPreview({
          usdc: formatUnits(usdcNet || 0n, 6),
          fees: formatUnits((platformFee || 0n) + (creatorFee || 0n), 6),
        })
      } catch {
        setSellPreview({ usdc: '0', fees: '0' })
        setSellQuote({
          usdcGross: 0n, platformFee: 0n, creatorFee: 0n, usdcNet: 0n,
          pricePerTokenGross: 0n, enoughUSDCReserve: true
        })
      }
    }
    calc()
    // re-run when inputs or reserves change
  }, [sellAmount, tokenAddress, tokenInfo.decimals, dex, coinData.virtualTokenReserve, coinData.virtualUSDCReserve])
  
  // ---------- derived for chart (MUST be BEFORE any early return) ----------
  const chartTransactions = useMemo(() => {
    return (transactions ?? [])
      .map((t) => ({
        ...t,
        timestamp: Number.isFinite(Number(t.timestamp)) ? Number(t.timestamp) : 0,
      }))
      .filter((t) => t.timestamp > 0)
  }, [transactions])

  const chartStartUnix = useMemo(() => {
    if (chartTransactions.length === 0) return Math.floor(Date.now() / 1000)
    return Math.min(...chartTransactions.map((t) => t.timestamp))
  }, [chartTransactions])

  const coinCreationUnix =
    chartTransactions.length > 0 ? chartTransactions[0].timestamp : Math.floor(Date.now() / 1000)

  // ---------- tx builders ----------
  const buildApproveUSDC = () => {
    const amount = ethers.utils.parseUnits(buyAmount || '0', 6)
    return prepareContractCall({
      contract: usdcContract,
      method: 'function approve(address spender, uint256 value) returns (bool)',
      params: [DEX_ADDRESS, amount],
    })
  }

  // utils/formatTinyPrice.js
  function formatTinyPriceDisplay(value) {
    if (value == null) return '$0';
  
    // Convert BigInt / number / string to string
    let str = typeof value === 'number' ? value.toString() : value.toString();
    if (!str.includes('.')) return `$${str}`;
  
    const [intPart, decPart] = str.split('.');
  
    // Find consecutive zeros right after the dot
    const match = decPart.match(/^(0+)(\d.*)?$/);
    if (match && match[1].length >= 3) {
      const zeroCount = match[1].length - 1; // We keep one visible 0
      const rest = match[2] || '';
  
      return (
        <>
          ${intPart}.0
          <sup style={{ fontSize: '0.6em', opacity: 0.7 }}>{zeroCount}</sup>
          {rest}
        </>
      );
    }
  
    // Default fallback for regular prices
    return `$${parseFloat(str).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    })}`;
  }
  
  

  const buildBuyTokens = () => {
    const amount = ethers.utils.parseUnits(buyAmount || '0', 6)
    return prepareContractCall({
      contract: dex,
      method: 'function buyTokens(address tokenA, uint256 usdcAmount)',
      params: [tokenAddress, amount],
    })
  }

  const buildApproveToken = () => {
    const amount = ethers.utils.parseUnits(sellAmount || '0', tokenInfo.decimals)
    return prepareContractCall({
      contract: tokenContract,
      method: 'function approve(address spender, uint256 value) returns (bool)',
      params: [DEX_ADDRESS, amount],
    })
  }

  const buildSellTokens = () => {
    const amount = ethers.utils.parseUnits(sellAmount || '0', tokenInfo.decimals)
    return prepareContractCall({
      contract: dex,
      method: 'function sellTokens(address tokenA, uint256 tokenAmount)',
      params: [tokenAddress, amount],
    })
  }

  const calculateHolderPercentage = (balance) => {
    try {
      if (!balance || !tokenInfo.totalSupply || tokenInfo.totalSupply === '0') return '0'
      const balanceBigInt = BigInt(balance.toString())
      const totalSupplyBigInt = BigInt(tokenInfo.totalSupply.toString())
      if (totalSupplyBigInt === 0n) return '0'
      const percentage = (balanceBigInt * 10000n) / totalSupplyBigInt
      return (Number(percentage) / 100).toFixed(2)
    } catch {
      return '0'
    }
  }
  

  useEffect(() => {
    const id = setInterval(() => {
      setAutoRefreshTick(t => t + 1) // forces a parent re-render
      setInfoTick(x => x + 1)        // triggers fetchCoinInfo()
      setTxTick(x => x + 1)          // triggers fetchTransactions()
    }, 5000) // 5 seconds
  
    return () => clearInterval(id)
  }, [])

  useEffect(() => { if (infoTick > 0) fetchCoinInfo() }, [infoTick])
    useEffect(() => { if (txTick > 0) fetchTransactions() }, [txTick])
  // ---------- early return AFTER all hooks/derived ----------
  if (loading) {
    return (
      <div className="min-h-screen linear-gradient1 flex items-center justify-center">
        <div className="text-white text-xl">Loading token data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen linear-gradient1 py-6 md:py-10">
      <div className="sm:max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
<div className="relative rounded-3xl overflow-hidden bg-white/5 backdrop-blur mb-8">
  {/* Banner (responsive height) */}
  {metadata.banner && (
    <div className="absolute inset-0 h-32 sm:h-44 md:h-56">
      <IPFSMediaViewer
        ipfsLink={`${metadata.banner}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
        height={224}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
    </div>
  )}

  {/* Content */}
  <div className={`relative z-10 ${metadata.banner ? 'pt-28 sm:pt-36 md:pt-44' : 'pt-4'} px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8`}>
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
      {/* Logo */}
      {metadata.logo && (
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-4 border-white/20 bg-black/40 shrink-0">
          <IPFSMediaViewer
            ipfsLink={`${metadata.logo}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
          />
        </div>
      )}

      {/* Title + Meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white truncate">
            {metadata.name || tokenInfo.name}
          </h1>
          <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-xs sm:text-sm shrink-0">
            ${tokenInfo.symbol}
          </span>
        </div>

        {/* Description */}
        <div className="relative max-w-3xl mb-4 rounded-2xl drop-shadow-md overflow-hidden">
            <div className="absolute inset-0 linear-gradient1 opacity-70">

            </div>
                <div className="relative p-4">
                    <div className="text-white/90 font-bold text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                {metadata.description || 'No description available'}
                    </div>
                </div>
            </div>


        {/* Actions - grid on mobile, wrap on larger */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 md:flex md:flex-wrap">
          {metadata.website && (
            <a
              href={metadata.website}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 sm:px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm text-center"
            >
              🌐 Website
            </a>
          )}

          {metadata.x && (
            <a
              href={metadata.x.startsWith('http') ? metadata.x : `https://x.com/${metadata.x.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 sm:px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm text-center"
            >
              𝕏 Twitter
            </a>
          )}

          {metadata.telegram && (
            <a
              href={
                metadata.telegram.startsWith('http')
                  ? metadata.telegram
                  : `https://t.me/${metadata.telegram.replace('t.me/', '')}`
              }
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 sm:px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm text-center"
            >
              💬 Telegram
            </a>
          )}

          <button
            onClick={() => navigator.clipboard.writeText(tokenAddress)}
            className="col-span-2 md:col-span-1 px-3 py-2 sm:px-4 rounded-xl bg-black/25 text-white text-xs sm:text-sm text-center"
            aria-label="Copy contract address"
          >
            📋 {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}
          </button>
        </div>
      </div>


      <div className="text-right">
  <div className="text-white/60 text-sm">Current Price</div>
  <div className="text-2xl md:text-3xl font-bold text-white">
    {formatTinyPriceDisplay(formatPriceFull(coinData.currentPrice, 12, 18))}
  </div>
  <div className="text-white/60 text-sm mt-2">
    Progress: {coinData.percentagePurchased}%
  </div>
  {coinData.lpCreated && (
    <div className="mt-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
      LP Created ✓
    </div>
  )}
</div>

            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {chartTransactions.length > 0 && chartStartUnix && (
              <div className="bg-white/5 backdrop-blur rounded-2xl p-4 border border-white/10">
                <CandleChart15mAdvanced
                  key={tokenAddress}
                  transactions={chartTransactions}
                  currentPrice={formatPriceFull(coinData.currentPrice, 12, 18)}
                  height={420}
                  bucketSeconds={900}
                  startUnix={chartStartUnix}
                />
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                <div className="text-white/60 text-sm">Market Cap</div>
                <div className="text-white text-lg font-semibold">
                  {`$${formatPriceFull(
                    // naive MC = currentPrice(12d) * totalSupply(18d) / 1e18
                    (coinData.currentPrice * BigInt(tokenInfo.totalSupply || 0)) / 10n ** 18n,
                    12,
                    18
                  )}`}
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                <div className="text-white/60 text-sm">Liquidity</div>
                <div className="text-white text-lg font-semibold">
                  ${formatCurrency(coinData.usdcReserve + BigInt(6000 * 1e6), 6)}
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                <div className="text-white/60 text-sm">Holders</div>
                <div className="text-white text-lg font-semibold">{holders.length}</div>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                <div className="text-white/60 text-sm">Virtual Liquidity</div>
                <div className="text-white text-lg font-semibold">{formatCurrency(BigInt(6000 * 1e6), 6)}</div>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                <div className="text-white/60 text-sm">24h Volume</div>
                <div className="text-white text-lg font-semibold">
                  $
                  {formatCurrency(
                    (transactions || [])
                      .filter((tx) => tx.timestamp && Number(tx.timestamp) > Date.now() / 1000 - 86400)
                      .reduce((sum, tx) => sum + BigInt(tx.usdcAmount || 0n), 0n),
                    6
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white/60 text-sm pb-2">Type</th>
                      <th className="text-left text-white/60 text-sm pb-2">User</th>
                      <th className="text-right text-white/60 text-sm pb-2">Tokens</th>
                      <th className="text-right text-white/60 text-sm pb-2">USDC</th>
                      <th className="text-right text-white/60 text-sm pb-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...(transactions || [])]
                      .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                      .map((tx, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                tx.isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {tx.isBuy ? 'BUY' : 'SELL'}
                            </span>
                          </td>
                          <td className="text-white/80 text-sm">
                            {tx.user ? `${tx.user.slice(0, 6)}...${tx.user.slice(-4)}` : ''}
                          </td>
                          <td className="text-white text-sm text-right">
                            {formatUnits(tx.tokenAAmount || 0n, tokenInfo.decimals)}
                          </td>
                          <td className="text-white text-sm text-right">${formatCurrency(tx.usdcAmount || 0n, 6)}</td>
                          <td className="text-white/60 text-sm text-right">
                            {tx.timestamp ? new Date(Number(tx.timestamp) * 1000).toLocaleTimeString() : ''}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right (trade panel + stats) */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('buy')}
                  className={`flex-1 py-3 rounded-xl font-semibold transition ${
                    activeTab === 'buy' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/15'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setActiveTab('sell')}
                  className={`flex-1 py-3 rounded-xl font-semibold transition ${
                    activeTab === 'sell' ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/15'
                  }`}
                  disabled={coinData.lpCreated}
                >
                  Sell
                </button>
              </div>

              {coinData.lpCreated ? (
                <div className="text-center py-8">
                  <div className="text-yellow-400 mb-2">⚠️ LP Created</div>
                  <p className="text-white/60">Trading has moved to Uniswap. Please trade on the DEX.</p>
                </div>
              ) : (
                <>
                  {activeTab === 'buy' ? (
                    <div className="space-y-4">
                      <div onClick={() => setBuyAmount(balanceUSDC)} className="cursor-pointer text-white">
                        Total Balance {balanceUSDC}
                      </div>
                      <div>
                        <label className="text-white/60 text-sm">You Pay</label>
                        <div className="mt-1 relative">
                          <input
                            type="number"
                            value={buyAmount}
                            onChange={(e) => setBuyAmount(e.target.value)}
                            placeholder="0.0"
                            className="w-full bg-black/40 text-white p-4 pr-20 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-emerald-500/50"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <img src={usdcoinusdclogo} className="w-6 h-6" />
                            <span className="text-white">USDC</span>
                          </div>
                        </div>
                      </div>

                      <div>
  <label className="text-white/60 text-sm">You Receive</label>
  <div className="mt-1 bg-black/20 p-4 rounded-xl border border-white/10">
    <div className="text-2xl text-white font-semibold">
      {buyPreview.tokens} {tokenInfo.symbol}
    </div>
    <div className="text-white/40 text-sm mt-1">
      Fees: ${buyPreview.fees} USDC
      {buyQuote.usdcNet > 0n && (
        <span className="ml-2">
          • Net added to pool: ${formatUnits(buyQuote.usdcNet, 6)}
        </span>
      )}
    </div>
    {!buyQuote.enoughTokenLiquidity && buyAmount && parseFloat(buyAmount) > 0 && (
      <div className="mt-2 text-yellow-400 text-xs">
        Not enough token liquidity to fulfill this buy at once.
      </div>
    )}
  </div>
</div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <TransactionButton
                          transaction={() => buildApproveUSDC()}
                          onError={(e) => setError(e?.message || 'Approval failed')}
                          onTransactionConfirmed={() => setToast('USDC Approved!')}
                        >
                          Approve USDC
                        </TransactionButton>
                        <TransactionButton
                            disabled={!buyQuote.enoughTokenLiquidity}
                            transaction={() => buildBuyTokens()}
                            onError={(e) => setError(e?.message || 'Purchase failed')}
                            onTransactionConfirmed={() => setToast('Tokens purchased!')}
                            >
                            Buy {tokenInfo.symbol}
                        </TransactionButton>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div onClick={() => setSellAmount(balanceT)} className="cursor-pointer text-white">
                        Total Balance {balanceT}
                      </div>
                      <div>
                        <label className="text-white/60 text-sm">You Sell</label>
                        <div className="mt-1 relative">
                          <input
                            type="number"
                            value={sellAmount}
                            onChange={(e) => setSellAmount(e.target.value)}
                            placeholder="0.0"
                            className="w-full bg-black/40 text-white p-4 pr-20 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-red-500/50"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <span className="text-white">{tokenInfo.symbol}</span>
                          </div>
                        </div>
                      </div>

                      <div>
  <label className="text-white/60 text-sm">You Receive</label>
  <div className="mt-1 bg-black/20 p-4 rounded-xl border border-white/10">
    <div className="text-2xl text-white font-semibold flex items-center gap-2">
      <img src={usdcoinusdclogo} className="w-6 h-6" />
      ${sellPreview.usdc} USDC
    </div>
    <div className="text-white/40 text-sm mt-1">
      Fees: ${sellPreview.fees} USDC
      {sellQuote.usdcNet > 0n && (
        <span className="ml-2">
          • Net from pool: ${formatUnits(sellQuote.usdcNet, 6)}
        </span>
      )}
    </div>
    {!sellQuote.enoughUSDCReserve && sellAmount && parseFloat(sellAmount) > 0 && (
      <div className="mt-2 text-yellow-400 text-xs">
        Not enough USDC reserve to pay this amount. Try a smaller sell.
      </div>
    )}
  </div>
</div>


                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <TransactionButton
                          transaction={() => buildApproveToken()}
                          onError={(e) => setError(e?.message || 'Approval failed')}
                          onTransactionConfirmed={() => setToast('Tokens Approved!')}
                        >
                          Approve {tokenInfo.symbol}
                        </TransactionButton>
                        <TransactionButton
  disabled={!sellQuote.enoughUSDCReserve}
  transaction={() => buildSellTokens()}
  onError={(e) => setError(e?.message || 'Sale failed')}
  onTransactionConfirmed={() => {
    setToast('Tokens sold!')
    setSellAmount('')
    setTxTick((x) => x + 1)
    setInfoTick((x) => x + 1)
  }}
>
  Sell {tokenInfo.symbol}
</TransactionButton>

                      </div>
                    </div>
                  )}
                </>
              )}
              {(error || toast) && (
                <>
                  {error && (
                    <>
                      {error.includes('Minimum purchase') && error !== '' ? (
                        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                          <p className="text-red-400 text-sm">Minimum purchase 3.6 USDC</p>
                        </div>
                      ) : (
                        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                          <p className="text-red-400 text-sm">{error}</p>
                        </div>
                      )}
                    </>
                  )}
                  {toast && (
                    <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-emerald-400 text-sm">{toast}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* LP progress */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4">LP Creation Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Progress</span>
                  <span className="text-white">{coinData.percentagePurchased}% / 50%</span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-3">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min(coinData.percentagePurchased * 2, 100)}%` }}
                  />
                </div>
                <p className="text-white/50 text-xs">
                  Liquidity pool will be created automatically when 50% of tokens are purchased
                </p>
              </div>
            </div>

            {/* Holders */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4">Top Holders</h3>
              <div className="space-y-2">
              {holders.slice(0, 20).map((holder, i) => {
                    const addr = holder.holder || '';
                    const isLP =
                        addr.toLowerCase() === (import.meta.env.VITE_DEX_ADDRESS || '').toLowerCase();
                    const isCreator =
                        (coinData?.creator || '').toLowerCase() === addr.toLowerCase();

                    return (
                        <div
                        key={i}
                        className="flex justify-between items-center py-2 border-b border-white/5"
                        >
                        <div className="flex items-center gap-2">
                            {/* Clickable address */}
                            <a
                            href={`https://base.blockscout.com/address/${addr}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/80 text-sm hover:text-white underline-offset-2 hover:underline transition"
                            >
                            {addr.slice(0, 6)}...{addr.slice(-4)}
                            </a>

                            {/* LP and Creator badges */}
                            {isLP && (
                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-[10px] uppercase tracking-wider">
                                LP
                            </span>
                            )}
                            {isCreator && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] uppercase tracking-wider">
                                Creator
                            </span>
                            )}
                        </div>

                        <div className="text-right">
                            <div className="text-white text-sm">
                            {formatUnits(holder.balance || 0n, tokenInfo.decimals)} {tokenInfo.symbol}
                            </div>
                            <div className="text-white/40 text-xs">
                            {calculateHolderPercentage(holder.balance)}%
                            </div>
                        </div>
                        </div>
                    );
                    })}



              </div>
            </div>

                {/*Withdraw Fees*/}
                {/* Show Withdraw Button only for creator */}
    {address && address?.toLowerCase() === coinData?.creator.toLowerCase() && (
      <div className="mt-4">
        <TransactionButton
          transaction={() =>
            prepareContractCall({
              contract: dex,
              method: "function withdrawAllCreatorFeesUSDC(address tokenA)",
              params: [tokenAddress],
            })
          }
          onError={(e) => setError(e?.message || "Withdraw failed")}
          onTransactionConfirmed={() => setToast("All creator fees withdrawn!")}
        >
          Withdraw Creator Fees (USDC)
        </TransactionButton>
      </div>
    )}
    {address && address?.toLowerCase() === coinData?.creator.toLowerCase() && (
      <div className="mt-4">
        <TransactionButton
          transaction={() =>
            prepareContractCall({
              contract: dex,
              method: "function withdrawAllCreatorFeesToken(address tokenA)",
              params: [tokenAddress],
            })
          }
          onError={(e) => setError(e?.message || "Withdraw failed")}
          onTransactionConfirmed={() => setToast("All creator fees withdrawn!")}
        >
          Withdraw Creator Fees (Token)
        </TransactionButton>
      </div>
    )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default CoinPage
