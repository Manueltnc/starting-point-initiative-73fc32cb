import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pyoyzyzhcwrqqyujjmze.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5b3l6eXpoY3dycXF5dWpqbXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODA5MTUsImV4cCI6MjA2NzY1NjkxNX0.CG1T1e4pUhipDyesjNiCD2YSDFXQi5dAhpKJZx6ytFk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
