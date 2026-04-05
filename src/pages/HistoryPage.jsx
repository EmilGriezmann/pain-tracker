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
    <div className="flex gap-1">
      {/* Wochentag-Labels */}
      <div className="flex flex-col gap-1 pt-0.5">
        {DAY_LABELS.map(d => (
          <div key={d} className="h-7 flex items-center text-[10px] text-gray-400 w-5">{d}</div>
        ))}
      </div>

      {/* Spalten = Wochen */}
      <div className="flex gap-1 overflow-x-auto flex-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(date => {
              const pain = dataByDate[date] ?? null
              const color = getColor(pain, colors)
              const isToday = date === today
              return (
                <button
                  key={date}
                  onClick={() => onDayPress(date)}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-md flex-shrink-0 ${isToday ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                  title={date}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// Legende
function Legend({ colors, label }) {
  return (
    <div className="flex items-center gap-1 mt-2">
      <span className="text-[10px] text-gray-400 mr-1">weniger</span>
      {[0, 2, 4, 6, 8, 10].map(i => (
        <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: colors[i] }} />
      ))}
      <span className="text-[10px] text-gray-400 ml-1">mehr</span>
    </div>
  )
}

const PREVIEW_WEEKS = 4

export default function HistoryPage() {
  const [entries, setEntries] = useState([])
  const [expanded, setExpanded] = useState(false)
  const { loadAllEntries } = useEntries()
  const navigate = useNavigate()

  useEffect(() => {
    loadAllEntries().then(setEntries)
  }, [])

  // Aufbau: { head: { '2026-04-01': 5, ... }, abdomen: { ... } }
  const dataByCategory = { head: {}, abdomen: {} }
  entries.forEach(({ date, category, overall_pain }) => {
    if (overall_pain !== null && overall_pain !== undefined) {
      dataByCategory[category][date] = overall_pain
    }
  })

  // Zeitraum
  const allDays = getWeekGrid(expanded ? 52 : PREVIEW_WEEKS)

  // Frühestes Datum mit Eintrag ermitteln (für Info-Text)
  const allDates = entries.map(e => e.date).sort()
  const earliest = allDates[0]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Verlauf</p>
        <h1 className="text-lg font-semibold text-gray-800">Schmerzkalender</h1>
      </div>

      {/* Kopfschmerzen */}
      <div className="mx-4 mb-4 bg-white rounded-2xl border border-gray-200 px-4 pt-4 pb-3 overflow-hidden">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Kopfschmerzen</h2>
        <HeatmapGrid
          days={allDays}
          dataByDate={dataByCategory.head}
          colors={HEAD_COLORS}
          onDayPress={date => navigate(`/day/${date}`)}
        />
        <Legend colors={HEAD_COLORS} />
      </div>

      {/* Unterleibsschmerzen */}
      <div className="mx-4 mb-4 bg-white rounded-2xl border border-gray-200 px-4 pt-4 pb-3 overflow-hidden">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Unterleibsschmerzen</h2>
        <HeatmapGrid
          days={allDays}
          dataByDate={dataByCategory.abdomen}
          colors={ABDOMEN_COLORS}
          onDayPress={date => navigate(`/day/${date}`)}
        />
        <Legend colors={ABDOMEN_COLORS} />
      </div>

      {/* Ausklappen / Einklappen */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="mx-4 py-3 text-sm text-indigo-500 font-medium text-center"
      >
        {expanded
          ? 'Weniger anzeigen'
          : `Gesamten Zeitraum anzeigen${earliest ? ` (ab ${earliest})` : ''}`}
      </button>

      <NavBar />
    </div>
  )
}
