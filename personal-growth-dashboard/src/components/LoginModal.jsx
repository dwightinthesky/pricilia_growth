import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { login } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    // Mock Google Login Svg
    const GoogleIcon = () => (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
        </svg>
    );

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSignUp) {
            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }
            // Mock signup - just log them in
            login({ email, displayName: email.split('@')[0] });
            onClose();
            navigate('/dashboard');
        } else {
            // Mock Login
            login({ email, displayName: email.split('@')[0] });
            onClose();
            navigate('/dashboard');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            // Mock Google Login
            login({
                email: 'google-user@example.com',
                displayName: 'Google User',
                photoURL: 'https://ui-avatars.com/api/?name=Google+User'
            });
            console.log("Logged in with Google (Mock)");
            onClose();
            navigate('/dashboard');
        } catch (error) {
            console.error("Google Login Error:", error);
            alert(`Login failed: ${error.message}`);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-pricilia-dark">
                        {isSignUp ? t('auth.signup_title') : t('auth.welcome')}
                    </h2>
                    <p className="text-slate-500 mt-2 cursor-pointer hover:text-pricilia-blue transition-colors" onClick={() => setIsSignUp(!isSignUp)}>
                        {isSignUp ? t('auth.have_account') : t('auth.no_account')}
                    </p>
                </div>

                {/* Google Login */}
                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center bg-white border border-slate-200 text-slate-700 font-medium py-2.5 rounded-lg hover:bg-slate-50 transition-colors mb-6 shadow-sm"
                >
                    <GoogleIcon />
                    {t('auth.google_login')}
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-slate-400 uppercase">{t('auth.or_divider')}</span>
                    </div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {isSignUp && (
                        <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in duration-200">
                            <label className="text-sm font-medium text-slate-700">{t('auth.name')}</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pricilia-blue/20 focus:border-pricilia-blue transition-all"
                                placeholder="Pricilia Chen"
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">{t('auth.email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pricilia-blue/20 focus:border-pricilia-blue transition-all"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">{t('auth.password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pricilia-blue/20 focus:border-pricilia-blue transition-all"
                            required
                        />
                    </div>

                    {isSignUp && (
                        <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in duration-200">
                            <label className="text-sm font-medium text-slate-700">{t('auth.confirm_password')}</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${confirmPassword && password !== confirmPassword
                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                                    : 'border-slate-200 focus:ring-pricilia-blue/20 focus:border-pricilia-blue'
                                    }`}
                                required
                            />
                        </div>
                    )}

                    {!isSignUp && (
                        <div className="flex justify-end">
                            <a href="#" className="text-sm text-pricilia-blue font-medium hover:underline">
                                {t('auth.forgot')}
                            </a>
                        </div>
                    )}

                    <button className="w-full btn-primary mt-6">
                        {isSignUp ? t('auth.submit_register') : t('auth.submit')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
