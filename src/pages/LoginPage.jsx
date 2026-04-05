import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError('E-Mail oder Passwort falsch.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-8 text-gray-800">Pain Tracker</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:border-indigo-500"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:border-indigo-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-500 text-white rounded-xl px-4 py-3 text-base font-medium disabled:opacity-50"
          >
            {loading ? 'Einloggen…' : 'Einloggen'}
          </button>
        </form>
      </div>
    </div>
  )
}
