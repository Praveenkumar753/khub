import React, { useState } from 'react';
import { FiMail, FiMapPin, FiPhone, FiSend, FiTwitter, FiLinkedin, FiGithub, FiMessageSquare, FiExternalLink } from 'react-icons/fi';
import { inquiryService } from '../services';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [sending, setSending] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        
        try {
            await inquiryService.submitInquiry(formData);
            setSubmitted(true);
            toast.success('Message sent successfully!');
            // Reset form after 3 seconds
            setTimeout(() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', subject: '', message: '' });
                setSending(false);
            }, 3000);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error.response?.data?.error || 'Failed to send message. Please try again.');
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-indigo-600 selection:text-white">
            <Navbar />

            {/* Polished Mesh Gradient Background (Simplified to Indigo) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50rem] h-[50rem] bg-indigo-100/50 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-5%] right-[-5%] w-[60rem] h-[60rem] bg-indigo-50/40 rounded-full blur-[140px]" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[20%] right-[10%] w-[40rem] h-[40rem] bg-blue-50/30 rounded-full blur-[130px]" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="relative z-10 w-full px-6 lg:px-12 py-6 lg:py-8">
                <div className="grid lg:grid-cols-[1fr_0.85fr] gap-8 lg:gap-16 items-start">
                    
                    {/* Hero Section (Left) - Enhanced Premium Light */}
                    <div className="lg:sticky lg:top-20 space-y-5">
                        <div>
                            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-4">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                                </span>
                                <span>Get in Touch</span>
                            </div>
                            
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3 transition-all duration-300">
                                Let's build <br />
                                <span className="text-blue-600">
                                    something.
                                </span>
                            </h1>
                            
                            <p className="text-sm text-slate-500 max-w-md leading-relaxed font-medium mb-5">
                                Have a vision? We have the expertise. Reach out to discuss courses, partnerships, or just to say hi.
                            </p>
                        </div>

                        {/* Visual Contact Info Modules */}
                        <div className="space-y-3">
                            <div className="group flex items-center p-4 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform duration-300 group-hover:bg-blue-600 group-hover:text-white">
                                    <FiMail size={20} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-xs font-semibold text-slate-500 mb-0.5">Direct Email</p>
                                    <p className="text-sm font-bold text-slate-900 tracking-tight">pavan@gmail.com</p>
                                </div>
                                <FiExternalLink className="ml-auto text-slate-300 group-hover:text-blue-600 transition-colors h-4 w-4" />
                            </div>

                            <div className="group flex items-center p-4 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform duration-300 group-hover:bg-blue-600 group-hover:text-white">
                                    <FiMessageSquare size={20} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-xs font-semibold text-slate-500 mb-0.5">Technical Support</p>
                                    <p className="text-sm font-bold text-slate-900 tracking-tight">Help Center & FAQ</p>
                                </div>
                                <FiExternalLink className="ml-auto text-slate-300 group-hover:text-blue-600 transition-colors h-4 w-4" />
                            </div>

                            <div className="group flex items-center p-4 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
                                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform duration-300 group-hover:bg-blue-600 group-hover:text-white">
                                    <FiPhone size={20} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-xs font-semibold text-slate-500 mb-0.5">Business & Partners</p>
                                    <p className="text-sm font-bold text-slate-900 tracking-tight">+91 98765 43210</p>
                                </div>
                                <FiExternalLink className="ml-auto text-slate-300 group-hover:text-blue-600 transition-colors h-4 w-4" />
                            </div>
                        </div>

                        {/* Social Accent */}
                        <div className="flex items-center space-x-4 pt-3">
                            <a href="#" className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all"><FiTwitter size={18} /></a>
                            <a href="#" className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all"><FiLinkedin size={18} /></a>
                            <a href="#" className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all"><FiGithub size={18} /></a>
                        </div>
                    </div>

                    {/* Contact Form Card (Right) */}
                    <div className="relative">
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-300">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Drop us a line.</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                                        <input 
                                            type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                                        <input 
                                            type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="hello@example.com"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 ml-1">Inquiry Subject</label>
                                    <input 
                                        type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required placeholder="What's this about?"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 ml-1">Your Message</label>
                                    <textarea 
                                        id="message" name="message" value={formData.message} onChange={handleChange} required rows="4" placeholder="Write your message here..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none leading-relaxed"
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" disabled={sending}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center shadow-md shadow-blue-100 mt-2"
                                >
                                    {sending ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <FiSend className="mr-2 h-4 w-4" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Redundant Location Info Section Removed */}

            <style>
                {`
                @keyframes shimmer {
                    0% { background-position: 100% 0%; }
                    100% { background-position: -100% 0%; }
                }
                .animate-shimmer {
                    animation: shimmer 3.5s infinite linear;
                }
                `}
            </style>

            <Footer />
        </div>
    );
};

export default Contact;
