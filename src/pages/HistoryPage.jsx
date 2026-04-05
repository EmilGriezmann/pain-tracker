import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { useEntries } from '../hooks/useEntries'

// Farb-Skalen: 0 = kein Eintrag (grau), 1–10 = Intensität
const HEAD_COLORS = [
  '#e5e7eb', // kein Eintrag
  '#fee2e2', // 1
  '#fecaca', // 2
  '#fca5a5', // 3
  '#f87171', // 4
  '#ef4444', // 5
  '#dc2626', // 6
  '#b91c1c', // 7
  '#991b1b', // 8
  '#7f1d1d', // 9
  '#450a0a', // 10
]

const ABDOMEN_COLORS = [
  '#e5e7eb', // kein Eintrag
  '#f3e8ff', // 1
  '#e9d5ff', // 2
  '#d8b4fe', // 3
  '#c084fc', // 4
  '#a855f7', // 5
  '#9333ea', // 6
  '#7e22ce', // 7
  '#6b21a8', // 8
  '#581c87', // 9
  '#3b0764', // 10
]

function getColor(pain, colors) {
  if (pain === null || pain === undefined) return colors[0]
  return colors[Math.max(1, Math.min(10, pain))]
}

// Gibt alle Tage der letzten N Wochen zurück (Montag-Start)
function getWeekGrid(weeks) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Gehe zurück zum letzten Montag
  const dayOfWeek = (today.getDay() + 6) % 7 // 0=Mo, 6=So
  const start = new Date(today)
  start.setDate(today.getDate() - dayOfWeek - (weeks - 1) * 7)

  const days = []
  const cur = new Date(start)
  while (cur <= today) {
    days.push(cur.toISOString().slice(0, 10))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

// Gruppiert Tage in Wochen (Arrays von je 7)
function toWeeks(days) {
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function HeatmapGrid({ days, dataByDate, colors, onDayPress }) {
  const weeks = toWeeks(days)
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="flex flex-col gap-1">
      {/* Wochentag-Labels oben */}
      <div className="flex gap-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="w-8 text-center text-[10px] text-gray-400">{d}</div>
        ))}
      </div>

      {/* Zeilen = Wochen */}
      {weeks.map((week, wi) => (
        <div key={wi} className="flex gap-1">
          {week.map(date => {
            const pain = dataByDate[date] ?? null
            const color = getColor(pain, colors)
            const isToday = date === today
            return (
              <button
                key={date}
                onClick={() => onDayPress(date)}
                style={{ backgroundColor: color }}
                className={`w-8 h-8 rounded-md flex-shrink-0 ${isToday ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                title={date}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

const PREVIEW_WEEKS = 4

function CategoryBlock({ label, days, dataByDate, colors, onDayPress }) {
  const [expanded, setExpanded] = useState(false)
  const visibleDays = getWeekGrid(expanded ? 52 : PREVIEW_WEEKS)

  return (
    <div className="mx-4 mb-4 bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Titelzeile — anklickbar zum Ausklappen */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 pt-4 pb-3"
      >
        <h2 className="text-sm font-semibold text-gray-700">{label}</h2>
        <span className="text-xs text-gray-400">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Grid — zentriert, Rahmen passt zum Inhalt */}
      <div className="flex justify-center px-3 pb-4">
        <HeatmapGrid
          days={visibleDays}
          dataByDate={dataByDate}
          colors={colors}
          onDayPress={onDayPress}
        />
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const [entries, setEntries] = useState([])
  const { loadAllEntries } = useEntries()
  const navigate = useNavigate()

  useEffect(() => {
    loadAllEntries().then(setEntries)
  }, [])

  const dataByCategory = { head: {}, abdomen: {} }
  entries.forEach(({ date, category, overall_pain }) => {
    if (overall_pain !== null && overall_pain !== undefined) {
      dataByCategory[category][date] = overall_pain
    }
  })

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Verlauf</p>
        <h1 className="text-lg font-semibold text-gray-800">Schmerzkalender</h1>
      </div>

      <CategoryBlock
        label="Kopfschmerzen"
        dataByDate={dataByCategory.head}
        colors={HEAD_COLORS}
        onDayPress={date => navigate(`/day/${date}`)}
      />

      <CategoryBlock
        label="Unterleibsschmerzen"
        dataByDate={dataByCategory.abdomen}
        colors={ABDOMEN_COLORS}
        onDayPress={date => navigate(`/day/${date}`)}
      />

      <NavBar />
    </div>
  )
}
