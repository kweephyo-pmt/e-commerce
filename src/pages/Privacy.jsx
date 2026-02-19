import { Shield, Lock, Eye, FileText } from 'lucide-react';

const Privacy = () => {
    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/50 mb-4" style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)' }}>
                        <Shield className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        Privacy <span className="text-cyan-400" style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.6)' }}>Policy</span>
                    </h1>
                    <p className="text-lg text-gray-400 font-bold max-w-2xl mx-auto" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        Your data security is our top priority. Access restricted to authorized personnel only.
                    </p>
                </div>

                {/* Content Container */}
                <div className="bg-gray-900/60 border border-cyan-500/20 corner-clip p-8 md:p-12 space-y-10 relative overflow-hidden backdrop-blur-sm">
                    {/* Background Grid */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)' }}>
                    </div>

                    {/* Section 1 */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <Eye className="w-6 h-6 text-magenta-400" />
                            <h2 className="text-2xl font-black text-white uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                1. Information Collection
                            </h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed font-medium pl-9" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            We collect information necessary to process your orders and enhance your shopping experience. This includes personal identification (Name, Email, Phone Number, Shipping Address) and payment details secured through our encrypted payment gateways.
                        </p>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <Lock className="w-6 h-6 text-cyan-400" />
                            <h2 className="text-2xl font-black text-white uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                2. Data Security
                            </h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed font-medium pl-9" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            We implement military-grade encryption protocols (SSL/TLS) to comply with industry standards. Your credit card information is never stored on our servers; it is processed directly by our secure payment providers (Stripe/Bank Gateways).
                        </p>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <FileText className="w-6 h-6 text-yellow-400" />
                            <h2 className="text-2xl font-black text-white uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                3. Cookies & Tracking
                            </h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed font-medium pl-9" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            Our system uses cookies to maintain your session integrity, remember your cart items, and personalize your interface settings. You can control cookie preferences settings directly in your browser, though this may impact site functionality.
                        </p>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <Shield className="w-6 h-6 text-green-400" />
                            <h2 className="text-2xl font-black text-white uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                                4. Third-Party Disclosure
                            </h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed font-medium pl-9" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            We do not sell, trade, or transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or serving you, so long as those parties agree to keep this information confidential.
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

export default Privacy;
