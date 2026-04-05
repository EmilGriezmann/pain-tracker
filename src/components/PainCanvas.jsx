import { useRef, useEffect, useCallback } from 'react'

const PAD = { top: 20, right: 12, bottom: 36, left: 36 }
const HOURS = 24      // 24 diskrete Spalten (Stunde 0–23)
const MAX_Y = 10
const MIN_Y = 0
const DPR = window.devicePixelRatio || 1

// Erzeugt ein leeres 24-Stunden-Array: [null, null, ..., null]
function emptyHours() {
  return Array(HOURS).fill(null)
}

// initialData (Array von {time, intensity}) → 24-Slot-Array
function dataToSlots(data) {
  const slots = emptyHours()
  data.forEach(({ time, intensity }) => {
    const hour = Math.round(time)
    if (hour >= 0 && hour < HOURS) slots[hour] = intensity
  })
  return slots
}

// 24-Slot-Array → Array von {time, intensity} (nur gesetzte Werte)
function slotsToData(slots) {
  return slots
    .map((intensity, hour) => intensity !== null ? { time: hour, intensity } : null)
    .filter(Boolean)
}

function drawGrid(ctx, drawW, drawH) {
  ctx.save()
  ctx.translate(PAD.left * DPR, PAD.top * DPR)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, drawW, drawH)

  const colW = drawW / HOURS

  // Horizontale Linien (Y = 0–10)
  ctx.font = `${10 * DPR}px -apple-system, system-ui, sans-serif`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'

  for (let i = MIN_Y; i <= MAX_Y; i++) {
    const y = (1 - i / MAX_Y) * drawH
    ctx.strokeStyle = i === 0 ? '#d1d5db' : '#f0f0f0'
    ctx.lineWidth = DPR
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(drawW, y)
    ctx.stroke()
    ctx.fillStyle = '#9ca3af'
    ctx.fillText(String(i), -6 * DPR, y)
  }

  // Vertikale Linien (jede Stunde)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  for (let h = 0; h <= HOURS; h++) {
    const x = h * colW
    ctx.strokeStyle = h % 6 === 0 ? '#d1d5db' : '#f3f4f6'
    ctx.lineWidth = DPR
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, drawH)
    ctx.stroke()
    if (h % 6 === 0) {
      ctx.fillStyle = '#9ca3af'
      ctx.fillText(`${String(h).padStart(2, '0')}:00`, x, drawH + 8 * DPR)
    }
  }

  // Rahmen
  ctx.strokeStyle = '#d1d5db'
  ctx.lineWidth = DPR
  ctx.strokeRect(0, 0, drawW, drawH)

  ctx.restore()
}

function drawCurve(ctx, slots, drawW, drawH) {
  ctx.save()
  ctx.translate(PAD.left * DPR, PAD.top * DPR)

  const colW = drawW / HOURS

  // Verbindungslinie über gesetzte Punkte
  ctx.strokeStyle = '#6366f1'
  ctx.lineWidth = 2.5 * DPR
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  let started = false
  ctx.beginPath()
  slots.forEach((intensity, hour) => {
    if (intensity === null) return
    const x = (hour + 0.5) * colW // Mitte der Spalte
    const y = (1 - intensity / MAX_Y) * drawH
    if (!started) {
      ctx.moveTo(x, y)
      started = true
    } else {
      ctx.lineTo(x, y)
    }
  })
  if (started) ctx.stroke()

  // Punkte an gesetzten Stunden
  ctx.fillStyle = '#6366f1'
  slots.forEach((intensity, hour) => {
    if (intensity === null) return
    const x = (hour + 0.5) * colW
    const y = (1 - intensity / MAX_Y) * drawH
    ctx.beginPath()
    ctx.arc(x, y, 3 * DPR, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.restore()
}

export default function PainCanvas({ initialData = [], onChange, readOnly = false }) {
  const canvasRef = useRef(null)
  const slotsRef = useRef(emptyHours())
  const drawing = useRef(false)

  function getDrawSize() {
    const canvas = canvasRef.current
    if (!canvas) return { drawW: 0, drawH: 0 }
    return {
      drawW: canvas.width - (PAD.left + PAD.right) * DPR,
      drawH: canvas.height - (PAD.top + PAD.bottom) * DPR,
    }
  }

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { drawW, drawH } = getDrawSize()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGrid(ctx, drawW, drawH)
    drawCurve(ctx, slotsRef.current, drawW, drawH)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth * DPR
    canvas.height = canvas.offsetHeight * DPR
    slotsRef.current = dataToSlots(initialData)
    redraw()
  }, [initialData, redraw])

  function getHourAndIntensity(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const { drawW, drawH } = getDrawSize()
    const relX = (e.clientX - rect.left - PAD.left) * DPR
    const relY = (e.clientY - rect.top - PAD.top) * DPR
    const hour = Math.floor((relX / drawW) * HOURS)
    const rawIntensity = (1 - relY / drawH) * MAX_Y
    const intensity = Math.round(Math.max(MIN_Y, Math.min(MAX_Y, rawIntensity)))
    return { hour: Math.max(0, Math.min(HOURS - 1, hour)), intensity }
  }

  function onPointerDown(e) {
    if (readOnly) return
    e.preventDefault()
    canvasRef.current.setPointerCapture(e.pointerId)
    drawing.current = true
    const { hour, intensity } = getHourAndIntensity(e)
    slotsRef.current[hour] = intensity
    redraw()
  }

  function onPointerMove(e) {
    if (!drawing.current || readOnly) return
    e.preventDefault()
    const { hour, intensity } = getHourAndIntensity(e)
    slotsRef.current[hour] = intensity
    redraw()
  }

  function onPointerUp() {
    if (!drawing.current || readOnly) return
    drawing.current = false
    onChange?.(slotsToData(slotsRef.current))
  }

  function clear() {
    slotsRef.current = emptyHours()
    onChange?.([])
    redraw()
  }

  const hasData = slotsRef.current.some(v => v !== null)

  return (
    <div className="flex flex-col gap-2">
      <canvas
        ref={canvasRef}
        className="w-full touch-none"
        style={{ aspectRatio: '3 / 4' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
      {!readOnly && hasData && (
        <button onClick={clear} className="self-end text-sm text-gray-400 underline">
          Neu zeichnen
        </button>
      )}
    </div>
  )
}
