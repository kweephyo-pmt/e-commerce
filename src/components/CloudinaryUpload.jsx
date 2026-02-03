import { useState } from 'react';
import { Upload, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

const CloudinaryUpload = ({ onUploadSuccess, currentImage }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImage || '');
    const [error, setError] = useState('');

    const handleUpload = () => {
        setError('');

        // Check if Cloudinary is loaded
        if (!window.cloudinary) {
            setError('Cloudinary script not loaded. Please refresh the page.');
            console.error('Cloudinary script not loaded');
            return;
        }

        // Check environment variables
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            setError('Cloudinary is not configured. Please check your environment variables.');
            console.error('Missing Cloudinary configuration:', { cloudName, uploadPreset });
            return;
        }

        try {
            // Create Cloudinary upload widget
            const widget = window.cloudinary.createUploadWidget(
                {
                    cloudName: cloudName,
                    uploadPreset: uploadPreset,
                    sources: ['local', 'url', 'camera'],
                    multiple: false,
                    maxFileSize: 5000000, // 5MB
                    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                    maxImageWidth: 2000,
                    maxImageHeight: 2000,
                    cropping: true,
                    croppingAspectRatio: 1,
                    folder: 'products',
                    resourceType: 'image',
                    showSkipCropButton: false,
                    croppingShowDimensions: true
                },
                (error, result) => {
                    if (error) {
                        console.error('Upload error:', error);
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
            console.error('Error creating upload widget:', err);
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
        <div className="space-y-3">
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-700 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold">Upload Error</p>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {preview ? (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Product preview"
                        className="w-full h-64 object-contain bg-gray-50 rounded-lg border-2 border-gray-200"
                    />
                    <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">No image selected</p>
                </div>
            )}

            <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="w-full btn-secondary inline-flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Upload className="w-5 h-5" />
                <span>{uploading ? 'Opening uploader...' : preview ? 'Change Image' : 'Upload Image'}</span>
            </button>

            <p className="text-xs text-gray-500 text-center">
                Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
            </p>
        </div>
    );
};

export default CloudinaryUpload;
