import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-blue-50 text-slate-600 pt-12 pb-8 mt-auto border-t border-blue-100">
            <div className="max-w-7xl mx-auto px-6">
                {/* Main row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="text-blue-600 font-black text-2xl tracking-tight block mb-3">
                            CodeTest Hub
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-500 font-medium pr-4">
                            Empowering developers through premium courses and coding challenges.
                        </p>
                        <div className="flex items-center gap-3 mt-6">
                            <a href="#" className="w-9 h-9 rounded-full bg-white border border-blue-100 flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm"><FiTwitter size={15} /></a>
                            <a href="#" className="w-9 h-9 rounded-full bg-white border border-blue-100 flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm"><FiGithub size={15} /></a>
                            <a href="#" className="w-9 h-9 rounded-full bg-white border border-blue-100 flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm"><FiLinkedin size={15} /></a>
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="text-slate-900 font-black text-xs uppercase tracking-widest mb-5">Platform</h4>
                        <ul className="space-y-3 text-sm font-medium">
                            <li><Link to="/" className="hover:text-blue-600 transition-colors">Courses</Link></li>
                            <li><Link to="/contests" className="hover:text-blue-600 transition-colors">Contests</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-slate-900 font-black text-xs uppercase tracking-widest mb-5">Support</h4>
                        <ul className="space-y-3 text-sm font-medium">
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
                            <li>
                                <a href="mailto:pavan@gmail.com" className="hover:text-blue-600 transition-colors flex items-center gap-2 mt-2 group w-max">
                                    <div className="p-1.5 bg-white border border-blue-100 rounded-md group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-sm"><FiMail size={12} /></div>
                                    pavan@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-blue-100 pt-6 flex flex-col md:flex-row justify-between items-center text-xs gap-3 font-semibold text-slate-400">
                    <p>© {new Date().getFullYear()} CodeTest Hub. All rights reserved.</p>
                    <div className="flex gap-5">
                        <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
