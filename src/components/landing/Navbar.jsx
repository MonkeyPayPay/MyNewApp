import { useState, useEffect } from 'react'
import { Heart, Menu, X } from 'lucide-react'
import Button from '../ui/Button'
import IconBadge from '../ui/IconBadge'
import IconButton from '../ui/IconButton'

export default function Navbar({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ink-950/90 backdrop-blur-xl border-b border-white/5 py-3'
          : 'py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <IconBadge icon={Heart} tone="brand" size="sm" iconClassName="fill-white" />
          <span className="text-white font-bold text-lg tracking-tight">CareCircle</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Button onClick={onGetStarted} variant="ghost" size="sm">Sign In</Button>
          <Button onClick={onGetStarted} size="sm">Start Free</Button>
        </div>

        {/* Mobile Menu Button */}
        <IconButton onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden -mr-2.5" aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </IconButton>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-ink-950/95 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex flex-col gap-4 animate-fade-in">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Button onClick={onGetStarted} className="mt-2">Start Free</Button>
        </div>
      )}
    </nav>
  )
}
