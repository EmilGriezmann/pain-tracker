import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { path: '/', label: 'Verlauf', icon: '⊞' },
  { path: '/today', label: 'Heute', icon: '⌂' },
  { path: '/eod', label: 'Abend', icon: '✓' },
]

export default function NavBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function isActive(path) {
    if (path === '/') return pathname === '/'
    if (path === '/today') return pathname === '/today' || pathname.startsWith('/day/')
    return pathname === path
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex pb-safe">
      {TABS.map(({ path, label, icon }) => (
        <button
          key={path}
          onClick={() => navigate(path)}
          className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors ${
            isActive(path) ? 'text-indigo-500' : 'text-gray-400'
          }`}
        >
          <span className="text-lg leading-none">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  )
}
