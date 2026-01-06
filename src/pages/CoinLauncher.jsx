import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Featured from '../components/Featured'
import { useStateContext } from '../context'
import { logoOfWebsite, usdcoinusdclogo } from '../assets'
import { FormField, Loader, FeaturedMobile, IPFSMediaViewer } from '../components'
import { TransactionButton } from 'thirdweb/react'
import { createThirdwebClient, getContract, prepareContractCall, readContract } from 'thirdweb'
import { base } from 'thirdweb/chains'
import { useMediaQuery } from 'react-responsive'
import { PinataSDK } from 'pinata'
import { ethers } from 'ethers'

/**
 * Coin Launcher Page — ethers.utils edition (ethers v5)
 * - Uses ethers.utils.parseUnits / ethers.utils.formatUnits
 * - Converts BigNumber -> BigInt for thirdweb tx params
 * - Live preview w/ fallback to initial price (36) if coin not created yet
 * - Immediate upload of logo/banner files to Pinata
 * - Fixed JSON viewer link
 *
 * ENV expected:
 *  - VITE_THIRDWEB_CLIENT_ID  (or fallback VITE_THIRDWEB_CLIENT)
 *  - VITE_DEX_ADDRESS         (BondingCurveDEX)
 *  - VITE_PINATA_JWT
 *  - Optional: VITE_PINATA_GATEWAY
 */

const ONE_ETHER_N = 10n ** 18n
const INITIAL_PRICE_UNITS_N = 36n // matches contract's INITIAL_PRICE = 36 (see comment)
const MIN_PURCHASE_RAW_N = 360000n   // 0.000360 USDC in 6 decimals

// helpers to bridge ethers v5 BigNumber <-> bigint (thirdweb expects bigint)
const toBigInt = (bn) => BigInt(bn.toString())
const bnFromBigInt = (bi) => ethers.BigNumber.from(bi.toString())

