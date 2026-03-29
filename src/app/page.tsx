'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [monthlyFoodCost, setMonthlyCost] = useState<number>(5000);
  const estimatedWastagePercent = 8;
  const estimatedWastage = (monthlyFoodCost * estimatedWastagePercent) / 100;
  const estimatedSavings = estimatedWastage * 0.4; // Assume 40% reduction with our app

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">PL</span>
            </div>
            <span className="text-xl font-bold text-primary hidden sm:inline">PlateLogic</span>
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-primary font-medium hover:text-accent transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 bg-accent text-white font-medium rounded-lg hover:bg-accent-light transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold text-primary mb-6 leading-tight">
            Stop Guessing How Much Food You Waste
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Start saving money with PlateLogic. Log waste in 3 seconds. Get weekly insights. Reduce costs by up to 40%.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition text-lg"
            >
              Try Free for 30 Days
            </Link>
            <button className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-gray-50 transition text-lg">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 mb-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-accent mb-2">3 sec</div>
            <p className="text-gray-600">Log each waste item</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-accent mb-2">$2,000+</div>
            <p className="text-gray-600">Avg annual savings</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-accent mb-2">200+</div>
            <p className="text-gray-600">Restaurants trust us</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-primary text-center mb-16">
            Why PlateLogic?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-14 h-14 bg-accent rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5M6.5 10l3 3 6-8" stroke="white" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Log in 3 Seconds</h3>
              <p className="text-gray-600">
                Tap pre-loaded ingredient cards. Built for busy kitchens. Works on phones, tablets, and iPad.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-14 h-14 bg-accent rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">See Where Money Goes</h3>
              <p className="text-gray-600">
                Track waste by ingredient, category, and time period. Visual charts show your biggest cost drivers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="w-14 h-14 bg-accent rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Get Actionable Advice</h3>
              <p className="text-gray-600">
                Weekly insights tell you exactly where to reduce waste. Real recommendations from restaurant experts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-primary text-center mb-12">
            Calculate Your Potential Savings
          </h2>
          <div className="bg-gradient-to-br from-primary to-blue-900 rounded-lg p-8 text-white">
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-3">
                Your Monthly Food Cost ($)
              </label>
              <input
                type="number"
                value={monthlyFoodCost}
                onChange={(e) => setMonthlyCost(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg text-primary text-lg font-semibold"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-blue-400">
                <span>Estimated Monthly Waste (8%)</span>
                <span className="text-2xl font-bold">${estimatedWastage.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-blue-400">
                <span>Potential Monthly Savings (40% reduction)</span>
                <span className="text-2xl font-bold text-accent-light">${estimatedSavings.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Annual Savings with PlateLogic</span>
                <span className="text-3xl font-bold text-accent-light">${(estimatedSavings * 12).toFixed(0)}</span>
              </div>
            </div>

            <p className="text-blue-100 text-sm mt-6">
              * Based on industry averages. Actual savings depend on your operations and waste reduction efforts.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-primary text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            No contracts. Cancel anytime. First month free.
          </p>

          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-accent">
            <div className="text-center mb-8">
              <div className="inline-block bg-accent text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                Most Popular
              </div>
              <div className="text-5xl font-bold text-primary mb-2">
                $79<span className="text-2xl text-gray-600">/mo</span>
              </div>
              <p className="text-green-600 font-semibold">First month free</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Unlimited waste entries</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Weekly insights & reports</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Mobile & iPad optimized</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Up to 3 team members</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Custom ingredient library</span>
              </li>
            </ul>

            <Link
              href="/signup"
              className="block w-full px-6 py-3 bg-accent text-white font-semibold text-center rounded-lg hover:bg-accent-light transition"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-primary text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary mb-2">
                How long does it take to set up?
              </h3>
              <p className="text-gray-600">
                Less than 5 minutes. Add your restaurant info, load our pre-built ingredient library, and start logging. That's it.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary mb-2">
                Can multiple staff members use it?
              </h3>
              <p className="text-gray-600">
                Yes. The plan includes access for up to 3 team members. You control who can log waste and who can view reports.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary mb-2">
                Does it work offline?
              </h3>
              <p className="text-gray-600">
                Not yet, but it's on our roadmap. For now, you need a data connection. Most restaurants have WiFi in the kitchen.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary mb-2">
                What if I want to cancel?
              </h3>
              <p className="text-gray-600">
                No problem. No contracts. Cancel anytime with a single click. We'll be sad to see you go, but there's no penalty.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Yes. We use enterprise-grade encryption and host on Supabase (backed by AWS). Your data is never sold or shared.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Saving?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of restaurants reducing waste and boosting profits with PlateLogic.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-light transition text-lg"
          >
            Get Started Free - No Credit Card Required
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PL</span>
                </div>
                <span className="text-white font-bold">PlateLogic</span>
              </div>
              <p className="text-sm">Food waste tracking for restaurants.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 flex items-center justify-between text-sm">
            <p>&copy; 2026 PlateLogic. All rights reserved.</p>
            <Link href="/admin" className="text-gray-600 hover:text-gray-400 transition text-xs">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
