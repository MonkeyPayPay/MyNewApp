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
  return (
    <div className="min-h-screen bg-[#050510]">
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
