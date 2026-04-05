import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PainCanvas from '../components/PainCanvas'
import NavBar from '../components/NavBar'
import { useEntries } from '../hooks/useEntries'

const CATEGORIES = [
  { id: 'head', label: 'Kopf' },
  { id: 'abdomen', label: 'Unterbauch' },
]

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function TrackingPage() {
  const [category, setCategory] = useState('head')
  const [curveData, setCurveData] = useState([])
  const [savedData, setSavedData] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { loadEntry, saveEntry } = useEntries()
  const navigate = useNavigate()
  const date = today()

  // Beim Wechsel der Kategorie: gespeicherte Kurve laden
  useEffect(() => {
    if (savedData[category] !== undefined) {
      setCurveData(savedData[category])
      return
    }
    loadEntry(date, category).then(entry => {
      const data = entry?.curve_data ?? []
      setSavedData(prev => ({ ...prev, [category]: data }))
      setCurveData(data)
    })
  }, [category])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await saveEntry(date, category, { curve_data: curveData })
      setSavedData(prev => ({ ...prev, [category]: curveData }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => navigate('/')} className="text-gray-400 text-xl leading-none">←</button>
        <h1 className="text-lg font-semibold text-gray-800">Tagesverlauf</h1>
      </div>

      {/* Kategorie-Tabs */}
      <div className="flex mx-4 mb-4 bg-gray-200 rounded-xl p-1">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === c.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Hinweis */}
      <p className="text-xs text-gray-400 px-4 mb-3">
        Zeichne mit dem Finger deinen Schmerzverlauf von heute (0 = kein Schmerz, 10 = maximaler Schmerz).
      </p>

      {/* Canvas */}
      <div>
        <PainCanvas
          key={category}
          initialData={savedData[category] ?? []}
          onChange={setCurveData}
        />
      </div>

      {/* Speichern */}
      <div className="px-4 mt-4">
        <button
          onClick={handleSave}
          disabled={saving || curveData.length === 0}
          className="w-full bg-indigo-500 text-white rounded-xl py-3 font-medium disabled:opacity-40"
        >
          {saving ? 'Speichern…' : saved ? 'Gespeichert ✓' : 'Speichern'}
        </button>
      </div>
      <NavBar />
    </div>
  )
}
