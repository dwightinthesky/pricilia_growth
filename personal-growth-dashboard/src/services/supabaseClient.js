import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase Environment Variables Missing!');
    console.error('Expected in Cloudflare Pages Settings:');
    console.error('  - VITE_SUPABASE_URL (note the VITE_ prefix!)');
    console.error('  - VITE_SUPABASE_ANON_KEY');
    console.error('Current values:', {
        VITE_SUPABASE_URL: supabaseUrl || 'undefined',
        VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? '[present]' : 'undefined'
    });
}

// Create client with fallback to prevent total crash
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    })
    : null;

// Export a helper to check if client is ready
export const isSupabaseReady = () => !!supabase;

// Export env check for debugging
export const getEnvStatus = () => ({
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl || null,
    isReady: isSupabaseReady()
});
