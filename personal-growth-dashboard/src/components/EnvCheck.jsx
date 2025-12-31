import React from 'react';
import { getEnvStatus } from '../services/supabaseClient';

export default function EnvCheck({ children }) {
    const env = getEnvStatus();

    if (!env.isReady) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
                <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
                            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
                            Configuration Required
                        </h1>

                        <p className="text-slate-600 mb-8">
                            Supabase environment variables are missing. Please configure them in Cloudflare Pages.
                        </p>

                        <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-4">
                            <div className="font-mono text-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    {env.hasUrl ? (
                                        <span className="text-green-600">✓</span>
                                    ) : (
                                        <span className="text-red-600">✗</span>
                                    )}
                                    <span className="font-semibold">VITE_SUPABASE_URL</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {env.hasKey ? (
                                        <span className="text-green-600">✓</span>
                                    ) : (
                                        <span className="text-red-600">✗</span>
                                    )}
                                    <span className="font-semibold">VITE_SUPABASE_ANON_KEY</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-4">
                                <h3 className="font-bold text-sm text-slate-900 mb-2">Setup Steps:</h3>
                                <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                                    <li>Go to Cloudflare Pages Dashboard</li>
                                    <li>Select <strong>pricilia-growth</strong> project</li>
                                    <li>Navigate to <strong>Settings → Environment variables</strong></li>
                                    <li>Add variables for <strong>Production</strong> and <strong>Preview</strong></li>
                                    <li>Redeploy the site</li>
                                </ol>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-xs text-blue-800">
                                    <strong>Note:</strong> The <code className="bg-blue-100 px-1 rounded">VITE_</code> prefix is required for Vite to expose these variables to the browser.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
