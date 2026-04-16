import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            toast.success('Login successful!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex selection:bg-blue-600 selection:text-white">
            {/* Left Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
                <div className="max-w-md w-full">
                    <div className="text-center lg:text-left mb-10">
                        <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center mb-6 transform -rotate-3 border border-slate-200 lg:mx-0 mx-auto shadow-sm">
                            <FiLogIn className="w-8 h-8 transform rotate-3" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back</h2>
                        <p className="mt-3 text-sm text-slate-500 font-medium">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">Sign up for free</Link>
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm"
                                placeholder="hello@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-8 py-4 bg-slate-900 text-white rounded-xl text-sm font-bold tracking-wide hover:bg-black hover:-translate-y-0.5 transition-all duration-300 shadow-md shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Panel - Distinct Branding (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 justify-center items-center py-12 px-16 relative overflow-hidden">
                {/* Minimalist Tech Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
                <div className="absolute -top-32 -left-32 w-[40rem] h-[40rem] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute -bottom-32 -right-32 w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="relative z-10 text-white max-w-lg">
                    <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
                        Pick up where <br />
                        <span className="text-blue-400">you left off.</span>
                    </h1>
                    <p className="text-slate-300 text-lg leading-relaxed font-medium">
                        Log in to resume your courses, tackle new coding challenges, and track your unstoppable progress.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
