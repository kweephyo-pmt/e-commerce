import { Shield, Book, PenTool, Users, AlertTriangle } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-magenta-500/10 border border-magenta-500/50 mb-4" style={{ boxShadow: '0 0 30px rgba(255, 0, 255, 0.2)' }}>
                        <Book className="w-8 h-8 text-magenta-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        Terms of <span className="text-magenta-400" style={{ textShadow: '0 0 20px rgba(255, 0, 255, 0.6)' }}>Service</span>
                    </h1>
                    <p className="text-lg text-gray-400 font-bold max-w-2xl mx-auto" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        Guidelines for platform usage and user responsibilities.
                    </p>
                </div>

                {/* Content Container */}
                <div className="bg-gray-900/60 border border-magenta-500/20 corner-clip p-8 md:p-12 space-y-10 relative overflow-hidden backdrop-blur-sm">
                    {/* Background Grid */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 255, 0.1) 2px, rgba(255, 0, 255, 0.1) 4px)' }}>
                    </div>

                    {/* Section 1 */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <Users className="w-6 h-6 text-cyan-400" />
                            <h2 className="text-2xl font-black text-white uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                1. User Agreement
                            </h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed font-medium pl-9" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            By accessing or using our services, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access the service. These Terms apply to all visitors, users, and others who access or use the Service.
                        </p>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <PenTool className="w-6 h-6 text-yellow-400" />
                            <h2 className="text-2xl font-black text-white uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                2. Accounts
                            </h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed font-medium pl-9" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service.
                        </p>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <Shield className="w-6 h-6 text-green-400" />
                            <h2 className="text-2xl font-black text-white uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                3. Intellectual Property
                            </h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed font-medium pl-9" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            The Service and its original content, features, and functionality are and will remain the exclusive property of Techno World and its licensors. The Service is protected by copyright, trademark, and other laws of both the Thailand and foreign countries.
                        </p>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                            <h2 className="text-2xl font-black text-white uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                4. Termination
                            </h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed font-medium pl-9" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
                        </p>
                    </div>

                    <div className="pt-8 border-t border-gray-800 text-sm text-gray-500 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        Last Updated: {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
