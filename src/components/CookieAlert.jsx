// src/components/CookieAlert.jsx
import React, { useEffect, useState, useRef } from 'react'
import { X } from 'lucide-react' // optional icon lib (if you already use it)

const STORAGE_KEY = 'ultra_cookie_consent' // values: 'all' | 'essential'

const CookieAlert = () => {
  const [open, setOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const closeBtnRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      setOpen(true)
    }
  }, [])

  useEffect(() => {
    if (open && closeBtnRef.current) {
      closeBtnRef.current.focus()
    }
  }, [open])

  const accept = (value) => {
    localStorage.setItem(STORAGE_KEY, value)
    setOpen(false)
    setShowSettings(false)
  }

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setOpen(true)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-6 sm:pb-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-title"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/15 bg-black/70 backdrop-blur shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5">
          <div className="pr-6">
            <h2 id="cookie-title" className="text-white text-lg sm:text-xl font-bold">
              Cookies? Yes. Sadly not chocolate.
            </h2>
            <p className="text-white/80 text-sm sm:text-base mt-1">
              We use teeny tiny cookies to remember your settings and measure what’s working.
              No creepy tracking, no surprise calories.
            </p>
          </div>
          <button
            ref={closeBtnRef}
            className="text-white/70 hover:text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Dismiss cookie alert (defaults to essential only)"
            onClick={() => accept('essential')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Settings collapsible */}
        {showSettings && (
          <div className="px-4 sm:px-5 pb-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/85">
              <p className="mb-2">
                <span className="font-semibold">What’s in the jar?</span> Just essentials (like remembering you’re
                logged in / basic preferences) and a sprinkle of privacy-friendly analytics to keep the app fast.
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li><b>Essential:</b> session & preference cookies.</li>
                <li><b>Analytics-lite:</b> anonymous usage metrics to fix bugs and improve UI.</li>
              </ul>
              <p className="mt-2">
                Want the long, serious version? Read our{' '}
                <a href="/privacy" className="text-amber-300 underline underline-offset-2 hover:text-amber-200">
                  Privacy Policy
                </a>.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => accept('essential')}
                  className="px-3 py-2 rounded-lg border border-white/15 bg-white/10 text-white hover:bg-white/15 transition"
                >
                  Save: Essential Only
                </button>
                <button
                  onClick={() => accept('all')}
                  className="px-3 py-2 rounded-lg bg-emerald-500/80 hover:bg-emerald-500 text-black font-semibold transition"
                >
                  Save: I love all cookies
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 p-4 sm:p-5 pt-2 sm:pt-3 border-t border-white/10">
          <button
            onClick={() => accept('all')}
            className="w-full sm:w-auto inline-flex justify-center px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition"
          >
            Accept All Cookies
          </button>
          <button
            onClick={() => accept('essential')}
            className="w-full sm:w-auto inline-flex justify-center px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10 transition"
          >
            Only Essential
          </button>
          <button
            onClick={() => setShowSettings((s) => !s)}
            className="w-full sm:w-auto inline-flex justify-center px-4 py-2.5 rounded-xl border border-amber-300/40 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20 transition"
          >
            {showSettings ? 'Close Settings' : 'Cookie Settings'}
          </button>

          {/* Tiny link to “reset” for testing in dev */}
          <button
            onClick={reset}
            className="ml-auto text-xs text-white/50 hover:text-white/80 underline underline-offset-4 hidden sm:inline"
            title="Clear choice (dev/testing)"
          >
            reset choice
          </button>
        </div>
      </div>
    </div>
  )
}

export default CookieAlert