const CoinLauncher = () => {
  const navigate = useNavigate()
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })

  const client = useMemo(
    () =>
      createThirdwebClient({
        clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || import.meta.env.VITE_THIRDWEB_CLIENT,
      }),
    []
  )

  const DEX_ADDRESS = import.meta.env.VITE_DEX_ADDRESS
  const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

  const pinata = useMemo(
    () =>
      new PinataSDK({
        pinataJwt: import.meta.env.VITE_PINATA_JWT,
        pinataGateway: import.meta.env.VITE_PINATA_GATEWAY || 'bronze-sticky-guanaco-654.mypinata.cloud',
      }),
    []
  )

  // -------------------- Local State --------------------
  const [form, setForm] = useState({
    tokenA: '',
    initialUSDC: '', // human units (6-decimal token)
    name: '',
    website: '',
    x: '',
    telegram: '',
    description: '',
  })
  const [logoFile, setLogoFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)

  const [uploading, setUploading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [tokenInfoURI, setTokenInfoURI] = useState('')
  const [logoCid, setLogoCid] = useState('')
  const [bannerCid, setBannerCid] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  // -------- Preview state (how many tokens user will receive) --------
  const [tokenPreview, setTokenPreview] = useState({
    loading: false,
    out: 0n, // bigint
    symbol: 'TOKEN',
    tokenDecimals: 18,
    usdcOk: true,
    price: 0n, // bigint, USDC per token in 18 decimals
  })

  // Contracts
  const dex = useMemo(() => getContract({ client: client, chain: base, address: DEX_ADDRESS }), [client, DEX_ADDRESS])

  // Constants (BigNumber for ui/math via ethers, then convert to bigint for calls)
  const APPROVE_TOKEN_A_AMOUNT_BN = ethers.utils.parseUnits('1000000000', 18) // 1,000,000,000 * 1e18

  // -------------------- Helpers --------------------
  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const prettyGatewayURL = (cidOrPath) =>
    `https://${pinata.config?.pinataGateway || 'bronze-sticky-guanaco-654.mypinata.cloud'}/ipfs/${cidOrPath}`

  const formatUnitsSafe = (valueLike, decimals, maxDecimals = 3) => {
    try {
      // Accepts bigint, BigNumber, string; normalize to string
      const asString =
        typeof valueLike === 'bigint'
          ? valueLike.toString()
          : ethers.BigNumber.isBigNumber(valueLike)
          ? valueLike.toString()
          : (valueLike ?? '0').toString()
      const formatted = ethers.utils.formatUnits(asString, decimals)
      
      // Limit decimal places
      const parts = formatted.split('.')
      if (parts.length === 2 && parts[1].length > maxDecimals) {
        return `${parts[0]}.${parts[1].substring(0, maxDecimals)}`
      }
      return formatted
    } catch {
      return '0'
    }
  }

  const shortAddr = (a) => (a && a.startsWith('0x') ? `${a.slice(0, 6)}…${a.slice(-4)}` : a)

  // Pin a single file (logo or banner)
  const pinFile = async (file) => {
    const upload = await pinata.upload.file(file, {
      pinataMetadata: { name: `coin-launcher-${file.name}` },
    })
    return upload.cid || upload.IpfsHash || upload.hash
  }

  // Pin JSON with project data
  const pinJSON = async (payload) => {
    const res = await pinata.upload.json(payload, {
      pinataMetadata: { name: `coin-launcher-${payload?.name || 'metadata'}` },
    })
    return res.cid || res.IpfsHash || res.hash
  }

  // Handle immediate logo upload
  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setLogoFile(file)
    setUploadingLogo(true)
    setError('')
    setToast('')
    
    try {
      const cid = await pinFile(file)
      setLogoCid(cid)
      setToast('Logo uploaded successfully ✔')
    } catch (error) {
      console.error('Logo upload error:', error)
      setError(`Failed to upload logo: ${error?.message || 'Unknown error'}`)
    } finally {
      setUploadingLogo(false)
    }
  }

  // Handle immediate banner upload
  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setBannerFile(file)
    setUploadingBanner(true)
    setError('')
    setToast('')
    
    try {
      const cid = await pinFile(file)
      setBannerCid(cid)
      setToast('Banner uploaded successfully ✔')
    } catch (error) {
      console.error('Banner upload error:', error)
      setError(`Failed to upload banner: ${error?.message || 'Unknown error'}`)
    } finally {
      setUploadingBanner(false)
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  },[]);

  const handleUploadMetadata = async () => {
    setError('')
    setToast('')
    try {
      if (!form.tokenA || !form.initialUSDC) {
        setError('Please fill TokenA address and Initial USDC.')
        return
      }
      setUploading(true)

      const jsonPayload = {
        name: form.name || 'Untitled Token',
        tokenA: form.tokenA,
        links: { website: form.website, x: form.x, telegram: form.telegram },
        media: {
          logo: logoCid ? `ipfs://${logoCid}` : '',
          banner: bannerCid ? `ipfs://${bannerCid}` : '',
          logo_gateway: logoCid ? prettyGatewayURL(logoCid) : '',
          banner_gateway: bannerCid ? prettyGatewayURL(bannerCid) : '',
        },
        description: form.description,
        createdAt: new Date().toISOString(),
        network: 'base',
        version: 1,
      }

      const jsonCid = await pinJSON(jsonPayload)
      const uri = `ipfs://${jsonCid}`
      setTokenInfoURI(jsonCid)
      setToast('Metadata uploaded to IPFS ✔')
    } catch (e) {
      console.error(e)
      setError(e?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Get the JSON CID from the tokenInfoURI
  const getJsonCid = () => {
    if (!tokenInfoURI) return ''
    return tokenInfoURI.replace('ipfs://', '')
  }

  // -------------------- Build TXs (convert BN -> bigint for thirdweb) --------------------
  const buildApproveTokenATx = () => {
    if (!form.tokenA) throw new Error('TokenA address required')
    const amount = toBigInt(APPROVE_TOKEN_A_AMOUNT_BN)
    return prepareContractCall({
      contract: getContract({ client:client, chain: base, address: form.tokenA }),
      method: 'function approve(address spender, uint256 value) returns (bool)',
      params: [DEX_ADDRESS, amount],
    })
  }

  const buildApproveUSDCTx = () => {
    const amountBN = form.initialUSDC
      ? (() => {
          try {
            return ethers.utils.parseUnits(String(form.initialUSDC).trim(), 6)
          } catch {
            return ethers.constants.Zero
          }
        })()
      : ethers.constants.Zero
    const amount = toBigInt(amountBN)
    return prepareContractCall({
      contract: getContract({ client:client, chain: base, address: USDC }),
      method: 'function approve(address spender, uint256 value) returns (bool)',
      params: [DEX_ADDRESS, amount],
    })
  }

  const buildDepositCoinTx = () => {
    if (!form.tokenA) throw new Error('TokenA address required')
    if (!form.initialUSDC) throw new Error('Initial USDC required')
    if (!tokenInfoURI) throw new Error('Token info URI is empty. Upload metadata first.')
        console.log(tokenInfoURI);
    const amountBN = (() => {
      try {
        return ethers.utils.parseUnits(String(form.initialUSDC).trim(), 6)
      } catch {
        return ethers.constants.Zero
      }
    })()
    const amount = toBigInt(amountBN)

    return prepareContractCall({
      contract: dex,
      method: 'function depositCoin(address tokenA, uint256 initialUSDC, string tokenInfo)',
      params: [form.tokenA, amount, tokenInfoURI],
    })
  }

  // -------------------- Live Preview + Price Card --------------------
  useEffect(() => {
    let cancel = false
    const run = async () => {
      try {
        if (!form.tokenA || !form.initialUSDC) {
          setTokenPreview((p) => ({ ...p, out: 0n, price: 0n, usdcOk: true }))
          return
        }
        setTokenPreview((p) => ({ ...p, loading: true }))

        // USDC amount (bigint) via ethers.utils.parseUnits -> BigNumber -> bigint
        const usdcAmount = (() => {
          try {
            const bn = ethers.utils.parseUnits(String(form.initialUSDC).trim() || '0', 6)
            return toBigInt(bn)
          } catch {
            return 0n
          }
        })()

        // token symbol & decimals
        let symbol = 'TOKEN'
        let tokenDecimals = 18
        try {
          symbol = await readContract({
            contract: getContract({ client:client, chain: base, address: form.tokenA }),
            method: 'function symbol() view returns (string)',
            params: [],
          })
        } catch {}
        try {
          const dec = await readContract({
            contract: getContract({ client:client, chain: base, address: form.tokenA }),
            method: 'function decimals() view returns (uint8)',
            params: [],
          })
          tokenDecimals = Number(dec) || 18
        } catch {}

        // expected output from DEX (bigint)
        let out = 0n
        try {
          out = await readContract({
            contract: dex,
            method: 'function calculateTokenOutput(address tokenA, uint256 usdcAmount) view returns (uint256)',
            params: [form.tokenA, usdcAmount],
          })
        } catch {}

        // Fallback: simulate initial price if DEX returned 0 (coin not created yet)
        if (out === 0n && usdcAmount > 0n) {
          // tokens = usdcAmount * 1e18 / 36
          try {
            out = (usdcAmount * ONE_ETHER_N) / INITIAL_PRICE_UNITS_N
          } catch {}
        }

        // current price from getCoinInfo (bigint in 18 decimals)
        let price = 0n
        try {
          const info = await readContract({
            contract: dex,
            method:
              'function getCoinInfo(address) view returns (uint256,uint256,uint256,bool,uint256,uint256,string,uint256,uint256)',
            params: [form.tokenA],
          })
          price = info?.[5] ?? 0n
        } catch {}

        if (cancel) return
        setTokenPreview({
          loading: false,
          out,
          symbol,
          tokenDecimals,
          usdcOk: usdcAmount >= MIN_PURCHASE_RAW_N,
          price,
        })
      } catch (e) {
        if (cancel) return
        setTokenPreview((p) => ({ ...p, loading: false, out: 0n, price: 0n }))
      }
    }

    const t = setTimeout(run, 250)
    return () => {
      cancel = true
      clearTimeout(t)
    }
  }, [form.tokenA, form.initialUSDC, dex, client])

  const navigateToCoin = () => {
    navigate(`/coin/${form.tokenA}`);
}

  // -------------------- UI --------------------
  return (
    <div className='w-full min-h-screen py-6 md:py-10'>
      <div className='mx-auto px-4 md:px-6'>

        {/* Header */}
        <div className='flex items-center justify-between mt-4 md:mt-8'>
          <div className='flex items-center gap-3'>
            <img src={logoOfWebsite} className='w-9 h-9 rounded-xl' alt='logo' />
            <div>
              <h1 className='text-2xl md:text-3xl font-semibold text-white'>Launch a Coin on Base</h1>
              <p className='text-white/60 text-sm md:text-base'>
                Upload your metadata, approve tokens, and deploy into a bonding-curve market.
              </p>
            </div>
          </div>
          {form.tokenA && (
            <span className='text-xs md:text-sm px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80'>
              TokenA: {shortAddr(form.tokenA)}
            </span>
          )}
        </div>

        {/* Main grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 mt-6'>
          {/* Left: form */}
          <div className='lg:col-span-2 bg-white/5 backdrop-blur rounded-2xl p-5 md:p-7 shadow-lg border border-white/10'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='text-sm text-white/80'>TokenA (ERC20/ESH) Address</label>
                <input
                  name='tokenA'
                  value={form.tokenA}
                  onChange={onChange}
                  placeholder='0x…'
                  className='mt-1 w-full rounded-xl bg-black/40 text-white p-3 border border-white/10 outline-none focus:ring-2 focus:ring-blue-400/50'
                />
                <p className='text-[11px] text-white/50 mt-1'>
                  Must be your ESH-compatible token (implements <code>getHolders()</code>).
                </p>
              </div>
              <div>
                <label className='text-sm text-white/80 flex items-center gap-2'>
                  Initial USDC <img src={usdcoinusdclogo} className='w-5 h-5' />
                </label>
                <input
                  name='initialUSDC'
                  value={form.initialUSDC}
                  onChange={onChange}
                  placeholder='e.g. 25'
                  className='mt-1 w-full rounded-xl bg-black/40 text-white p-3 border border-white/10 outline-none focus:ring-2 focus:ring-blue-400/50'
                />
                <p className='text-[11px] text-white/50 mt-1'>
                  Approved as 6-decimals on-chain. Minimum {formatUnitsSafe(MIN_PURCHASE_RAW_N, 6, 6)} USDC.
                </p>

                {/* Live preview */}
                {form.initialUSDC && form.tokenA && (
                  <div className='mt-2 text-xs'>
                    {!tokenPreview.usdcOk ? (
                      <span className='text-yellow-300'>
                        Below minimum. Increase USDC to at least {formatUnitsSafe(MIN_PURCHASE_RAW_N, 6, 6)}.
                      </span>
                    ) : tokenPreview.loading ? (
                      <span className='text-white/60'>Calculating expected tokens…</span>
                    ) : (
                      <span className='text-emerald-300'>
                        You'll receive ≈ {formatUnitsSafe(tokenPreview.out, tokenPreview.tokenDecimals)}{' '}
                        {tokenPreview.symbol}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className='text-sm text-white/80'>Project Name</label>
                <input
                  name='name'
                  value={form.name}
                  onChange={onChange}
                  placeholder='My Token'
                  className='mt-1 w-full rounded-xl bg-black/40 text-white p-3 border border-white/10 outline-none focus:ring-2 focus:ring-blue-400/50'
                />
              </div>
              <div>
                <label className='text-sm text-white/80'>Website</label>
                <input
                  name='website'
                  value={form.website}
                  onChange={onChange}
                  placeholder='https://…'
                  className='mt-1 w-full rounded-xl bg-black/40 text-white p-3 border border-white/10 outline-none focus:ring-2 focus:ring-blue-400/50'
                />
              </div>
              <div>
                <label className='text-sm text-white/80'>X (Twitter)</label>
                <input
                  name='x'
                  value={form.x}
                  onChange={onChange}
                  placeholder='@handle or link'
                  className='mt-1 w-full rounded-xl bg-black/40 text-white p-3 border border-white/10 outline-none focus:ring-2 focus:ring-blue-400/50'
                />
              </div>
              <div>
                <label className='text-sm text-white/80'>Telegram</label>
                <input
                  name='telegram'
                  value={form.telegram}
                  onChange={onChange}
                  placeholder='t.me/…'
                  className='mt-1 w-full rounded-xl bg-black/40 text-white p-3 border border-white/10 outline-none focus:ring-2 focus:ring-blue-400/50'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='text-sm text-white/80'>Description</label>
                <textarea
                  name='description'
                  value={form.description}
                  onChange={onChange}
                  rows={4}
                  placeholder='What is this token about?'
                  className='mt-1 w-full rounded-xl bg-black/40 text-white p-3 border border-white/10 outline-none focus:ring-2 focus:ring-blue-400/50'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-6'>
              <div>
                <label className='text-sm text-white/80'>
                  Logo (square) {uploadingLogo && <span className='text-blue-400'>Uploading...</span>}
                </label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleLogoChange}
                  disabled={uploadingLogo}
                  className='mt-1 w-full rounded-xl bg-black/40 text-white p-3 border border-white/10 outline-none disabled:opacity-50'
                />
                {logoCid && (
                  <div className='mt-2'>
                    <div className='rounded-xl overflow-hidden border border-white/10'>
                      <IPFSMediaViewer ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${logoCid}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`} height={160} />
                    </div>
                    <p className='text-[11px] text-emerald-300 mt-1'>✔ Uploaded to IPFS: {logoCid.slice(0, 10)}...</p>
                  </div>
                )}
              </div>
              <div>
                <label className='text-sm text-white/80'>
                  Banner (wide) {uploadingBanner && <span className='text-blue-400'>Uploading...</span>}
                </label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleBannerChange}
                  disabled={uploadingBanner}
                  className='mt-1 w-full rounded-xl bg-black/40 text-white p-3 border border-white/10 outline-none disabled:opacity-50'
                />
                {bannerCid && (
                  <div className='mt-2'>
                    <div className='rounded-xl overflow-hidden border border-white/10'>
                      <IPFSMediaViewer
                        ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${bannerCid}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                        height={160}
                      />
                    </div>
                    <p className='text-[11px] text-emerald-300 mt-1'>✔ Uploaded to IPFS: {bannerCid.slice(0, 10)}...</p>
                  </div>
                )}
              </div>
            </div>

            <div className='mt-6 flex flex-col md:flex-row gap-3'>
              <button
                onClick={handleUploadMetadata}
                disabled={uploading || uploadingLogo || uploadingBanner}
                className='px-4 py-3 rounded-xl bg-blue-500/90 hover:bg-blue-500 text-white font-medium border border-blue-400/20 disabled:opacity-50'
              >
                {uploading ? 'Uploading Metadata…' : tokenInfoURI ? 'Re-upload Metadata' : 'Upload Project Metadata JSON'}
              </button>
              {tokenInfoURI && (
                <a
                    href={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${tokenInfoURI}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/15"
                >
                    View JSON (Gateway)
                </a>
                )}
            </div>

            {error && <p className='text-red-400 mt-3 text-sm'>{error}</p>}
            {toast && <p className='text-emerald-300 mt-3 text-sm'>{toast}</p>}
          </div>

          {/* Right: Preview & Steps */}
          <div className='space-y-5'>
            {/* Price & Preview Card */}
            <div className='bg-black/40 rounded-2xl p-5 border border-white/10'>
              <div className='flex items-center justify-between'>
                <div className='text-white font-semibold'>Live Preview</div>
                <span className='text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/15 text-white/60'>
                  read-only
                </span>
              </div>
              <div className='mt-3 grid grid-cols-2 gap-3 text-sm'>
                <div className='bg-white/5 rounded-xl p-3 border border-white/10'>
                  <div className='text-white/60'>You receive</div>
                  <div className='text-white mt-1 text-lg'>
                    {form.initialUSDC && form.tokenA ? (
                      tokenPreview.loading ? '…' : `${formatUnitsSafe(tokenPreview.out, tokenPreview.tokenDecimals)} ${tokenPreview.symbol}`
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
                <div className='bg-white/5 rounded-xl p-3 border border-white/10'>
                  <div className='text-white/60'>Current price</div>
                  <div className='text-white mt-1 text-lg'>
                    {tokenPreview.price > 0n ? `${formatUnitsSafe(tokenPreview.price, 18)} USDC` : '—'}
                  </div>
                </div>
              </div>
              <p className='text-[11px] text-white/50 mt-3'>
                Preview uses <code>calculateTokenOutput()</code> (fallback to initial price if coin isn't created). No wallet pop-ups.
              </p>
            </div>

            {/* Upload Status Card */}
            {(logoCid || bannerCid) && (
              <div className='bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20'>
                <div className='text-emerald-300 font-semibold mb-2'>Upload Status</div>
                <div className='space-y-1 text-xs'>
                  {logoCid && (
                    <div className='flex items-center gap-2'>
                      <span className='text-emerald-400'>✔</span>
                      <span className='text-white/70'>Logo: {logoCid.slice(0, 20)}...</span>
                    </div>
                  )}
                  {bannerCid && (
                    <div className='flex items-center gap-2'>
                      <span className='text-emerald-400'>✔</span>
                      <span className='text-white/70'>Banner: {bannerCid.slice(0, 20)}...</span>
                    </div>
                  )}
                  {tokenInfoURI && (
                    <div className='flex items-center gap-2'>
                      <span className='text-emerald-400'>✔</span>
                      <span className='text-white/70'>Metadata: {getJsonCid().slice(0, 20)}...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stepper */}
            <div className='space-y-4'>
              <div className='bg-black/40 rounded-2xl p-4 border border-white/10'>
                <div className='text-white font-semibold mb-2'>Step 1: Approve TokenA</div>
                <p className='text-white/70 text-xs mb-3'>Approves 1,000,000,000 tokens to the DEX for deposit.</p>
                <TransactionButton
                  transaction={() => buildApproveTokenATx()}
                  onError={(e) => setError(e?.message || 'Approve Token failed')}
                  onTransactionSent={() => setError('')}
                  onTransactionConfirmed={() => setToast('TokenA approved ✔')}
                >
                  Approve ${tokenPreview.symbol}
                </TransactionButton>
              </div>

              <div className='bg-black/40 rounded-2xl p-4 border border-white/10'>
                <div className='text-white font-semibold mb-2'>Step 2: Approve USDC</div>
                <p className='text-white/70 text-xs mb-3'>Approves your initial USDC (converted to 6 decimals) to the DEX.</p>
                <TransactionButton
                  transaction={() => buildApproveUSDCTx()}
                  onError={(e) => setError(e?.message || 'Approve USDC failed')}
                  onTransactionSent={() => setError('')}
                  onTransactionConfirmed={() => setToast('USDC approved ✔')}
                >
                  Approve USDC
                </TransactionButton>
              </div>

              <div className='bg-black/40 rounded-2xl p-4 border border-white/10'>
                <div className='text-white font-semibold mb-2'>Step 3: Deposit & Launch</div>
                <p className='text-white/70 text-xs mb-3'>
                  Calls <code>depositCoin(tokenA, initialUSDC, tokenInfoURI)</code>.
                </p>
                <TransactionButton
                  disabled={!tokenInfoURI}
                  
                  transaction={() => buildDepositCoinTx()}
                  onError={(e) => setError(e?.message || 'Deposit failed')}
                  onTransactionSent={() => setError('')}
                  onTransactionConfirmed={() =>navigateToCoin()}
                >
                  Launch Coin
                </TransactionButton>
                {!tokenInfoURI && (
                  <p className='text-[11px] text-yellow-300 mt-2'>Upload metadata JSON first to get the tokenInfo URI.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoinLauncher