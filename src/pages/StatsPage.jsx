import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { useEntries } from '../hooks/useEntries'
import { CATEGORY_COLORS } from '../lib/colors'

const LABELS = {
  location: {
    head:    { A: 'Stirn', B: 'Hinterkopf', C: 'Schläfen', D: 'Ganzer Kopf' },
    abdomen: { A: 'Einseitig', B: 'Beidseitig' },
  },
  character: {
    head:    { A: 'Dumpf / drückend', B: 'Pulsierend / stechend' },
    abdomen: { A: 'Dumpf / drückend', B: 'Pulsierend / stechend', C: 'Krampfartig' },
  },
  symptoms: {
    head:    {},
    abdomen: {},
  },
}

const PERIODS = [
  { label: '7 Tage', days: 7 },
  { label: '30 Tage', days: 30 },
  { label: '90 Tage', days: 90 },
]

function countValues(entries, field, labelMap) {
  const counts = {}
  entries.forEach(entry => {
    const values = entry[field] ?? []
    values.forEach(v => {
      const label = labelMap[v]
      if (label) counts[label] = (counts[label] ?? 0) + 1
    })
  })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
}

function FrequencySection({ title, counts, period, color }) {

  if (counts.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
        <p className="text-sm text-gray-400">Noch keine Daten für diesen Zeitraum.</p>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="flex flex-col gap-2">
        {counts.map(([label, count]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-36 flex-shrink-0">{label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full"
                style={{ width: `${(count / period) * 100}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-sm text-gray-500 w-6 text-right flex-shrink-0">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StatsPage() {
  const { category } = useParams()
  const navigate = useNavigate()
  const { loadEntriesInRange } = useEntries()
  const [period, setPeriod] = useState(30)
  const [entries, setEntries] = useState([])

  const categoryLabel = category === 'head' ? 'Kopfschmerzen' : 'Unterleibsschmerzen'
  const color = CATEGORY_COLORS[category].primary
  const labelMap = LABELS

  useEffect(() => {
    loadEntriesInRange(category, period).then(setEntries)
  }, [category, period])

  const locationCounts  = countValues(entries, 'location',  labelMap.location[category])
  const characterCounts = countValues(entries, 'character', labelMap.character[category])
  const symptomCounts   = countValues(entries, 'symptoms',  labelMap.symptoms[category])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-xl leading-none">←</button>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Statistik</p>
          <h1 className="text-lg font-semibold text-gray-800">{categoryLabel}</h1>
        </div>
      </div>

      {/* Zeitraum-Selector */}
      <div className="flex mx-4 mb-6 bg-gray-200 rounded-xl p-1">
        {PERIODS.map(({ label, days }) => (
          <button
            key={days}
            onClick={() => setPeriod(days)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === days ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Häufigkeitslisten */}
      <div className="mx-4 bg-white rounded-2xl border border-gray-200 px-4 py-4">
        <p className="text-xs text-gray-400 mb-4">
          {entries.length} Einträge in den letzten {period} Tagen
        </p>
        <FrequencySection title="Ort" counts={locationCounts} period={period} color={color} />
        <FrequencySection title="Charakter" counts={characterCounts} period={period} color={color} />
        <FrequencySection title="Begleitsymptome" counts={symptomCounts} period={period} color={color} />
      </div>

      <NavBar />
    </div>
  )
}
