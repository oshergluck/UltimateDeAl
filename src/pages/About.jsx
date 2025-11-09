import React, { useEffect, useState } from 'react';
import { useStateContext } from '../context';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { emailUsAbout } = useStateContext();
  const [showSpecs, setShowSpecs] = useState(false);

  const handleContactAbout = () => {
    emailUsAbout();
  };

  return (
    <>
      {/* HERO */}
      <section className="w-full linear-gradient1 rounded-t-[12px] px-4 sm:px-6 md:px-10 py-10 mt-5">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-white text-3xl sm:text-5xl font-extrabold tracking-tight">
            UltraShop — Bonding Curve Launch
          </h1>
          <p className="text-white/85 text-base sm:text-lg mt-4 max-w-3xl mx-auto">
            Buy early, ride the curve. This smart contract starts with
            <span className="text-amber-300 font-semibold"> 6,000 USDC virtual liquidity</span>.
            When <span className="text-emerald-300 font-semibold">30% of the supply is sold</span>,
            it auto-creates a locked LP on BaseSwap at a
            <span className="text-amber-300 font-semibold"> +35% price premium</span>.
          </p>

          {/* Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm border border-white/15">
              Chain: Base
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm border border-white/15">
              DEX: BaseSwap (UniV2 style)
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm border border-white/15">
              LP Locked (burned LP)
            </span>
          </div>

          {/* CTA (FOMO) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center rounded-xl bg-emerald-500/15 border border-emerald-400/30 px-4 py-2 text-sm text-emerald-200">
              🚀 LP flips on at 30% sold — early entries win
            </span>
            <span className="inline-flex items-center rounded-xl bg-amber-500/15 border border-amber-400/30 px-4 py-2 text-sm text-amber-200">
              ⏳ Premium LP at +35% — don’t miss the switch
            </span>
          </div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="px-4 sm:px-6 md:px-10 py-8 linear-gradient1">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur">
            <div className="text-white/60 text-sm">Virtual Liquidity</div>
            <div className="text-white text-2xl font-bold mt-1">6,000 USDC</div>
            <p className="text-white/70 text-sm mt-2">Smoother early price action.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur">
            <div className="text-white/60 text-sm">LP Trigger</div>
            <div className="text-white text-2xl font-bold mt-1">30% Sold</div>
            <p className="text-white/70 text-sm mt-2">Auto-launch on BaseSwap.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur">
            <div className="text-white/60 text-sm">Launch Premium</div>
            <div className="text-white text-2xl font-bold mt-1">+35%</div>
            <p className="text-white/70 text-sm mt-2">Seeds depth at a premium.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur">
            <div className="text-white/60 text-sm">LP Status</div>
            <div className="text-white text-2xl font-bold mt-1">Locked</div>
            <p className="text-white/70 text-sm mt-2">LP tokens are burned.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 sm:px-6 md:px-10 py-10 linear-gradient1">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-white text-2xl sm:text-4xl font-bold text-center">How It Works</h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-white text-lg font-semibold">1) Deposit & Initialize</h3>
              <p className="text-white/80 text-sm mt-2">
                Creator deposits tokenA + USDC. The curve boots with
                <span className="text-amber-300"> 6,000 USDC virtual liquidity</span> to keep things steady.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-white text-lg font-semibold">2) Trade on the Curve</h3>
              <p className="text-white/80 text-sm mt-2">
                Buyers and sellers interact directly with the bonding curve. Fees settle on-chain. Transparent and instant.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-white text-lg font-semibold">3) Hit 30% Sold</h3>
              <p className="text-white/80 text-sm mt-2">
                Once <span className="text-emerald-300">30% of total supply is sold</span>, the contract prepares LP at
                <span className="text-amber-300"> +35%</span> above the current curve price.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-white text-lg font-semibold">4) LP Goes Live & Locks</h3>
              <p className="text-white/80 text-sm mt-2">
                Liquidity is added on BaseSwap and LP tokens are burned. Trading continues on the AMM pair.
              </p>
            </div>
          </div>

          {/* FOMO Callout */}
          <div className="mt-8 rounded-2xl border border-amber-300/25 bg-amber-400/10 p-6">
            <p className="text-amber-100 text-sm">
              <span className="font-semibold">Heads-up:</span> The LP flips when 30% is sold — and it launches at a premium.
              Early curve entries get the edge.
            </p>
          </div>
        </div>
      </section>

      {/* KEY MECHANICS */}
      <section className="px-4 sm:px-6 md:px-10 py-10 linear-gradient1">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-white text-2xl sm:text-4xl font-bold text-center">Key Mechanics</h2>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <h4 className="text-white font-semibold">Bonding-Curve Pricing</h4>
              <p className="text-white/75 text-sm mt-2">
                Price reacts to virtual reserves (token &amp; USDC). Virtual liq calms early swings and sets a clearer trend.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <h4 className="text-white font-semibold">Auto LP at +35%</h4>
              <p className="text-white/75 text-sm mt-2">
                When 30% is sold, the contract seeds BaseSwap at a premium to anchor depth from day one.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <h4 className="text-white font-semibold">Locked Liquidity</h4>
              <p className="text-white/75 text-sm mt-2">
                LP tokens are burned so the pool stays put. No pull, no games.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DEV SPECS (Collapsible) */}
      <section className="px-4 sm:px-6 md:px-10 pb-4 linear-gradient1">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setShowSpecs((v) => !v)}
            className="w-full flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-white hover:bg-white/10 transition"
          >
            <span className="text-base sm:text-lg font-semibold">Dev Specs</span>
            <span className="text-white/70 text-sm">{showSpecs ? 'Hide' : 'Show'}</span>
          </button>

          {showSpecs && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="text-white/60 text-xs uppercase">Addresses (Base)</div>
                <ul className="mt-2 space-y-2 text-white/80 text-sm break-all">
                  <li><span className="text-white/60">USDC:</span> 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913</li>
                  <li><span className="text-white/60">Router (BaseSwap):</span> 0x327Df1E6de05895d2ab08513aaDD9313Fe505d86</li>
                  <li><span className="text-white/60">Factory (BaseSwap):</span> 0xFDa619b6d20975be80A10332cD39b9a4b0FAa8BB</li>
                  <li><span className="text-white/60">UltraShop:</span> 0x978cCF0a4fBa58b6af4da9Ed5836e52e6a5f2e05</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="text-white/60 text-xs uppercase">Curve & LP</div>
                <ul className="mt-2 space-y-2 text-white/80 text-sm">
                  <li><span className="text-white/60">Virtual USDC:</span> 6,000</li>
                  <li><span className="text-white/60">LP Trigger:</span> 30% sold</li>
                  <li><span className="text-white/60">LP Premium:</span> +35%</li>
                  <li><span className="text-white/60">LP Lock:</span> LP tokens burned</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="text-white/60 text-xs uppercase">Token & Fees</div>
                <ul className="mt-2 space-y-2 text-white/80 text-sm">
                  <li><span className="text-white/60">Required tokenA deposit:</span> 1,000,000,000 (18d)</li>
                  <li><span className="text-white/60">Platform Fee:</span> 2% (200 bps)</li>
                  <li><span className="text-white/60">Creator Fee:</span> 1% (100 bps)</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 md:col-span-2 lg:col-span-3">
                <div className="text-white/60 text-xs uppercase">Notes</div>
                <ul className="mt-2 space-y-1 text-white/80 text-sm list-disc list-inside">
                  <li>Bonding curve uses constant-product style returns with virtual reserves.</li>
                  <li>Quotes: <code className="px-1 py-0.5 bg-white/10 rounded">getBuyQuote</code>, <code className="px-1 py-0.5 bg-white/10 rounded">getSellQuote</code>.</li>
                  <li>Creator/Platform USDC fees accrue and are withdrawable via dedicated functions.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full linear-gradient1 px-4 sm:px-6 md:px-10 py-12 rounded-b-[12px]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-white text-2xl sm:text-4xl font-bold text-center">FAQ</h2>

          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-amber-300 font-semibold">What’s “6,000 USDC virtual liquidity”?</h3>
              <p className="text-white/80 text-sm mt-2">
                It’s a virtual reserve used in the price formula. It smooths early trades before LP goes live.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-amber-300 font-semibold">When does the LP launch?</h3>
              <p className="text-white/80 text-sm mt-2">
                When <span className="text-emerald-300">30% of the total supply is sold</span>. LP is created on BaseSwap at
                a <span className="text-amber-300 font-semibold">+35%</span> premium to the current curve price.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-amber-300 font-semibold">Is the LP actually locked?</h3>
              <p className="text-white/80 text-sm mt-2">
                Yes. LP tokens are sent to the dead address (burned) so they can’t be withdrawn.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-amber-300 font-semibold">What do I need to buy?</h3>
              <p className="text-white/80 text-sm mt-2">
                USDC on Base. Approve, then buy directly on the coin page. Simple.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="flex justify-center mt-10">
            <button
              onClick={handleContactAbout}
              className="inline-flex items-center justify-center rounded-xl border border-amber-300/60 bg-amber-400/10 text-amber-200 px-5 py-2.5 text-sm font-semibold hover:bg-amber-400/20 hover:border-amber-300 transition"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
