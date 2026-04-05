import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MultipleChoice from '../components/MultipleChoice'
import NavBar from '../components/NavBar'
import { useEntries } from '../hooks/useEntries'

const CATEGORIES = [
  { id: 'head', label: 'Kopf' },
  { id: 'abdomen', label: 'Unterbauch' },
]

const OPTIONS = {
  location: {
    head: [
      { value: 'A', label: 'Stirn' },
      { value: 'B', label: 'Hinterkopf' },
      { value: 'C', label: 'Schläfen' },
      { value: 'D', label: 'Ganzer Kopf' },
    ],
    abdomen: [
      { value: 'A', label: 'Einseitig' },
      { value: 'B', label: 'Beidseitig' },
    ],
  },
  character: {
    head: [
      { value: 'A', label: 'Dumpf / drückend' },
      { value: 'B', label: 'Pulsierend / stechend' },
    ],
    abdomen: [
      { value: 'A', label: 'Dumpf / drückend' },
      { value: 'B', label: 'Pulsierend / stechend' },
      { value: 'C', label: 'Krampfartig' },
    ],
  },
  symptoms: {
    head: [],    // noch zu definieren
    abdomen: [], // noch zu definieren
  },
}

const STEPS = ['Gesamtschmerz', 'Ort', 'Charakter', 'Begleitsymptome']

function emptyForm() {
  return { overall_pain: null, location: [], character: [], symptoms: [] }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function EODFormPage() {
  const [category, setCategory] = useState('head')
  const [step, setStep] = useState(0)
  const [forms, setForms] = useState({ head: emptyForm(), abdomen: emptyForm() })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { loadEntry, saveEntry } = useEntries()
  const navigate = useNavigate()
  const date = today()

  // Gespeicherte Daten laden wenn Kategorie wechselt
  useEffect(() => {
    loadEntry(date, category).then(entry => {
      if (!entry) return
      setForms(prev => ({
        ...prev,
        [category]: {
          overall_pain: entry.overall_pain ?? null,
          location: entry.location ?? [],
          character: entry.character ?? [],
          symptoms: entry.symptoms ?? [],
        },
      }))
    })
  }, [category])

  const form = forms[category]

  function setField(field, value) {
    setForms(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }))
  }

  function setCategory_(cat) {
    setCategory(cat)
    setStep(0)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await saveEntry(date, category, {
        overall_pain: form.overall_pain,
        location: form.location,
        character: form.character,
        symptoms: form.symptoms,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const isLastStep = step === STEPS.length - 1
  const canNext = step !== 0 || form.overall_pain !== null

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => navigate('/')} className="text-gray-400 text-xl leading-none">←</button>
        <h1 className="text-lg font-semibold text-gray-800">Abend-Eintrag</h1>
      </div>

      {/* Kategorie-Tabs */}
      <div className="flex mx-4 mb-6 bg-gray-200 rounded-xl p-1">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCategory_(c.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === c.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Schritt-Indikator */}
      <div className="flex gap-1.5 px-4 mb-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-indigo-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Schritt-Inhalt */}
      <div className="flex-1 px-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          Schritt {step + 1} von {STEPS.length}
        </p>
        <h2 className="text-base font-semibold text-gray-800 mb-4">{STEPS[step]}</h2>

        {/* Schritt 1 — Gesamtschmerz */}
        {step === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500 mb-2">
              Wie stark waren deine {category === 'head' ? 'Kopf' : 'Unterbauch'}schmerzen heute insgesamt?
            </p>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setField('overall_pain', i)}
                  className={`w-12 h-12 rounded-xl border text-sm font-semibold transition-colors ${
                    form.overall_pain === i
                      ? 'bg-indigo-500 border-indigo-500 text-white'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Schritt 2 — Ort */}
        {step === 1 && (
          <MultipleChoice
            options={OPTIONS.location[category]}
            selected={form.location}
            onChange={v => setField('location', v)}
            multi={category === 'head'}
          />
        )}

        {/* Schritt 3 — Charakter */}
        {step === 2 && (
          <MultipleChoice
            options={OPTIONS.character[category]}
            selected={form.character}
            onChange={v => setField('character', v)}
            multi
          />
        )}

        {/* Schritt 4 — Begleitsymptome */}
        {step === 3 && (
          OPTIONS.symptoms[category].length > 0 ? (
            <MultipleChoice
              options={OPTIONS.symptoms[category]}
              selected={form.symptoms}
              onChange={v => setField('symptoms', v)}
              multi
            />
          ) : (
            <p className="text-sm text-gray-400">
              Begleitsymptome werden noch definiert — dieser Schritt kann übersprungen werden.
            </p>
          )
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 px-4 pb-10 pt-6">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 font-medium"
          >
            Zurück
          </button>
        )}
        {!isLastStep ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext}
            className="flex-1 bg-indigo-500 text-white rounded-xl py-3 font-medium disabled:opacity-40"
          >
            Weiter
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving || form.overall_pain === null}
            className="flex-1 bg-indigo-500 text-white rounded-xl py-3 font-medium disabled:opacity-40"
          >
            {saving ? 'Speichern…' : saved ? 'Gespeichert ✓' : 'Speichern'}
          </button>
        )}
      </div>
      <NavBar />
    </div>
  )
}
