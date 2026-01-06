// CoinBox.jsx
import React from 'react'
import { ethers } from 'ethers'

const formatUnits = (value, decimals, maxDecimals = 6) => {
  try {
    const formatted = ethers.utils.formatUnits(value?.toString?.() ?? value, decimals)
    const [i, f = ''] = formatted.split('.')
    const fTrim = f.slice(0, maxDecimals).replace(/0+$/, '')
    return fTrim ? `${i}.${fTrim}` : i
  } catch {
    return '0'
  }
}

const formatCurrency = (value, decimals = 6) => {
  const num = Number(formatUnits(value, decimals, 8))
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(
    Number.isFinite(num) ? num : 0
  )
}

const formatPriceFull = (value, decimals = 18, maxDecimals = 18) => {
  try {
    const s = ethers.utils.formatUnits(value?.toString?.() ?? value, decimals)
    const [intp, fracp = ''] = s.split('.')
    const frac = fracp.slice(0, maxDecimals).replace(/0+$/, '')
    return frac.length ? `${intp}.${frac}` : intp
  } catch {
    return '0'
  }
}

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
  

export default function CoinBox({
  address,
  name,
  symbol,
  decimals,
  price,
  priceDecimals = 18,
  usdcReserve,
  tokenReserve,
  percentagePurchased,
  lpCreated,
  createdAt,
  totalVolume,
  logo,
  onOpen,
}) {
  return (
    <div className="bg-white/5 backdrop-blur rounded-2xl p-4 border border-white/10 hover:border-white/20 transition">
      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
          {logo ? (
            <img src={logo} alt={symbol || 'token'} className="w-full h-full object-cover" />
          ) : (
            <div className="text-white/40 text-xs px-1 text-center">No Logo</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-white font-semibold truncate">
                {name || 'Unknown'} <span className="text-white/50">({symbol || 'TOK'})</span>
              </div>
              <div className="text-white/40 text-xs truncate">
                {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : ''}
              </div>
            </div>
            <div className="text-right">
              <div className="text-white text-lg font-semibold">
                {formatTinyPriceDisplay(formatPriceFull(price, 12, 18))}
              </div>
              {typeof percentagePurchased === 'number' && (
                <div className="text-white/50 text-xs">{percentagePurchased}% to LP</div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div>
              <div className="text-white/50 text-xs">Reserve</div>
              <div className="text-white text-sm">${formatCurrency(usdcReserve, 6)}</div>
            </div>
            <div>
              <div className="text-white/50 text-xs">Total Vol</div>
              <div className="text-white text-sm">${formatCurrency(totalVolume || 0n, 6)}</div>
            </div>
          </div>

          {/* Progress + Percentage Tag */}
          <div className="mt-3 relative">
            <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${lpCreated ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-emerald-500'}`}
                style={{ width: `${Math.min((percentagePurchased || 0) * 2, 100)}%` }}
              />
            </div>

            {/* Percentage Tag */}
            <div
              className="absolute -top-6 right-0 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm"
              style={{
                transform: `translateX(${Math.min((percentagePurchased || 0) * 2, 100)}%)`,
                transition: 'transform 0.3s ease',
              }}
            >
              {percentagePurchased || 0}%
            </div>

            {lpCreated && <div className="text-emerald-400 text-xs mt-1">LP Created ✓</div>}
          </div>

          <div className="mt-4">
            <button
              onClick={onOpen}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm w-full"
            >
              Open
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
