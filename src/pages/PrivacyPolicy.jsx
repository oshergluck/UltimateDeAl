// src/pages/PrivacyPolicy.jsx
import React, { useEffect } from 'react'
import { CustomButton } from '../components'
import { useStateContext } from '../context'

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const { emailUsAboutPrivacyPolicy } = useStateContext()

  return (
    <div className="w-full mx-auto mt-[40px] mb-[80px]">
      {/* Hero */}
      <section className="linear-gradient1 rounded-[15px] px-4 sm:px-6 md:px-10 pt-10 pb-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-white font-epilogue font-extrabold text-[28px] sm:text-[42px] leading-tight">
            Privacy Policy
          </h1>
          <p className="text-white/85 text-sm sm:text-base max-w-3xl mx-auto mt-3">
            We respect your privacy. We also respect actual cookies. Unfortunately, we only serve digital ones.
          </p>

          {/* fun badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm border border-white/15">Minimal cookies</span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm border border-white/15">No creepy tracking</span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm border border-white/15">On-chain transparency</span>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="linear-gradient1 rounded-b-[15px] px-4 sm:px-6 md:px-10 pb-8 pt-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 1. Intro */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <h2 className="text-[#FFDD00] font-epilogue font-semibold text-[16px]">1. Introduction</h2>
            <p className="text-white/85 font-epilogue text-[15px] sm:text-[16px] mt-2">
              UltraShop (“<b>UltraShop</b>”, “<b>we</b>”, “<b>our</b>”) explains here what we collect and why.
              This covers our website/app UI and interactions with the BondingCurveDEX smart contract on Base (the “<b>Services</b>”).
            </p>
          </div>

          {/* 2. What we collect */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <h2 className="text-[#FFDD00] font-epilogue font-semibold text-[16px]">2. What We Collect</h2>
            <ul className="list-disc ml-5 mt-2 space-y-2 text-white/90 font-epilogue text-[15px] sm:text-[16px]">
              <li><b>Wallet & On-Chain:</b> public addresses and transactions (they are public by design).</li>
              <li><b>Usage:</b> page views, clicks, performance metrics (to fix bugs & improve UX).</li>
              <li><b>Technical:</b> IP-based rough location, user agent, referrer/UTM, cookie IDs.</li>
              <li><b>Contact (optional):</b> if you email or register interest (name, email, etc.).</li>
            </ul>
          </div>

          {/* 3. Cookies */}
          <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-6">
            <h2 className="text-emerald-100 font-epilogue font-semibold text-[16px]">3. Cookies (The Digital Kind)</h2>
            <p className="text-emerald-50/90 font-epilogue text-[15px] sm:text-[16px] mt-2">
              We use a small number of cookies/local storage entries to remember preferences and keep the app snappy.
              That’s it. No stalking, no selling your data.
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-emerald-50/90 text-[14px] sm:text-[15px]">
              <li><b>Essential:</b> session, settings, and consent choice.</li>
              <li><b>Analytics-lite:</b> privacy-friendly, aggregated usage metrics.</li>
            </ul>
            <p className="text-emerald-50/80 text-[14px] mt-2">
              You can manage cookies in your browser or via the cookie banner. Blocking some may affect features.
            </p>
          </div>

          {/* 4. Blockchain transparency */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <h2 className="text-[#FFDD00] font-epilogue font-semibold text-[16px]">4. Blockchain Transparency</h2>
            <p className="text-white/85 font-epilogue text-[15px] sm:text-[16px] mt-2">
              Base transactions are public and permanent. We can’t edit or delete on-chain records. Third-party explorers and
              indexers may display your public address and transactions.
            </p>
          </div>

          {/* 5. Uses */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <h2 className="text-[#FFDD00] font-epilogue font-semibold text-[16px]">5. How We Use Info</h2>
            <ul className="list-disc ml-5 mt-2 space-y-2 text-white/90 font-epilogue text-[15px] sm:text-[16px]">
              <li>Operate and improve the Services.</li>
              <li>Display on-chain data in dashboards.</li>
              <li>Security, abuse prevention, and debugging.</li>
              <li>Legal compliance and enforcing Terms.</li>
              <li>Support and product updates (if you opt-in).</li>
            </ul>
          </div>

          {/* 6. Sharing */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <h2 className="text-[#FFDD00] font-epilogue font-semibold text-[16px]">6. How We Share</h2>
            <ul className="list-disc ml-5 mt-2 space-y-2 text-white/90 font-epilogue text-[15px] sm:text-[16px]">
              <li><b>Service providers:</b> hosting, analytics, security, support.</li>
              <li><b>Compliance & safety:</b> when required by law or to protect rights.</li>
              <li><b>Business events:</b> merger/acquisition/financing, as permitted by law.</li>
              <li><b>Public chain:</b> anything you put on-chain is, well, public.</li>
            </ul>
          </div>

          {/* 7. Security */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <h2 className="text-[#FFDD00] font-epilogue font-semibold text-[16px]">7. Security</h2>
            <p className="text-white/85 font-epilogue text-[15px] sm:text-[16px] mt-2">
              We use reasonable safeguards, but no system is perfect. Protect your wallet, private keys, and devices.
            </p>
          </div>

          {/* 8. Your rights */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <h2 className="text-[#FFDD00] font-epilogue font-semibold text-[16px]">8. Your Choices & Rights</h2>
            <ul className="list-disc ml-5 mt-2 space-y-2 text-white/90 font-epilogue text-[15px] sm:text-[16px]">
              <li>Disconnect your wallet at any time.</li>
              <li>Request access/update to contact info you shared.</li>
              <li>We can delete contact/support data we control—but not blockchain data.</li>
              <li>Opt out of non-essential emails anytime.</li>
              <li>Regional rights honored as applicable.</li>
            </ul>
          </div>

          {/* 9–12 quickies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
              <h2 className="text-[#FFDD00] font-epilogue font-semibold text-[16px]">9. International Transfers</h2>
              <p className="text-white/85 font-epilogue text-[15px] sm:text-[16px] mt-2">
                Data may be processed in other countries with appropriate safeguards where required.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
              <h2 className="text-[#FFDD00] font-epilogue font-semibold text-[16px]">10. Children</h2>
              <p className="text-white/85 font-epilogue text-[15px] sm:text-[16px] mt-2">
                Not for kids under 13 (or higher by local law). We don’t knowingly collect children’s data.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
              <h2 className="text-[#FFDD00] font-epilogue font-semibold text-[16px]">11. Retention</h2>
              <p className="text-white/85 font-epilogue text-[15px] sm:text-[16px] mt-2">
                We keep data as needed for the Services and legal reasons. Blockchain data persists indefinitely.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
              <h2 className="text-[#FFDD00] font-epilogue font-semibold text-[16px]">12. Third-Party Links</h2>
              <p className="text-white/85 font-epilogue text-[15px] sm:text-[16px] mt-2">
                External tools/sites follow their own policies—please review them.
              </p>
            </div>
          </div>

          {/* 13–14 */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <h2 className="text-[#FFDD00] font-epilogue font-semibold text-[16px]">13. Changes</h2>
            <p className="text-white/85 font-epilogue text-[15px] sm:text-[16px] mt-2">
              We may update this policy; changes apply when posted.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <h2 className="text-[#FFDD00] font-epilogue font-semibold text-[16px]">14. Contact</h2>
            <p className="text-white/85 font-epilogue text-[15px] sm:text-[16px] mt-2">
              Questions or requests? <b>support@UltraShop.tech</b> or the links in the site footer.
            </p>
          </div>

          {/* Footer / CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-white/60 font-epilogue text-[13px] sm:text-[14px]">
              Last updated: 09/11/2025
            </p>
            <div className="flex justify-center">
              <CustomButton
                btnType="button"
                title="Email Us"
                styles="w-9/12 sm:w-full bg-transparent border-[#FFDD00] border-[1px] text-white drop-shadow-md"
                handleClick={() => emailUsAboutPrivacyPolicy()}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PrivacyPolicy
