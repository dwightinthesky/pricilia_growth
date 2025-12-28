import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext({
    currentUser: null,
    loading: true,
    login: () => { },
    logout: () => { }
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check active session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setCurrentUser(session?.user || null);
            setLoading(false);
        };

        checkSession();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setCurrentUser(session?.user || null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) console.error("Login error:", error.message);
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error("Logout error:", error.message);
    };

    const value = {
        currentUser,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
