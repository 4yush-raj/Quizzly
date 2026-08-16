import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tukoqwmszsxmebyrwqbq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_gFwmUCqnlR1TkzfnVPKuBA_Y4SHioUD';

export const supabase = createClient(supabaseUrl, supabaseKey);
