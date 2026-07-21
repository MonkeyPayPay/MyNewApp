import { useEffect } from 'react'
import { track } from '../lib/analytics'
import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import Stats from '../components/landing/Stats'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import Testimonials from '../components/landing/Testimonials'
import Pricing from '../components/landing/Pricing'
import CTABanner from '../components/landing/CTABanner'
import Footer from '../components/landing/Footer'

export default function Landing({ onGetStarted, onGetStartedWithPlan }) {
  useEffect(() => { track('page_view', { page: 'landing' }, { once: true }) }, [])

  return (
    <div className="min-h-screen bg-ink-950 overflow-x-hidden">
      <Navbar onGetStarted={onGetStarted} />
      <Hero onGetStarted={onGetStarted} />
      <Stats />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing onGetStarted={onGetStarted} onGetStartedWithPlan={onGetStartedWithPlan} />
      <CTABanner onGetStarted={onGetStarted} />
      <Footer />
    </div>
  )
}
