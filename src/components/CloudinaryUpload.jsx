import { useState } from 'react';
import { Upload, Image as ImageIcon, X, AlertCircle, CheckCircle } from 'lucide-react';

const CloudinaryUpload = ({ onUploadSuccess, currentImage }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImage || '');
    const [error, setError] = useState('');

    const handleUpload = () => {
        setError('');

        if (!window.cloudinary) {
            setError('Cloudinary script not loaded. Please refresh the page.');
            return;
        }

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            setError('Cloudinary is not configured. Please check your environment variables.');
            return;
        }

        try {
            const widget = window.cloudinary.createUploadWidget(
                {
                    cloudName,
                    uploadPreset,
                    sources: ['local', 'url', 'camera'],
                    multiple: false,
                    maxFileSize: 5000000,
                    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                    maxImageWidth: 2000,
                    maxImageHeight: 2000,
                    cropping: true,
                    croppingAspectRatio: 1,
                    folder: 'e-commerce/products',
                    resourceType: 'image',
                    showSkipCropButton: true,
                    croppingShowDimensions: true
                },
                (error, result) => {
                    if (error) {
                        setError(`Upload failed: ${error.message || 'Unknown error'}`);
                        setUploading(false);
                        return;
                    }
                    if (result.event === 'success') {
                        const imageUrl = result.info.secure_url;
                        setPreview(imageUrl);
                        onUploadSuccess(imageUrl);
                        setUploading(false);
                        setError('');
                    }
                    if (result.event === 'close') {
                        setUploading(false);
                    }
                }
            );
            setUploading(true);
            widget.open();
        } catch (err) {
            setError('Failed to open upload widget. Please try again.');
            setUploading(false);
        }
    };

    const clearImage = () => {
        setPreview('');
        onUploadSuccess('');
        setError('');
    };

    return (
        <div className="space-y-4">

            {/* Error State */}
            {error && (
                <div className="flex items-start space-x-3 p-4 bg-red-500/10 border-2 border-red-500/50 corner-clip-sm"
                    style={{ boxShadow: '0 0 15px rgba(239,68,68,0.2)' }}>
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                        style={{ filter: 'drop-shadow(0 0 5px rgba(239,68,68,0.8))' }} />
                    <div>
                        <p className="font-black text-red-400 uppercase text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            Upload Error
                        </p>
                        <p className="text-red-300 text-sm mt-0.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{error}</p>
                    </div>
                </div>
            )}

            {/* Image Preview / Drop Zone */}
            {preview ? (
                <div className="relative group corner-clip overflow-hidden border-2 border-purple-500/50"
                    style={{ boxShadow: '0 0 25px rgba(147,51,234,0.3)' }}>
                    {/* Subtle dot-grid background instead of solid black */}
                    <div className="absolute inset-0"
                        style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.08) 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundColor: 'rgba(17,24,39,0.95)' }}></div>
                    {/* Corner glow accents */}
                    <div className="absolute top-0 left-0 w-16 h-16 opacity-30 pointer-events-none z-10"
                        style={{ background: 'radial-gradient(circle at top left, rgba(147,51,234,0.6), transparent)' }}></div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 opacity-30 pointer-events-none z-10"
                        style={{ background: 'radial-gradient(circle at bottom right, rgba(147,51,234,0.6), transparent)' }}></div>

                    {/* Compact side-by-side layout */}
                    <div className="relative z-20 flex items-center p-4 gap-5">
                        {/* Image — fixed square, not full width */}
                        <div className="w-32 h-32 flex-shrink-0 corner-clip overflow-hidden border-2 border-purple-500/40"
                            style={{ boxShadow: '0 0 15px rgba(147,51,234,0.4)' }}>
                            <img
                                src={preview}
                                alt="Product preview"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0"
                                    style={{ filter: 'drop-shadow(0 0 5px rgba(0,255,0,0.8))' }} />
                                <span className="text-green-400 text-sm font-black uppercase tracking-wide"
                                    style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 8px rgba(0,255,0,0.6)' }}>
                                    Image Ready
                                </span>
                            </div>
                            <p className="text-gray-300 text-xs font-bold truncate"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                {preview.split('/').pop()?.split('?')[0] || 'product-image'}
                            </p>
                            <p className="text-gray-500 text-xs mt-1 font-bold uppercase"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                Click "Change Image" to replace
                            </p>
                        </div>

                        {/* Remove button */}
                        <button
                            type="button"
                            onClick={clearImage}
                            className="flex-shrink-0 p-2 bg-red-500/10 hover:bg-red-500 border-2 border-red-500/50 hover:border-red-400 corner-clip-sm text-red-400 hover:text-white transition-all duration-200 self-start"
                            style={{ boxShadow: '0 0 8px rgba(239,68,68,0.3)' }}
                            title="Remove image"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                /* Empty drop zone */
                <div
                    onClick={handleUpload}
                    className="relative corner-clip border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-gray-900/60 hover:bg-purple-500/5 transition-all duration-300 cursor-pointer group"
                    style={{ boxShadow: '0 0 15px rgba(147,51,234,0.1)' }}
                >
                    {/* Scan-line */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(147,51,234,0.2) 2px, rgba(147,51,234,0.2) 4px)' }}></div>

                    <div className="flex flex-col items-center justify-center py-12 px-6 relative z-10">
                        {/* Animated icon */}
                        <div className="w-20 h-20 corner-clip bg-purple-500/10 border-2 border-purple-500/30 group-hover:border-purple-400 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                            style={{ boxShadow: '0 0 20px rgba(147,51,234,0.2)' }}>
                            <ImageIcon className="w-9 h-9 text-purple-400/60 group-hover:text-purple-300 transition-colors"
                                style={{ filter: 'drop-shadow(0 0 8px rgba(147,51,234,0.6))' }} />
                        </div>

                        <p className="font-black text-purple-300 uppercase tracking-wide text-lg mb-1"
                            style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(147,51,234,0.5)' }}>
                            No Image Selected
                        </p>
                        <p className="text-sm text-gray-400 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            Click to upload or use the button below
                        </p>
                    </div>
                </div>
            )}

            {/* Upload Button */}
            <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="w-full inline-flex items-center justify-center space-x-3 px-6 py-4 corner-clip-sm border-2 font-black uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    background: uploading
                        ? 'linear-gradient(135deg, rgba(147,51,234,0.2), rgba(109,40,217,0.2))'
                        : 'linear-gradient(135deg, rgba(147,51,234,0.3), rgba(109,40,217,0.3))',
                    borderColor: uploading ? 'rgba(147,51,234,0.3)' : 'rgba(147,51,234,0.7)',
                    boxShadow: uploading ? 'none' : '0 0 20px rgba(147,51,234,0.35)',
                    color: uploading ? 'rgba(167,139,250,0.6)' : 'rgba(216,180,254,1)'
                }}
                onMouseEnter={e => {
                    if (!uploading) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(147,51,234,0.5), rgba(109,40,217,0.5))';
                        e.currentTarget.style.boxShadow = '0 0 30px rgba(147,51,234,0.6)';
                    }
                }}
                onMouseLeave={e => {
                    if (!uploading) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(147,51,234,0.3), rgba(109,40,217,0.3))';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(147,51,234,0.35)';
                    }
                }}
            >
                {uploading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-purple-400/40 border-t-purple-400 rounded-full animate-spin"></div>
                        <span>Opening Uploader...</span>
                    </>
                ) : (
                    <>
                        <Upload className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 5px rgba(147,51,234,0.8))' }} />
                        <span>{preview ? '⚡ Change Image' : '⚡ Upload Image'}</span>
                    </>
                )}
            </button>

            {/* Format hint */}
            <p className="text-xs text-gray-500 text-center font-bold uppercase tracking-wide"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
            </p>
        </div>
    );
};

export default CloudinaryUpload;
