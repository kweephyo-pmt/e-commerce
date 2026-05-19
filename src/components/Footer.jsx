import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Gamepad2, Mail, Phone, MapPin, Facebook,
    Instagram
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Telegram SVG icon
const TelegramIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
);

// Discord SVG icon
const DiscordIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
);

const Footer = () => {
    const [settings, setSettings] = useState({
        description: 'Your ultimate portal to the future of gaming gear. We provide high-performance tech with a cyberpunk edge for elite players and digital enthusiasts.',
        address: 'Level 99, Cyber District',
        phone: '+66 81 234 5678',
        email: 'support@techno-world.io',
        facebook: '',
        instagram: '',
        telegram: '',
        discord: ''
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const snap = await getDoc(doc(db, 'settings', 'footer'));
                if (snap.exists()) {
                    setSettings(prev => ({ ...prev, ...snap.data() }));
                }
            } catch (e) {
                console.error('Footer load error:', e);
            }
        };
        fetchSettings();
    }, []);
    return (
        <footer className="bg-gradient-to-b from-[#0a0e27] to-[#040612] border-t-2 border-cyan-500/30 pt-16 pb-8 relative overflow-hidden" style={{ boxShadow: '0 -10px 50px rgba(0, 0, 0, 0.8)' }}>
            {/* Background elements */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="h-full w-full" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)'
                }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-magenta-500 corner-clip-sm flex items-center justify-center border-2 border-cyan-500/50 relative shadow-[0_0_20px_rgba(0,255,255,0.4)]">
                                <Gamepad2 className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-xl font-black uppercase tracking-widest text-cyan-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>TECHNO</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-magenta-400" style={{ fontFamily: 'Orbitron, sans-serif' }}>WORLD</span>
                            </div>
                        </Link>
                        <p className="text-gray-400 font-bold leading-relaxed text-left" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {settings.description}
                        </p>
                        <div className="flex space-x-3">
                            {[
                                { icon: Facebook, color: 'hover:text-blue-400 hover:border-blue-400/50', url: settings.facebook, label: 'Facebook' },
                                { icon: Instagram, color: 'hover:text-pink-400 hover:border-pink-400/50', url: settings.instagram, label: 'Instagram' },
                                { icon: TelegramIcon, color: 'hover:text-sky-400 hover:border-sky-400/50', url: settings.telegram, label: 'Telegram' },
                                { icon: DiscordIcon, color: 'hover:text-indigo-400 hover:border-indigo-400/50', url: settings.discord, label: 'Discord' }
                            ].map((social, i) => (
                                social.url ? (
                                    <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.label}
                                        className={`w-10 h-10 border-2 border-gray-700 corner-clip-sm flex items-center justify-center text-gray-400 transition-all duration-300 ${social.color} hover:bg-white/5`}>
                                        <social.icon className="w-5 h-5" />
                                    </a>
                                ) : (
                                    <button key={i} aria-label={`${social.label} (not set)`} className="w-10 h-10 border-2 border-gray-700/30 corner-clip-sm flex items-center justify-center text-gray-700 cursor-not-allowed">
                                        <social.icon className="w-5 h-5 opacity-30" />
                                    </button>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-white font-black uppercase tracking-wider text-lg" style={{ fontFamily: 'Orbitron, sans-serif' }}>Navigation</h3>
                        <ul className="space-y-4">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'Products', path: '/products' },
                                { name: 'Orders', path: '/orders' },
                                { name: 'Wishlist', path: '/wishlist' },
                                { name: 'Profile', path: '/profile' }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link to={item.path} className="text-gray-400 hover:text-cyan-300 font-bold transition-all duration-200 flex items-center group" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                        <span className="w-0 group-hover:w-4 h-0.5 bg-cyan-500 mr-0 group-hover:mr-2 transition-all duration-300 shadow-[0_0_8px_rgba(0,255,255,1)]"></span>
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-6">
                        <h3 className="text-white font-black uppercase tracking-wider text-lg" style={{ fontFamily: 'Orbitron, sans-serif' }}>Support</h3>
                        <ul className="space-y-4">
                            {[
                                { icon: MapPin, text: settings.address },
                                { icon: Phone, text: settings.phone },
                                { icon: Mail, text: settings.email }
                            ].map((item, i) => (
                                <li key={i} className="flex items-start space-x-3 text-gray-400 font-bold group" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                    <item.icon className="w-5 h-5 text-cyan-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(0,255,255,0.4)]" />
                                    <span className="group-hover:text-gray-300 transition-colors">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 font-bold text-sm tracking-widest" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        &copy; {new Date().getFullYear()} <span className="text-cyan-500/70">TECHNO WORLD</span>. ALL SYSTEMS OPERATIONAL.
                    </p>
                    <div className="flex space-x-8">
                        {[
                            { name: 'Privacy Policy', path: '/privacy' },
                            { name: 'Terms of Service', path: '/terms_of_service' },
                            { name: 'Cookie Policy', path: '/privacy' }
                        ].map((item) => (
                            <Link key={item.name} to={item.path} className="text-gray-600 hover:text-gray-400 text-xs font-black uppercase tracking-tighter transition-colors" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
