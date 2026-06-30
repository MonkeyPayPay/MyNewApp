const stats = [
  { value: '53M', label: 'Unpaid caregivers in the US', detail: 'and growing every day' },
  { value: '5+ hrs', label: 'Lost to coordination weekly', detail: 'per caregiver family' },
  { value: '$7,200', label: 'Annual out-of-pocket costs', detail: 'tracked and reimbursed' },
  { value: '94%', label: 'Report reduced family conflict', detail: 'after using CareCircle' },
]

export default function Stats() {
  return (
    <section className="py-16 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.value} className="text-center">
              <div className="text-4xl lg:text-5xl font-black text-gradient mb-2">{stat.value}</div>
              <div className="text-white font-semibold text-sm mb-1">{stat.label}</div>
              <div className="text-slate-500 text-xs">{stat.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
