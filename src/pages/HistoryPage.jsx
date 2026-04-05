import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { useEntries } from '../hooks/useEntries'

const HEAD_COLORS = [
  '#e5e7eb',
  '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444',
  '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#450a0a',
]
const ABDOMEN_COLORS = [
  '#e5e7eb',
  '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7',
  '#9333ea', '#7e22ce', '#6b21a8', '#581c87', '#3b0764',
]

function getColor(pain, colors) {
  if (pain === null || pain === undefined) return colors[0]
  return colors[Math.max(1, Math.min(10, pain))]
}

function getLastNDays(n) {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function getMonthsInRange(startMonthStr, endMonthStr) {
  const months = []
  const cur = new Date(startMonthStr + '-01')
  const end = new Date(endMonthStr + '-01')
  while (cur <= end) {
    months.push(cur.toISOString().slice(0, 7))
    cur.setMonth(cur.getMonth() + 1)
  }
  return months
}

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]
const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

// Kompaktansicht: letzte 30 Tage, 10 Spalten, füllt Kartenbreite
function CompactGrid({ dataByDate, colors, onDayPress }) {
  const days = getLastNDays(30)
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '5px', width: '100%' }}>
      {days.map(date => {
        const pain = dataByDate[date] ?? null
        const color = getColor(pain, colors)
        const isToday = date === today
        return (
          <button
            key={date}
            onClick={() => onDayPress(date)}
            style={{ backgroundColor: color, aspectRatio: '1', borderRadius: '6px' }}
            className={isToday ? 'ring-2 ring-offset-1 ring-gray-400' : ''}
          />
        )
      })}
    </div>
  )
}

// Erweiterte Ansicht: nach Monat gegliedert, 7-Spalten-Kalender mit Monats-/Jahresüberschriften
function ExpandedGrid({ dataByDate, colors, onDayPress, earliestDate }) {
  const today = new Date().toISOString().slice(0, 10)
  const startMonth = (earliestDate ?? today).slice(0, 7)
  const endMonth = today.slice(0, 7)
  const months = getMonthsInRange(startMonth, endMonth)

  return (
    <div className="w-full flex flex-col gap-5">
      {months.map((monthStr, mi) => {
        const [year, month] = monthStr.split('-').map(Number)
        const firstDay = new Date(year, month - 1, 1)
        const daysInMonth = new Date(year, month, 0).getDate()
        const startOffset = (firstDay.getDay() + 6) % 7 // 0=Mo

        const cells = [
          ...Array(startOffset).fill(null),
          ...Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1
            return `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          }),
        ]

        const prevMonth = mi > 0 ? months[mi - 1] : null
        const showYear = !prevMonth || prevMonth.slice(0, 4) !== String(year)

        return (
          <div key={monthStr}>
            {/* Überschriften */}
            <div className="mb-2">
              {showYear && (
                <p className="text-[11px] text-gray-400 font-medium mb-0.5">{year}</p>
              )}
              <p className="text-sm font-semibold text-gray-700">{MONTH_NAMES[month - 1]}</p>
            </div>

            {/* Wochentag-Labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
              {DAY_LABELS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: '#9ca3af' }}>{d}</div>
              ))}
            </div>

            {/* Tages-Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {cells.map((date, i) => {
                if (!date) return <div key={i} />
                const isFuture = date > today
                const pain = dataByDate[date] ?? null
                const color = isFuture ? 'transparent' : getColor(pain, colors)
                const isToday = date === today
                return (
                  <button
                    key={date}
                    onClick={() => !isFuture && onDayPress(date)}
                    disabled={isFuture}
                    style={{ backgroundColor: color, aspectRatio: '1', borderRadius: '6px' }}
                    className={isToday ? 'ring-2 ring-offset-1 ring-gray-400' : ''}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CategoryBlock({ label, dataByDate, colors, onDayPress, earliestDate }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="mx-4 mb-4 bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 pt-4 pb-3"
      >
        <h2 className="text-sm font-semibold text-gray-700">{label}</h2>
        <span className="text-xs text-gray-400">{expanded ? '▲' : '▼'}</span>
      </button>

      <div className="px-4 pb-4">
        {expanded ? (
          <ExpandedGrid
            dataByDate={dataByDate}
            colors={colors}
            onDayPress={onDayPress}
            earliestDate={earliestDate}
          />
        ) : (
          <CompactGrid
            dataByDate={dataByDate}
            colors={colors}
            onDayPress={onDayPress}
          />
        )}
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

  const allDates = entries.map(e => e.date).sort()
  const earliest = allDates[0] ?? null

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <div className="px-4 pt-12 pb-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Verlauf</p>
        <h1 className="text-lg font-semibold text-gray-800">Schmerzkalender</h1>
      </div>

      <CategoryBlock
        label="Kopfschmerzen"
        dataByDate={dataByCategory.head}
        colors={HEAD_COLORS}
        onDayPress={date => navigate(`/day/${date}`)}
        earliestDate={earliest}
      />

      <CategoryBlock
        label="Unterleibsschmerzen"
        dataByDate={dataByCategory.abdomen}
        colors={ABDOMEN_COLORS}
        onDayPress={date => navigate(`/day/${date}`)}
        earliestDate={earliest}
      />

      <NavBar />
    </div>
  )
}
