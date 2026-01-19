import React, { useEffect } from 'react'
import { CustomButton } from '../components'
import { useStateContext } from '../context'

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { emailUsAboutTerms } = useStateContext()

  return (
    <div className="w-full mx-auto mt-[15px] mb-[100px]">
      {/* HERO */}
      <section className="rounded-t-[12px] px-4 sm:px-6 md:px-10 pt-10 pb-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-white text-3xl sm:text-5xl font-extrabold tracking-tight">
            Terms of Service — UltraShop
          </h1>
          <p className="text-white/85 text-base sm:text-lg mt-4 max-w-3xl mx-auto">
            These Terms govern your use of UltraShop’s on-chain bonding-curve market implemented by the{' '}
            <b>BondingCurveDEX</b> smart contract on Base. By using the website UI or calling the Contract directly,
            you agree to these Terms.
          </p>

          {/* Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm border border-white/15">Chain: Base</span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm border border-white/15">Quote: USDC</span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm border border-white/15">LP Trigger: 30% sold</span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm border border-white/15">LP Launch: +35% premium</span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm border border-white/15">LP Locked (burned)</span>
          </div>
        </div>
      </section>

      {/* QUICK INFO STRIP */}
      <section className="px-4 sm:px-6 md:px-10 py-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur">
            <div className="text-white/60 text-sm">Virtual Liquidity</div>
            <div className="text-white text-2xl font-bold mt-1">6,000 USDC</div>
            <p className="text-white/70 text-sm mt-2">Smoother early price action.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur">
            <div className="text-white/60 text-sm">Fees (per trade)</div>
            <div className="text-white text-2xl font-bold mt-1">2% + 1%</div>
            <p className="text-white/70 text-sm mt-2">2% platform, 1% creator (USDC).</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur">
            <div className="text-white/60 text-sm">LP Trigger</div>
            <div className="text-white text-2xl font-bold mt-1">30% Sold</div>
            <p className="text-white/70 text-sm mt-2">Auto-launch on BaseSwap.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur">
            <div className="text-white/60 text-sm">LP Launch Price</div>
            <div className="text-white text-2xl font-bold mt-1">+35%</div>
            <p className="text-white/70 text-sm mt-2">Over current curve price.</p>
          </div>
        </div>
      </section>

      {/* TERMS BODY */}
      <section className=" px-4 sm:px-6 md:px-10 py-10 rounded-b-[12px]">
        <div className="max-w-6xl mx-auto">
          {/* 1. Introduction */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 mb-5">
            <h2 className="text-[#FFDD00] font-semibold text-lg">1) Introduction</h2>
            <p className="text-white/85 text-sm sm:text-base mt-2">
              These Terms (<b>“Terms”</b>) apply to your use of UltraShop’s website and interactions with the{' '}
              <b>BondingCurveDEX</b> smart contract (<b>“Contract”</b>) on Base. If you do not agree, do not use the services.
            </p>
          </div>

          {/* 2. Roles & Scope */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 mb-5">
            <h2 className="text-[#FFDD00] font-semibold text-lg">2) Roles &amp; Scope</h2>
            <p className="text-white/85 text-sm sm:text-base mt-2">
              UltraShop provides a non-custodial bonding-curve market where creators can initialize a market for their token
              and users can buy/sell against USDC until an LP is created. After LP creation, trading should occur on the AMM
              (e.g., BaseSwap/Uniswap).
            </p>
            <ul className="list-disc ml-5 mt-3 text-white/85 text-sm space-y-1">
              <li><b>Creator</b>: deposits tokenA and initializes the market.</li>
              <li><b>User/Trader</b>: buys/sells tokenA with USDC against the Contract (pre-LP).</li>
              <li><b>UltraShop</b>: operates the UI and owns the Contract; never custodial of user funds.</li>
            </ul>
          </div>

          {/* 3. Eligibility */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 mb-5">
            <h2 className="text-[#FFDD00] font-semibold text-lg">3) Eligibility</h2>
            <p className="text-white/85 text-sm sm:text-base mt-2">
              You must be of legal age and have authority to agree to these Terms. You are solely responsible for complying
              with applicable laws related to digital assets in your jurisdiction.
            </p>
          </div>

          {/* 4. Network & Addresses */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 mb-5">
            <h2 className="text-[#FFDD00] font-semibold text-lg">4) Network &amp; On-Chain Addresses</h2>
            <p className="text-white/85 text-sm sm:text-base mt-2">
              The Contract operates on <b>Base</b>. You pay your own gas. Key integrations:
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-white/85 text-sm break-all">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-white/60 text-xs uppercase">USDC (Base)</div>
                <code className="mt-1 block">0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913</code>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-white/60 text-xs uppercase">UltraShop (BondingCurveDEX)</div>
                <code className="mt-1 block">0x2bbedb2778996B849BaEebd0d81d55e31c1b29C8</code>
              </div>
            </div>
            <p className="text-white/70 text-xs mt-3">
              Always verify contract addresses in the official UI or documentation before interacting.
            </p>
          </div>

          {/* 5. Creator Requirements */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 mb-5">
            <h2 className="text-[#FFDD00] font-semibold text-lg">5) Creator Requirements</h2>
            <ul className="list-disc ml-5 mt-2 text-white/85 text-sm space-y-2">
              <li>Your token must be ESH-compatible and implement <code className="px-1 py-0.5 bg-white/10 rounded">getHolders()</code> and <code className="px-1 py-0.5 bg-white/10 rounded">isReady()</code>.</li>
              <li>Deposit exactly <b>1,000,000,000</b> tokenA (18 decimals) to initialize.</li>
              <li>Provide initial USDC (min <b>1 USDC</b>) to seed bonding-curve reserves.</li>
              <li>Acknowledge the market is <b>non-custodial</b> and fully on-chain.</li>
            </ul>
          </div>

          {/* 6. Trading & Pricing (UPDATED to 30% / +35%) */}
          <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-6 mb-5">
            <h2 className="text-emerald-200 font-semibold text-lg">6) Trading &amp; Pricing</h2>
            <p className="text-emerald-50/90 text-sm sm:text-base mt-2">
              Pre-LP, buys/sells occur directly against the Contract’s virtual reserves (constant-product style). Key parameters:
            </p>
            <ul className="list-disc ml-5 mt-2 text-emerald-50/90 text-sm space-y-2">
              <li><b>Quote asset:</b> USDC only.</li>
              <li><b>Virtual USDC:</b> 6,000 to smooth early volatility.</li>
              <li><b>Minimum purchase:</b> 1 USDC (6 decimals).</li>
              <li><b>Fees per trade:</b> 2% platform + 1% creator (assessed on USDC).</li>
              <li><b>LP trigger:</b> when <b>30% of total supply is sold</b>, the Contract seeds an LP on BaseSwap at a <b>+35%</b> premium to the current curve price.</li>
              <li><b>Post-LP:</b> market is AMM-backed; further trading should occur on the LP pair.</li>
              <li><b>Price:</b> dynamic; may move sharply with trades and reserve changes.</li>
            </ul>
          </div>

          {/* 7. Fees & Withdrawals */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 mb-5">
            <h2 className="text-[#FFDD00] font-semibold text-lg">7) Fees &amp; Withdrawals</h2>
            <ul className="list-disc ml-5 mt-2 text-white/85 text-sm space-y-2">
              <li><b>Platform fee:</b> accrues in USDC to the Contract owner; withdrawable by owner.</li>
              <li><b>Creator fee:</b> accrues in USDC to the token creator; withdrawable by creator.</li>
              <li><b>Non-custodial:</b> UltraShop never holds user funds or keys.</li>
            </ul>
          </div>

          {/* 8. Non-Custodial & Refunds */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 mb-5">
            <h2 className="text-[#FFDD00] font-semibold text-lg">8) Non-Custodial &ldquo;Refunds&rdquo;</h2>
            <p className="text-white/85 text-sm sm:text-base mt-2">
              There are no off-chain refunds. Pre-LP, you may call <code className="px-1 py-0.5 bg-white/10 rounded">sellTokens</code> to exit into USDC, subject to pricing,
              fees, and available USDC reserves. Post-LP, selling occurs on the AMM at market prices.
              On-chain transactions are irreversible.
            </p>
          </div>

          {/* 9. Risk Disclosure */}
          <div className="rounded-2xl border border-amber-300/25 bg-amber-400/10 p-6 mb-5">
            <h2 className="text-amber-100 font-semibold text-lg">9) Risk Disclosure</h2>
            <ul className="list-disc ml-5 mt-2 text-amber-50/90 text-sm space-y-2">
              <li>Digital assets are volatile; you can lose all or substantial funds.</li>
              <li>Smart contracts may contain bugs or be exploited.</li>
              <li>Liquidity may be insufficient; slippage may be significant.</li>
              <li>UltraShop provides no investment, legal, or tax advice.</li>
            </ul>
          </div>

          {/* 10. Prohibited Use */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 mb-5">
            <h2 className="text-[#FFDD00] font-semibold text-lg">10) Prohibited Use</h2>
            <p className="text-white/85 text-sm sm:text-base mt-2">
              You may not use the Contract or website for unlawful purposes (including money laundering, terrorism financing,
              or distributing illegal/NSFW content). UI access may be restricted where required by law; on-chain data is immutable.
            </p>
          </div>

          {/* 11. Website vs Contract */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 mb-5">
            <h2 className="text-[#FFDD00] font-semibold text-lg">11) Website vs. Smart Contract</h2>
            <p className="text-white/85 text-sm sm:text-base mt-2">
              The website is a convenience interface. The Contract is the source of truth. If UI and Contract differ, the{' '}
              <b>Contract prevails</b>. You may always interact directly from a compatible wallet.
            </p>
          </div>

          {/* 12. Availability & Changes */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 mb-5">
            <h2 className="text-[#FFDD00] font-semibold text-lg">12) Availability &amp; Changes</h2>
            <p className="text-white/85 text-sm sm:text-base mt-2">
              We may update the UI/parameters or deploy upgraded contracts, and we may suspend/limit UI access for
              maintenance, abuse, or legal reasons. On-chain transactions cannot be reversed by us.
            </p>
          </div>

          {/* 13. Limitation of Liability */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 mb-5">
            <h2 className="text-[#FFDD00] font-semibold text-lg">13) Limitation of Liability</h2>
            <p className="text-white/85 text-sm sm:text-base mt-2">
              To the maximum extent permitted by law, UltraShop and its owners are not liable for any indirect, incidental,
              special, consequential, or punitive damages, or loss of profits, revenues, data, or use. Your sole remedy is to
              stop using the services.
            </p>
          </div>

          {/* 14. Security & Responsibility */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 mb-5">
            <h2 className="text-[#FFDD00] font-semibold text-lg">14) Security &amp; Your Responsibility</h2>
            <ul className="list-disc ml-5 mt-2 text-white/85 text-sm space-y-2">
              <li>You control your wallet and private keys; keep them secure.</li>
              <li>Verify contract addresses and transactions before signing.</li>
              <li>Beware of phishing and fake sites; double-check URLs.</li>
            </ul>
          </div>

          {/* 15. Platform Fees (Disclosure) */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 mb-5">
            <h2 className="text-[#FFDD00] font-semibold text-lg">15) Platform Fees (Disclosure)</h2>
            <p className="text-white/85 text-sm sm:text-base mt-2">
              Trading fees at the Contract are 2% platform + 1% creator per trade (on USDC). Any separate listing/promotion
              fees (if any) will be shown in the UI and are non-refundable once paid.
            </p>
          </div>

          {/* 16. Transparency */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6 mb-5">
            <h2 className="text-[#FFDD00] font-semibold text-lg">16) Transparency</h2>
            <p className="text-white/85 text-sm sm:text-base mt-2">
              Some code or docs may be available publicly:
            </p>
            <a
              href="https://github.com/oshergluck/UltimateDeAl"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline font-semibold text-sm sm:text-base mt-2 inline-block"
            >
              GitHub Repository
            </a>
          </div>

          {/* Footer strip */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
            <p className="text-white/60 text-xs sm:text-sm">Last updated: 09/11/2025</p>
            <div className="">
              <CustomButton
                btnType="button"
                title="Email Us"
                styles="w-10/12 bg-transparent border-[#FFDD00] border-[1px] text-[white] drop-shadow-md"
                handleClick={() => emailUsAboutTerms()}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Terms
