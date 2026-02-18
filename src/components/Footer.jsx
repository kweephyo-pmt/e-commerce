import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Gamepad2, Mail, Phone, MapPin, Facebook,
    Instagram, ExternalLink
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const Footer = () => {
    const [settings, setSettings] = useState({
        description: 'Your ultimate portal to the future of gaming gear. We provide high-performance tech with a cyberpunk edge for elite players and digital enthusiasts.',
        address: 'Level 99, Cyber District',
        phone: '+66 81 234 5678',
        email: 'support@techno-world.io',
        facebook: '',
        instagram: ''
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
                        <div className="flex space-x-4">
                            {[
                                { icon: Facebook, color: 'hover:text-blue-400 hover:border-blue-400/50', url: settings.facebook },
                                { icon: Instagram, color: 'hover:text-magenta-400 hover:border-magenta-400/50', url: settings.instagram }
                            ].map((social, i) => (
                                social.url ? (
                                    <a key={i} href={social.url} target="_blank" rel="noopener noreferrer"
                                        className={`w-10 h-10 border-2 border-gray-700 corner-clip-sm flex items-center justify-center text-gray-400 transition-all duration-300 ${social.color} hover:bg-white/5`}>
                                        <social.icon className="w-5 h-5" />
                                    </a>
                                ) : (
                                    <button key={i} className="w-10 h-10 border-2 border-gray-700/30 corner-clip-sm flex items-center justify-center text-gray-700 cursor-not-allowed">
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
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                            <Link key={item} to="/" className="text-gray-600 hover:text-gray-400 text-xs font-black uppercase tracking-tighter transition-colors" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
