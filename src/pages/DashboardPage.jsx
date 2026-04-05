import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEntries } from '../hooks/useEntries'
import PainCanvas from '../components/PainCanvas'
import NavBar from '../components/NavBar'
import { CATEGORY_COLORS } from '../lib/colors'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function isAfter18() {
  return new Date().getHours() >= 18
}

const CATEGORIES = [
  { id: 'head', label: 'Kopfschmerzen' },
  { id: 'abdomen', label: 'Unterleibsschmerzen' },
]

export default function DashboardPage() {
  const { date: dateParam } = useParams()
  const date = dateParam ?? todayStr()
  const isToday = date === todayStr()

  const { logout } = useAuth()
  const { loadEntry } = useEntries()
  const navigate = useNavigate()
  const [entries, setEntries] = useState({ head: null, abdomen: null })
  const [reminderDismissed, setReminderDismissed] = useState(false)

  useEffect(() => {
    Promise.all([
      loadEntry(date, 'head'),
      loadEntry(date, 'abdomen'),
    ]).then(([head, abdomen]) => {
      setEntries({ head, abdomen })
    })
  }, [date])

  const showReminder =
    isToday &&
    isAfter18() &&
    !reminderDismissed &&
    (!entries.head?.overall_pain || !entries.abdomen?.overall_pain)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          {!isToday && (
            <button onClick={() => navigate(-1)} className="text-gray-400 text-xl leading-none">←</button>
          )}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">{isToday ? 'Heute' : 'Tagesansicht'}</p>
            <h1 className="text-lg font-semibold text-gray-800">{formatDate(date)}</h1>
          </div>
        </div>
        {isToday && (
          <button onClick={logout} className="text-sm text-gray-400">Logout</button>
        )}
      </div>

      {/* In-App-Erinnerung */}
      {showReminder && (
        <div className="mx-4 mb-4 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-700">Abend-Eintrag fehlt</p>
            <p className="text-xs text-indigo-500 mt-0.5">Jetzt erfassen?</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/eod')}
              className="text-sm font-medium text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-lg"
            >
              Öffnen
            </button>
            <button
              onClick={() => setReminderDismissed(true)}
              className="text-gray-400 text-lg leading-none px-1"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Kategorie-Karten */}
      {CATEGORIES.map(({ id, label }) => {
        const entry = entries[id]
        const hasCurve = entry?.curve_data?.length > 0
        const hasEOD = entry?.overall_pain != null

        return (
          <div key={id} className="mx-4 mb-4 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">{label}</h2>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${hasCurve ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {hasCurve ? 'Kurve ✓' : 'Kurve –'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${hasEOD ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {hasEOD ? `EOD ${entry.overall_pain}/10` : 'EOD –'}
                </span>
              </div>
            </div>

            {hasCurve ? (
              <div className="px-3 pb-3">
                <PainCanvas initialData={entry.curve_data} readOnly color={CATEGORY_COLORS[id].primary} />
              </div>
            ) : (
              <div className="px-4 pb-3">
                <p className="text-xs text-gray-400">Noch keine Kurve für diesen Tag</p>
              </div>
            )}

            {/* Quick Actions — nur für heute */}
            {isToday && (
              <div className="flex border-t border-gray-100">
                <button
                  onClick={() => navigate('/tracking')}
                  className="flex-1 py-3 text-sm text-indigo-500 font-medium border-r border-gray-100"
                >
                  {hasCurve ? 'Kurve bearbeiten' : 'Kurve zeichnen'}
                </button>
                <button
                  onClick={() => navigate('/eod')}
                  className="flex-1 py-3 text-sm text-indigo-500 font-medium"
                >
                  {hasEOD ? 'EOD bearbeiten' : 'Abend-Eintrag'}
                </button>
              </div>
            )}
          </div>
        )
      })}
      <NavBar />
    </div>
  )
}
