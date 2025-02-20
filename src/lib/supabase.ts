
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kqroqxlvcgnjanuuagkp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtxcm9xeGx2Y2duamFudXVhZ2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5OTQxNjEsImV4cCI6MjA1NTU3MDE2MX0.nPkoTaExdVL3xVdFfFs4GfS21ASlD6GV_eUgR580Qvw';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
