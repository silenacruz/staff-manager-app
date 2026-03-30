import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hyqtfpuaywuaqodpsloy.supabase.co'
const supabaseAnonKey = 'sb_publishable_67lk_-y68NzPXzFUusyNrA_G0EjeKDQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)