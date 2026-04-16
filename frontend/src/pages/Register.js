import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUserPlus, FiUser, FiAtSign } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'user'
    });
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...registerData } = formData;
            await register(registerData);
            toast.success('Registration successful!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex selection:bg-blue-600 selection:text-white">
            {/* Left Panel - Branding/Visual (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 bg-blue-600 bg-gradient-to-br from-blue-600 to-indigo-900 justify-center items-center py-12 px-16 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/30 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div className="relative z-10 text-white max-w-lg">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 mb-8 shadow-2xl">
                        <FiUserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
                        Start your learning journey.
                    </h1>
                    <p className="text-blue-100 text-lg leading-relaxed mb-12 font-medium">
                        Join CodeTest Hub to level up your skills, compete in contests, and connect with a community of expert developers.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
                <div className="max-w-md w-full">
                    <div className="text-center lg:text-left mb-10">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create an account</h2>
                        <p className="mt-3 text-sm text-slate-500 font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">Sign in here</Link>
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Name & Username Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label htmlFor="fullName" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                                    Full Name
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="username" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm"
                                    placeholder="johndoe123"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Email Address */}
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

                        {/* Password Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label htmlFor="password" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="confirmPassword" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all sm:text-sm"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-8 py-4 bg-slate-900 text-white rounded-xl text-sm font-bold tracking-wide hover:bg-black hover:-translate-y-0.5 transition-all duration-300 shadow-md shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <span>Create Account</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
