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
                            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-100/50 border border-indigo-200 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                                </span>
                                <span>Get in Touch</span>
                            </div>
                            
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight text-slate-950 mb-3 transition-all duration-300">
                                Let's build <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                                    something.
                                </span>
                            </h1>
                            
                            <p className="text-sm text-slate-500 max-w-md leading-relaxed font-medium mb-5">
                                Have a vision? We have the expertise. Reach out to discuss courses, partnerships, or just to say hi.
                            </p>
                        </div>

                        {/* Visual Contact Info Modules */}
                        <div className="space-y-3">
                            <div className="group flex items-center p-3.5 rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-100 transition-all duration-500 cursor-pointer">
                                <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform duration-500">
                                    <FiMail size={20} />
                                </div>
                                <div className="ml-5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Direct Email</p>
                                    <p className="text-base font-black text-slate-900 tracking-tight">pavan@gmail.com</p>
                                </div>
                                <FiExternalLink className="ml-auto text-slate-300 group-hover:text-indigo-600 transition-colors h-4 w-4" />
                            </div>

                            <div className="group flex items-center p-3.5 rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-100 transition-all duration-500 cursor-pointer">
                                <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200 group-hover:scale-105 transition-transform duration-500">
                                    <FiMessageSquare size={20} />
                                </div>
                                <div className="ml-5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Live Chat</p>
                                    <p className="text-base font-black text-slate-900 tracking-tight">Support Dashboard</p>
                                </div>
                                <FiExternalLink className="ml-auto text-slate-300 group-hover:text-slate-900 transition-colors h-4 w-4" />
                            </div>
                        </div>

                        {/* Social Accent */}
                        <div className="flex items-center space-x-4 pt-3">
                            <a href="#" className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all"><FiTwitter size={18} /></a>
                            <a href="#" className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all"><FiLinkedin size={18} /></a>
                            <a href="#" className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all"><FiGithub size={18} /></a>
                        </div>
                    </div>

                    {/* Contact Form Card (Right) - High-Polish Glassmorphism */}
                    <div className="relative">
                        {/* Decorative background glow for form */}
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl z-[-1]"></div>
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-rose-400/10 rounded-full blur-3xl z-[-1]"></div>
                        
                        <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl p-5 md:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300">
                            <h2 className="text-xl font-black text-slate-950 mb-4 tracking-tight">Drop us a line.</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="name" className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                        <input 
                                            type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all duration-300"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="email" className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                        <input 
                                            type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="hello@example.com"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="subject" className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Inquiry Subject</label>
                                    <input 
                                        type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required placeholder="What's this about?"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all duration-300"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="message" className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Your Message</label>
                                    <textarea 
                                        id="message" name="message" value={formData.message} onChange={handleChange} required rows="3" placeholder="Write your message here..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all duration-300 resize-none leading-relaxed"
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" disabled={sending}
                                    className="relative w-full overflow-hidden rounded-xl group active:scale-[0.98] transition-all duration-300 shadow-xl shadow-indigo-100"
                                >
                                    <div className="absolute inset-0 bg-slate-900 group-hover:bg-indigo-700 transition-colors"></div>
                                    <div className="relative py-4 flex items-center justify-center font-black uppercase tracking-[0.25em] text-[10px] text-white">
                                        {sending ? (
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <FiSend className="mr-3 h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                Send Message
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Polished Location Info Section */}
            <section className="bg-white border-t border-slate-100 py-8 relative z-10">
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <div className="space-y-3">
                        <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4"><FiMail size={20} /></div>
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Write to us</h4>
                        <p className="text-lg font-black text-slate-900">pavan@gmail.com</p>
                    </div>
                    <div className="space-y-3 pt-8 md:pt-0">
                        <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center mx-auto mb-4"><FiPhone size={20} /></div>
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Call us</h4>
                        <p className="text-lg font-black text-slate-900">+91 98765 43210</p>
                    </div>
                    <div className="space-y-3 pt-8 md:pt-0">
                        <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mx-auto mb-4"><FiMapPin size={20} /></div>
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Visit us</h4>
                        <p className="text-lg font-black text-slate-900">San Francisco, CA 94105</p>
                    </div>
                </div>
            </section>

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
