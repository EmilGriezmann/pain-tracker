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

  return { loadEntry, saveEntry }
}
