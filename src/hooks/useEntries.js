import { supabase } from '../lib/supabase'

export function useEntries() {
  async function loadEntry(date, category) {
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('date', date)
      .eq('category', category)
      .maybeSingle()
    if (error) throw error
    return data
  }

  async function saveEntry(date, category, fields) {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('daily_entries')
      .upsert(
        { user_id: user.id, date, category, ...fields, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,date,category' }
      )
    if (error) throw error
  }

  async function loadEntriesInRange(category, days) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = cutoff.toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('daily_entries')
      .select('date, location, character, symptoms')
      .eq('category', category)
      .gte('date', cutoffStr)
      .order('date', { ascending: false })
    if (error) throw error
    return data ?? []
  }

  async function loadAllEntries() {
    const { data, error } = await supabase
      .from('daily_entries')
      .select('date, category, overall_pain')
      .order('date', { ascending: true })
    if (error) throw error
    return data ?? []
  }

  return { loadEntry, saveEntry, loadAllEntries, loadEntriesInRange }
}
