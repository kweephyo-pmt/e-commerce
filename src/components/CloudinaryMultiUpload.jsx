import { useState } from 'react';
import { Upload, X, Plus, ImageIcon, AlertCircle, GripVertical } from 'lucide-react';

/**
 * CloudinaryMultiUpload
 * Props:
 *   images       {string[]}  - current array of image URLs
 *   onChange     {fn}        - called with the new images array on every change
 *   maxImages    {number}    - max allowed images (default 8)
 */
const CloudinaryMultiUpload = ({ images = [], onChange, maxImages = 8 }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const openWidget = () => {
        setError('');

        if (!window.cloudinary) {
            setError('Cloudinary script not loaded. Please refresh the page.');
            return;
        }

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            setError('Cloudinary is not configured. Check your environment variables.');
            return;
        }

        const remaining = maxImages - images.length;
        if (remaining <= 0) {
            setError(`Maximum ${maxImages} images allowed. Remove one to add more.`);
            return;
        }

        try {
            // Stale-closure fix: snapshot existing images at widget-open time.
            // New uploads are pushed into `sessionUploads` (a plain mutable array),
            // so every success callback sees all previous uploads in this session.
            // This prevents photo 2 from overwriting photo 1.
            const baseImages = [...images];
            const sessionUploads = [];

            const widget = window.cloudinary.createUploadWidget(
                {
                    cloudName,
                    uploadPreset,
                    sources: ['local', 'url', 'camera'],
                    multiple: true,
                    maxFiles: remaining,
                    maxFileSize: 5000000,
                    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                    maxImageWidth: 2000,
                    maxImageHeight: 2000,
                    folder: 'e-commerce/products',
                    resourceType: 'image',
                    showSkipCropButton: true,
                    croppingShowDimensions: true
                },
                (err, result) => {
                    if (err) {
                        setError(`Upload failed: ${err.message || 'Unknown error'}`);
                        setUploading(false);
                        return;
                    }
                    if (result.event === 'success') {
                        // Append to session accumulator, then merge with base snapshot
                        sessionUploads.push(result.info.secure_url);
                        onChange([...baseImages, ...sessionUploads]);
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

    const removeImage = (index) => {
        const updated = images.filter((_, i) => i !== index);
        onChange(updated);
    };

    const moveImage = (from, to) => {
        if (to < 0 || to >= images.length) return;
        const updated = [...images];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        onChange(updated);
    };

    const canAdd = images.length < maxImages;

    return (
        <div className="space-y-4">
            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border-2 border-red-500/50 corner-clip-sm"
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

            {/* Image grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((url, idx) => (
                        <div
                            key={url + idx}
                            className={`relative group corner-clip overflow-hidden border-2 aspect-square ${idx === 0
                                ? 'border-cyan-500/70'
                                : 'border-purple-500/40 hover:border-purple-400'
                                } transition-all`}
                            style={{ boxShadow: idx === 0 ? '0 0 15px rgba(0,255,255,0.3)' : '0 0 8px rgba(147,51,234,0.2)' }}
                        >
                            <img
                                src={url}
                                alt={`Product image ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Main label badge */}
                            {idx === 0 && (
                                <div className="absolute bottom-0 left-0 right-0 bg-cyan-500/80 py-0.5 text-center">
                                    <span className="text-white text-[10px] font-black uppercase tracking-widest"
                                        style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                        Main
                                    </span>
                                </div>
                            )}

                            {/* Overlay actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-1">
                                {/* Move left/right */}
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => moveImage(idx, idx - 1)}
                                        disabled={idx === 0}
                                        className="p-1 bg-gray-800/90 border border-gray-600 corner-clip-sm text-gray-300 hover:text-white hover:border-cyan-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-xs font-black"
                                        title="Move left"
                                    >←</button>
                                    <button
                                        type="button"
                                        onClick={() => moveImage(idx, idx + 1)}
                                        disabled={idx === images.length - 1}
                                        className="p-1 bg-gray-800/90 border border-gray-600 corner-clip-sm text-gray-300 hover:text-white hover:border-cyan-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-xs font-black"
                                        title="Move right"
                                    >→</button>
                                </div>
                                {/* Remove */}
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="p-1.5 bg-red-500/80 hover:bg-red-500 border border-red-400 corner-clip-sm text-white transition-all"
                                    title="Remove image"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Image number badge */}
                            <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-gray-900/80 border border-gray-600 corner-clip-sm flex items-center justify-center">
                                <span className="text-[10px] font-black text-gray-300"
                                    style={{ fontFamily: 'Orbitron, sans-serif' }}>{idx + 1}</span>
                            </div>
                        </div>
                    ))}

                    {/* Add more slot */}
                    {canAdd && (
                        <button
                            type="button"
                            onClick={openWidget}
                            disabled={uploading}
                            className="aspect-square corner-clip border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-gray-900/60 hover:bg-purple-500/5 transition-all flex flex-col items-center justify-center gap-2 group disabled:opacity-50"
                            style={{ boxShadow: '0 0 10px rgba(147,51,234,0.1)' }}
                        >
                            <Plus className="w-6 h-6 text-purple-400/60 group-hover:text-purple-300 transition-colors" />
                            <span className="text-xs text-gray-500 group-hover:text-gray-300 font-bold uppercase transition-colors"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                Add
                            </span>
                        </button>
                    )}
                </div>
            )}

            {/* Empty state */}
            {images.length === 0 && (
                <div
                    onClick={openWidget}
                    className="relative corner-clip border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-gray-900/60 hover:bg-purple-500/5 transition-all duration-300 cursor-pointer group"
                    style={{ boxShadow: '0 0 15px rgba(147,51,234,0.1)' }}
                >
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(147,51,234,0.2) 2px, rgba(147,51,234,0.2) 4px)' }} />
                    <div className="flex flex-col items-center justify-center py-12 px-6 relative z-10">
                        <div className="w-20 h-20 corner-clip bg-purple-500/10 border-2 border-purple-500/30 group-hover:border-purple-400 flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                            style={{ boxShadow: '0 0 20px rgba(147,51,234,0.2)' }}>
                            <ImageIcon className="w-9 h-9 text-purple-400/60 group-hover:text-purple-300 transition-colors"
                                style={{ filter: 'drop-shadow(0 0 8px rgba(147,51,234,0.6))' }} />
                        </div>
                        <p className="font-black text-purple-300 uppercase tracking-wide text-lg mb-1"
                            style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 10px rgba(147,51,234,0.5)' }}>
                            No Images Selected
                        </p>
                        <p className="text-sm text-gray-400 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            Click to upload product photos
                        </p>
                    </div>
                </div>
            )}

            {/* Upload button */}
            <button
                type="button"
                onClick={openWidget}
                disabled={uploading || !canAdd}
                className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 corner-clip-sm border-2 font-black uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    background: 'linear-gradient(135deg, rgba(147,51,234,0.3), rgba(109,40,217,0.3))',
                    borderColor: 'rgba(147,51,234,0.7)',
                    boxShadow: '0 0 20px rgba(147,51,234,0.35)',
                    color: 'rgba(216,180,254,1)'
                }}
                onMouseEnter={e => { if (!uploading && canAdd) { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(147,51,234,0.5), rgba(109,40,217,0.5))'; e.currentTarget.style.boxShadow = '0 0 30px rgba(147,51,234,0.6)'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(147,51,234,0.3), rgba(109,40,217,0.3))'; e.currentTarget.style.boxShadow = '0 0 20px rgba(147,51,234,0.35)'; }}
            >
                {uploading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-purple-400/40 border-t-purple-400 rounded-full animate-spin" />
                        <span>Opening Uploader...</span>
                    </>
                ) : (
                    <>
                        <Upload className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 5px rgba(147,51,234,0.8))' }} />
                        <span>
                            {!canAdd
                                ? `Max ${maxImages} Images Reached`
                                : images.length > 0
                                    ? `⚡ Add More Images (${images.length}/${maxImages})`
                                    : '⚡ Upload Images'}
                        </span>
                    </>
                )}
            </button>

            {/* Hints */}
            <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                <span>JPG · PNG · GIF · WebP · Max 5MB each</span>
                <span className={images.length >= maxImages ? 'text-red-400' : 'text-gray-500'}>
                    {images.length}/{maxImages} images
                </span>
            </div>
            {images.length > 0 && (
                <p className="text-xs text-cyan-500/60 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    ⚡ First image is the main display image. Use ← → to reorder.
                </p>
            )}
        </div>
    );
};

export default CloudinaryMultiUpload;
