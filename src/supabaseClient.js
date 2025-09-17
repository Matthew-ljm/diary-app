import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vnfxyospxnevclsctzpg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZnh5b3NweG5ldmNsc2N0enBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDc2NzEsImV4cCI6MjA3MzY4MzY3MX0.KlTgRsJrv4Slby4WEw3MszIuI1qrtXWb1zyjyWNJ-WA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
