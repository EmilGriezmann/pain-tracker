import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEntries } from '../hooks/useEntries'
import PainCanvas from '../components/PainCanvas'
import MultipleChoice from '../components/MultipleChoice'
import NavBar from '../components/NavBar'
import { CATEGORY_COLORS } from '../lib/colors'

const EOD_OPTIONS = {
  location: {
    head:    [{ value: 'A', label: 'Stirn' }, { value: 'B', label: 'Hinterkopf' }, { value: 'C', label: 'Schläfen' }, { value: 'D', label: 'Ganzer Kopf' }],
    abdomen: [{ value: 'A', label: 'Einseitig' }, { value: 'B', label: 'Beidseitig' }],
  },
  character: {
    head:    [{ value: 'A', label: 'Dumpf / drückend' }, { value: 'B', label: 'Pulsierend / stechend' }],
    abdomen: [{ value: 'A', label: 'Dumpf / drückend' }, { value: 'B', label: 'Pulsierend / stechend' }, { value: 'C', label: 'Krampfartig' }],
  },
  symptoms: {
    head:    [],
    abdomen: [],
  },
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function offsetDate(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

function isAfter18() {
  return new Date().getHours() >= 18
}

const ALL_CATEGORIES = [
  { id: 'head', label: 'Kopfschmerzen' },
  { id: 'abdomen', label: 'Unterleibsschmerzen' },
]

function CategoryCard({ id, label, entry, date, onSaved }) {
  const { saveEntry } = useEntries()
  const color = CATEGORY_COLORS[id].primary

  // Kurven-State
  const [curveData, setCurveData] = useState(entry?.curve_data ?? [])
  const [curveDirty, setCurveDirty] = useState(false)
  const [savingCurve, setSavingCurve] = useState(false)

  // EOD-State
  const [overall_pain, setOverallPain] = useState(entry?.overall_pain ?? null)
  const [location, setLocation] = useState(entry?.location ?? [])
  const [character, setCharacter] = useState(entry?.character ?? [])
  const [symptoms, setSymptoms] = useState(entry?.symptoms ?? [])
  const [savingEod, setSavingEod] = useState(false)
  const [savedEod, setSavedEod] = useState(false)

  // Entry neu laden wenn sich entry von außen ändert
  useEffect(() => {
    setCurveData(entry?.curve_data ?? [])
    setCurveDirty(false)
    setOverallPain(entry?.overall_pain ?? null)
    setLocation(entry?.location ?? [])
    setCharacter(entry?.character ?? [])
    setSymptoms(entry?.symptoms ?? [])
  }, [entry])

  async function saveCurve() {
    setSavingCurve(true)
    try {
      await saveEntry(date, id, { curve_data: curveData })
      setCurveDirty(false)
      onSaved?.()
    } finally {
      setSavingCurve(false)
    }
  }

  async function saveEod() {
    setSavingEod(true)
    try {
      await saveEntry(date, id, { overall_pain, location, character, symptoms })
      setSavedEod(true)
      setTimeout(() => setSavedEod(false), 2000)
      onSaved?.()
    } finally {
      setSavingEod(false)
    }
  }

  const hasCurve = curveData.length > 0

  return (
    <div className="mx-4 mb-4 bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">{label}</h2>
        <div className="flex gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${hasCurve ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            {hasCurve ? 'Kurve ✓' : 'Kurve –'}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${overall_pain != null ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            {overall_pain != null ? `EOD ${overall_pain}/10` : 'EOD –'}
          </span>
        </div>
      </div>

      {/* Canvas — immer editierbar */}
      <div className="pb-2">
        <PainCanvas
          key={`${id}-${date}`}
          initialData={curveData}
          color={color}
          onChange={data => { setCurveData(data); setCurveDirty(true) }}
        />
      </div>

      {/* Kurve speichern */}
      {curveDirty && (
        <div className="px-4 pb-3">
          <button
            onClick={saveCurve}
            disabled={savingCurve}
            style={{ backgroundColor: color }}
            className="w-full text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {savingCurve ? 'Speichern…' : 'Kurve speichern'}
          </button>
        </div>
      )}

      {/* EOD — inline */}
      <div className="px-4 pt-2 pb-4 border-t border-gray-100 flex flex-col gap-4">

        {/* Gesamtschmerz */}
        <div>
          <p className="text-xs text-gray-400 mb-2">Gesamtschmerz</p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                onClick={() => setOverallPain(overall_pain === i ? null : i)}
                style={overall_pain === i ? { backgroundColor: color, borderColor: color } : {}}
                className={`w-9 h-9 rounded-lg border text-sm font-semibold transition-colors ${
                  overall_pain === i ? 'text-white' : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Ort */}
        <div>
          <p className="text-xs text-gray-400 mb-2">Ort</p>
          <MultipleChoice
            options={EOD_OPTIONS.location[id]}
            selected={location}
            onChange={setLocation}
            multi={id === 'head'}
            color={color}
          />
        </div>

        {/* Charakter */}
        <div>
          <p className="text-xs text-gray-400 mb-2">Charakter</p>
          <MultipleChoice
            options={EOD_OPTIONS.character[id]}
            selected={character}
            onChange={setCharacter}
            multi
            color={color}
          />
        </div>

        {/* Begleitsymptome */}
        {EOD_OPTIONS.symptoms[id].length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2">Begleitsymptome</p>
            <MultipleChoice
              options={EOD_OPTIONS.symptoms[id]}
              selected={symptoms}
              onChange={setSymptoms}
              multi
              color={color}
            />
          </div>
        )}

        {/* EOD Speichern */}
        <button
          onClick={saveEod}
          disabled={savingEod || overall_pain === null}
          style={{ backgroundColor: color }}
          className="w-full text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-40"
        >
          {savingEod ? 'Speichern…' : savedEod ? 'Gespeichert ✓' : 'Abend-Eintrag speichern'}
        </button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { date: dateParam, category: categoryParam } = useParams()
  const today = todayStr()
  const date = dateParam ?? today
  const isToday = date === today

  const { logout } = useAuth()
  const { loadEntry } = useEntries()
  const navigate = useNavigate()
  const [entries, setEntries] = useState({ head: null, abdomen: null })
  const [reminderDismissed, setReminderDismissed] = useState(false)

  const categoriesToShow = categoryParam
    ? ALL_CATEGORIES.filter(c => c.id === categoryParam)
    : ALL_CATEGORIES

  function loadEntries() {
    Promise.all(
      categoriesToShow.map(({ id }) => loadEntry(date, id))
    ).then(results => {
      const next = {}
      categoriesToShow.forEach(({ id }, i) => { next[id] = results[i] })
      setEntries(prev => ({ ...prev, ...next }))
    })
  }

  useEffect(() => { loadEntries() }, [date, categoryParam])

  const showReminder =
    isToday && !categoryParam &&
    isAfter18() &&
    !reminderDismissed &&
    (!entries.head?.overall_pain || !entries.abdomen?.overall_pain)

  function dayUrl(targetDate) {
    return categoryParam ? `/day/${targetDate}/${categoryParam}` : `/day/${targetDate}`
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(dayUrl(offsetDate(date, -1)))} className="text-gray-400 text-xl leading-none w-8">←</button>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">{isToday ? 'Heute' : 'Tagesansicht'}</p>
            <h1 className="text-lg font-semibold text-gray-800">{formatDate(date)}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isToday && (
            <button onClick={() => navigate(dayUrl(offsetDate(date, +1)))} className="text-gray-400 text-xl leading-none w-8 text-right">→</button>
          )}
          {isToday && !categoryParam && (
            <button onClick={logout} className="text-sm text-gray-400">Logout</button>
          )}
        </div>
      </div>

      {/* Erinnerung */}
      {showReminder && (
        <div className="mx-4 mb-4 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-700">Abend-Eintrag fehlt</p>
            <p className="text-xs text-indigo-500 mt-0.5">Direkt hier eintragen ↓</p>
          </div>
          <button onClick={() => setReminderDismissed(true)} className="text-gray-400 text-lg leading-none px-1">×</button>
        </div>
      )}

      {categoriesToShow.map(({ id, label }) => (
        <CategoryCard
          key={`${id}-${date}`}
          id={id}
          label={label}
          entry={entries[id]}
          date={date}
          onSaved={loadEntries}
        />
      ))}

      <NavBar />
    </div>
  )
}
