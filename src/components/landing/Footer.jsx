import { Heart } from 'lucide-react'
import IconBadge from '../ui/IconBadge'

const links = {
  Product: ['Features', 'Pricing', 'Security', 'Mobile App', 'Changelog'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  Resources: ['Help Center', 'Caregiver Guide', 'Community', 'Webinars', 'API Docs'],
  Legal: [
    { label: 'Privacy Policy',   href: '/privacy' },
    { label: 'Terms of Service', href: '/terms'   },
    { label: 'Cookie Policy',    href: '#'         },
    { label: 'Security',         href: '#'         },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <IconBadge icon={Heart} tone="brand" size="sm" iconClassName="fill-white" />
              <span className="text-white font-bold text-lg">CareCircle</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-5">
              The family command center for elder care coordination.
            </p>
            {/* Not links — the app isn't published to either store yet.
                A tappable-looking button here would go nowhere. */}
            <div className="flex gap-3">
              {['🍎', '🤖'].map((icon, i) => (
                <div key={i} className="glass rounded-xl px-3 py-2 text-sm text-slate-500">
                  {icon} {i === 0 ? 'App Store' : 'Google Play'}
                  <span className="text-slate-600"> · Soon</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={typeof item === 'string' ? item : item.label}>
                    <a
                      href={typeof item === 'string' ? '#' : item.href}
                      className="text-slate-500 hover:text-white text-sm transition-colors"
                    >
                      {typeof item === 'string' ? item : item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} CareCircle, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            Made with{' '}
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />{' '}
            for caregiving families
          </div>
        </div>
      </div>
    </footer>
  )
}
