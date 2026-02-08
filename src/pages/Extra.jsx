import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader, Featured, FeaturedMobile, IPFSMediaViewer, ProtectedBox } from '../components'
import { RegisterNewStore, City, ActivatePromotion, MemoryGame, TexasHoldemGame } from '../pages'
import { useMediaQuery } from 'react-responsive'
import { useStateContext } from '../context'
import { useContract } from '@thirdweb-dev/react'
import { useActiveAccount } from 'thirdweb/react'
import { ethers } from 'ethers'
import { fontSizes } from '../components/AccessibilityMenu'

const Extra = () => {
  const account = useActiveAccount()
  const navigate = useNavigate()
  const [rendered, setRendered] = useState(false)
  const isMobile = useMediaQuery({ maxWidth: 767 })
  const [isLoading, setIsLoading] = useState(false)

  const StoreURL = window.location.pathname.split('/')[2]
  const ProductURL = window.location.pathname.split('/')[4]

  const [ownerShip, setOwnerShip] = useState(false)
  const [invoicesAddress, setInvoicesAddress] = useState('')
  const [media, setMedia] = useState('')
  const [error, setError] = useState(null)
  const [storeContractByURL, setStoreContractByURL] = useState('')
  const [isStoreLoaded, setIsStoreLoaded] = useState(false)
  const [noHiddenFile, setNoHiddenFile] = useState(false)

  const { address, getStoreDetails, storeRegistery } = useStateContext()
  const { contract: theStoreContract } = useContract(storeContractByURL)

  const API_URL = import.meta.env.VITE_MONGO_SERVER_API + '/api'

  function decodeUrlString(str) {
    return decodeURIComponent(str)
  }

  const safeJson = async (res) => {
    const text = await res.text()
    try {
      return JSON.parse(text)
    } catch {
      return { success: false, error: text || `HTTP ${res.status}` }
    }
  }

  useEffect(() => {
    const setContract = async () => {
      if (!storeRegistery || !StoreURL) return

      try {
        setIsLoading(true)
        const data = await getStoreDetails(StoreURL)
        const theData = await data[1]
        setStoreContractByURL(theData)
      } catch (e) {
        console.error('Error setting contract:', e)
        setError('Failed to load store details')
      } finally {
        setIsLoading(false)
      }
    }

    setContract()
  }, [storeRegistery, StoreURL])

  function renderDescriptionWithBreaks(description) {
    if (!description) return <p>No description provided.</p>

    const processText = (text) => {
      const sanitizedText = text.replace(/[\s\uFEFF\xA0]+/g, ' ')
      const nodes = []
      let currentText = ''
      let styles = []

      for (let i = 0; i < sanitizedText.length; i++) {
        const char = sanitizedText[i]

        if (char === '~' || char === '*' || char === '^' || char === '$') {
          if (currentText) {
            nodes.push({ text: currentText, styles: [...styles] })
            currentText = ''
          }
          const styleIndex = styles.indexOf(char)
          if (styleIndex > -1) {
            styles.splice(styleIndex, 1)
          } else {
            styles.push(char)
          }
          continue
        }

        currentText += char
      }

      if (currentText) {
        nodes.push({ text: currentText, styles: [...styles] })
      }

      return nodes.map((node, index) => {
        let element = <span key={index}>{node.text}</span>

        node.styles.forEach((style) => {
          const defaultFontSizeIndex = fontSizes.indexOf('sm')
          const defaultSize = fontSizes[defaultFontSizeIndex - 7]

          switch (style) {
            case '~':
              element = (
                <span key={index} className={`!text-[#FFDD00] text-${defaultSize}`}>
                  {element}
                </span>
              )
              break
            case '*':
              element = (
                <strong key={index} className={`text-${defaultSize}`}>
                  {element}
                </strong>
              )
              break
            case '$':
              element = (
                <span key={index} className={`text-center block my-[10px] text-${defaultSize}`}>
                  {element}
                </span>
              )
              break
            case '^': {
              const fontSizeIndex = fontSizes.indexOf('sm') + 4
              const size = fontSizes[fontSizeIndex]
              element = (
                <span key={index} className={`text-${size}`}>
                  {element}
                </span>
              )
              break
            }
            default:
              element = <span key={index} className={`text-${defaultSize}`}>{element}</span>
              break
          }
        })

        return element
      })
    }

    const lines = description.split('\n').map((line, index) => (
      <div key={index} className="whitespace-pre-wrap touch-auto">
        {processText(line)}
      </div>
    ))

    return <div className="font-epilogue text-[#FFFFFF]">{lines}</div>
  }

  useEffect(() => {
    const getInvoices = async () => {
      try {
        const dataOfInvoice = await theStoreContract.call('invoices')
        setInvoicesAddress(dataOfInvoice)
        setIsStoreLoaded(true)
      } catch (e) {
        console.error('Error getting invoices:', e)
      }
    }

    if (theStoreContract) {
      getInvoices()
    }
  }, [theStoreContract])

  const handleUnlockContent = async () => {
    if (!account) {
      alert('Please connect your wallet first.')
      return
    }

    if (!isStoreLoaded || !invoicesAddress) {
      alert('Store data not fully loaded yet. Please wait.')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setNoHiddenFile(false)
      setOwnerShip(false)
      setRendered(false)
      setMedia('')

      const origin = window.location.origin
      const timestamp = Date.now()
      const barcode = decodeUrlString(ProductURL)

      const chalRes = await fetch(`${API_URL}/access-challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: account.address,
          chainId: account.chainId,
        }),
      })

      const chal = await safeJson(chalRes)
      if (!chalRes.ok || !chal.success) {
        throw new Error(chal.error || `Challenge failed (HTTP ${chalRes.status})`)
      }

      const nonce = chal.nonce

      const message = [
        `UltraShop Hidden Content Access`,
        `Domain: ${origin}`,
        `Wallet: ${account.address.toLowerCase()}`,
        `Store: ${storeContractByURL.toLowerCase()}`,
        `Barcode: ${barcode}`,
        `Timestamp: ${timestamp}`,
        `Nonce: ${nonce}`,
        `ChainId: ${account.chainId || ''}`,
      ].join('\n')

      const signature = await account.signMessage({ message })

      const response = await fetch(`${API_URL}/access-hidden-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: account.address,
          signature,
          timestamp,
          storeAddress: storeContractByURL,
          productBarcode: barcode,
          nonce,
          chainId: account.chainId,
        }),
      })

      if (response.status === 404) {
        setOwnerShip(true)
        setRendered(true)
        setNoHiddenFile(true)
        setMedia('')
        setError(null)
        return
      }

      const data = await safeJson(response)

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Access Denied (HTTP ${response.status})`)
      }

      setMedia(data.ipfsHash || '')
      setOwnerShip(true)
      setRendered(true)
      setNoHiddenFile(false)
    } catch (err) {
      console.error('Unlock failed:', err)
      setError(err.message || 'Failed to verify ownership')
      setOwnerShip(false)
      setRendered(false)
      setNoHiddenFile(false)
      setMedia('')
    } finally {
      setIsLoading(false)
    }
  }

  const renderContent = () => {
    if (StoreURL === 'main' && ProductURL === 'LISTESH') {
      return (
        <div>
          <RegisterNewStore />
        </div>
      )
    }
    if (StoreURL === 'main' && ProductURL === 'LOTERRY') {
      return <City />
    }
    if (StoreURL === 'main' && ProductURL === 'PROS') {
      return <ActivatePromotion />
    }
    if (StoreURL === 'main' && ProductURL === 'FUNDPROS') {
      return <MemoryGame />
    }
    return null
  }

  return (
    <>
      {isLoading && <Loader />}

      <div className="py-[35px] mx-auto">{isMobile ? <FeaturedMobile /> : <Featured />}</div>

      {error && (
        <div className="text-red-500 text-center mt-4 bg-red-100/10 p-4 rounded-lg mx-auto w-11/12 max-w-md border border-red-500">
          <p className="font-bold">{error}</p>
        </div>
      )}

      <div className="min-h-screen rounded-[15px] mt-[20px] pb-[15px]">
        <h2 className="text-center font-bold text-[#00FFFF] text-[24px] my-[15px] pt-[20px]">
          NFT Hidden Media
        </h2>

        {ownerShip && rendered ? (
          <div className="animate-fade-in touch-auto">
            <p className="text-center text-green-400 mb-4">Access Granted ✅</p>

            {media ? (
                <IPFSMediaViewer
                  ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${media}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                  className="my-[50px] !w-11/12 mx-auto"
                />
            ) : (
              <div className="w-11/12 max-w-xl mx-auto mt-4 text-center text-yellow-300/90 bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4">
                Hidden file was not uploaded for this product yet.
              </div>
            )}

                <div className="w-11/12 md:w-6/12 mx-auto">
                {StoreURL === 'main' && ProductURL === 'LISTESH' && (
                    <div className="overflow-x-auto whitespace-pre-wrap break-words custom-scrollbar pb-2">
                    {renderDescriptionWithBreaks(
                        "$^*🚀 Welcome to Your New Business!*^$\n$Follow these steps to deploy your smart contracts and activate your store.$\n\n*~Step 1: Deploy Essential Tools~*\nBefore creating the shop, you need these helper contracts:\n• *Deploy Your Coin (Vote Power):* ~https://ultrashop.tech/deploy-esh~\n• *Deploy Invoice Minter:* ~https://ultrashop.tech/deploy-invoices~\n• *Deploy Voting Contract:* ~https://ultrashop.tech/deploy-votes~\n*~Step 2: Choose Your Shop Type~*\nRegister to thirdweb.com (with email) and deploy *ONE* of the following contracts based on your business model:\n\n*Option A: Retail Store (Standard)*\nBest for selling items like T-shirts, Digital Files, or Keys.\n👉 *Deploy Sales Shop:* ~https://thirdweb.com/ultimatedeal.eth/ESHStoreSales/1.1.4~ \n\n*Option B: Rental Store (Time-Based)*\nBest for Subscriptions, Memberships, or Renting assets.\n👉 *Deploy Rentals Shop:* ~https://thirdweb.com/ultimatedeal.eth/ESHStoreRentals/1.1.7~ \n\n$*Got your contracts?*\nGreat! Copy the contract addresses and fill out the registration form below.$"
                    )}
                    </div>
                )}
                </div>
            {renderContent()}
          </div>
        ) : (
          !rendered && (
            <div className="flex flex-col items-center justify-center space-y-4 my-10">
              <p className="text-gray-300 text-center px-4">
                This content is exclusive to NFT owners.
                <br />
                Please sign to verify ownership and unlock.
              </p>

              <button
                onClick={handleUnlockContent}
                disabled={isLoading || !isStoreLoaded}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-full shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : '🔓 Unlock Hidden Content'}
              </button>
            </div>
          )
        )}
      </div>
    </>
  )
}

export default Extra
