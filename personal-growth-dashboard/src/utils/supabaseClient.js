
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkiwdyhcgxqdkrrwyk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhscmtpd2R5aGNneHFka3Jyd3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NDAzMDMsImV4cCI6MjA4MjUxNjMwM30.ZFn8tzsIe9PT_0cs3g3wy61GJMrU9R9osukkjzWEYCU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
