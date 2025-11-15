"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Zap } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function PricingPage() {
  const [payAsYouGoOption, setPayAsYouGoOption] = useState("5")
  const [proOption, setProOption] = useState("50")

  const payAsYouGoPricing: Record<string, number> = {
    "5": 3,
    "15": 9,
    "50": 26,
    "100": 45,
    "500": 169,
    "1000": 299,
  }

  const proPricing: Record<string, number> = {
    "50": 9,
    "250": 39,
    "500": 79,
    "1000": 169,
    "2500": 299,
    "5000": 499,
  }

  const PAYG_PRICE_IDS: Record<string, string> = {
    "5": "price_1SSrc4C7SdJDqSQL9Zl6ZSPz",
    "15": "price_1ST76xC7SdJDqSQLwGjqxRmt",
    "50": "price_1ST7EIC7SdJDqSQLarYb4WgE",
    "100": "price_1ST7EIC7SdJDqSQLa34lWIMK",
    "500": "price_1ST7EIC7SdJDqSQLRLfW3Lbh",
    "1000": "price_1ST7EIC7SdJDqSQL8RFOBHvs",
  }

  const PRO_PRICE_IDS: Record<string, string> = {
    "50": "price_1ST85YC7SdJDqSQLl9BDMF9i",
    "250": "price_1ST85YC7SdJDqSQLmyewfZya",
    "500": "price_1ST85YC7SdJDqSQL2iAc6jQN",
    "1000": "price_1ST85YC7SdJDqSQLYsOqCYBO",
    "2500": "price_1ST85YC7SdJDqSQLdSUGJhXJ",
    "5000": "price_1ST85YC7SdJDqSQLAKFbT9fN",
  }

  return (
    <div className="min-h-screen bg-[#F4F5F6]">

      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          
          {/* LEFT SIDE */}
          <div className="flex items-center gap-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-transform hover:scale-105">
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-white">
                  <rect x="2" y="2" width="12" height="12" stroke="currentColor" strokeWidth="2" rx="2" opacity="0.4" />
                  <rect x="10" y="10" width="12" height="12" fill="currentColor" rx="2" />
                </svg>
              </div>
              <span className="text-xl font-semibold tracking-tight">
                <span className="text-gray-700">remove-background</span>
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent font-bold">.tech</span>
              </span>
            </Link>

            {/* Home Link */}
            <Link href="/" className="hidden md:flex text-sm text-gray-700 hover:text-gray-900 font-bold">
              Home
            </Link>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-700 hover:text-gray-900 font-bold">
              Log in
            </Link>
            <Link href="/signup" className="text-sm text-gray-700 hover:text-gray-900 font-bold">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Heading */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-800 md:text-5xl">Choose Your Plan</h1>
          <p className="text-lg text-gray-600">Start free. Scale fast. Never overpay.</p>
        </div>

        {/* Pricing Cards - aligned */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 items-start">

          {/* PAY AS YOU GO */}
          <Card className="flex flex-col rounded-2xl bg-white p-8 shadow-lg">
            
            {/* Title */}
            <h3 className="text-3xl font-bold text-gray-800 mb-6">Pay as you go credits</h3>

            {/* Dropdown */}
            <div className="mb-6">
              <label className="mb-2 block text-sm text-gray-600">Amount</label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700"
                value={payAsYouGoOption}
                onChange={(e) => setPayAsYouGoOption(e.target.value)}
              >
                <option value="5">5 credits - $3</option>
                <option value="15">15 credits - $9</option>
                <option value="50">50 credits - $26</option>
                <option value="100">100 credits - $45</option>
                <option value="500">500 credits - $169</option>
                <option value="1000">1000 credits - $299</option>
              </select>
            </div>

            {/* Price */}
            <div className="mb-6 h-[60px] flex items-start">
              <span className="text-5xl font-bold text-gray-800">${payAsYouGoPricing[payAsYouGoOption]}</span>
            </div>

            {/* Button */}
            <form action="/api/checkout" method="POST">
              <input type="hidden" name="priceId" value={PAYG_PRICE_IDS[payAsYouGoOption]} />
              <Button type="submit" className="mb-6 w-full rounded-full bg-blue-600 py-6 text-base text-white hover:bg-blue-700">
                Buy now
              </Button>
            </form>

            {/* Description — restored original look */}
            <div className="space-y-2 text-gray-600 leading-relaxed">
              <p><b>Pay-as-you-go</b> — start small, scale instantly.</p>
              <p>Buy just what you need — no commitment.</p>
              <p>Run out? Top up credits in seconds, or upgrade to a monthly plan anytime.</p>
            </div>
          </Card>

          {/* PRO PACKAGE */}
          <Card className="relative flex flex-col rounded-2xl border-2 border-yellow-400 bg-white p-8 shadow-xl">

            {/* Most Popular Label */}
            <span className="absolute -top-3 right-6 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-gray-900">
              Most Popular
            </span>

            <div className="mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-3xl font-bold text-gray-800">Pro Package</h3>
                <Zap className="size-6 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-sm text-gray-600">
                Use up to <span className="font-semibold">{proOption}</span> credits per month
              </p>
            </div>

            {/* Dropdown */}
            <div className="mb-6">
              <label className="mb-2 block text-sm text-gray-600">Amount</label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700"
                value={proOption}
                onChange={(e) => setProOption(e.target.value)}
              >
                <option value="50">50 credits - $9 / month</option>
                <option value="250">250 credits - $39 / month</option>
                <option value="500">500 credits - $79 / month</option>
                <option value="1000">1000 credits - $169 / month</option>
                <option value="2500">2500 credits - $299 / month</option>
                <option value="5000">5000 credits - $499 / month</option>
              </select>
            </div>

            {/* Price */}
            <div className="mb-6 h-[60px] flex items-start">
              <span className="text-5xl font-bold text-gray-800">${proPricing[proOption]}</span>
              <span className="text-gray-600 text-xl ml-1">/ month</span>
            </div>

            {/* Button */}
            <form action="/api/checkout" method="POST">
              <input type="hidden" name="priceId" value={PRO_PRICE_IDS[proOption]} />
              <Button type="submit" className="mb-6 w-full rounded-full bg-blue-600 py-6 text-base text-white hover:bg-blue-700">
                Subscribe
              </Button>
            </form>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-gray-800 font-bold text-xl">Pro - Removes Watermarks</p>

              <ul className="space-y-1 text-gray-600 text-sm">
                <li className="font-bold text-xl">Full HD Images</li>
                <li className="font-bold text-xl">Best Option - Save Money</li>
                <li className="font-bold text-xl">{`Starting at $9 a month cancel anytime`}</li>
              </ul>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
