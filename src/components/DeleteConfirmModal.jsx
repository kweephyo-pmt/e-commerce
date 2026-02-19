import { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/**
 * DeleteConfirmModal
 * Props:
 *   isOpen      {boolean}  - whether the modal is visible
 *   onClose     {fn}       - called when user cancels
 *   onConfirm   {fn}       - called when user confirms delete
 *   itemName    {string}   - name of the item being deleted (shown in modal)
 *   itemType    {string}   - "Product" | "Category" etc.
 *   isDeleting  {boolean}  - shows spinner while deletion is in progress
 */
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName, itemType = 'Item', isDeleting = false }) => {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape' && !isDeleting) onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose, isDeleting]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={!isDeleting ? onClose : undefined}
            />

            {/* Modal — bottom sheet on mobile, centered card on sm+ */}
            <div
                className="relative w-full sm:max-w-md bg-gray-900 border-t-2 sm:border-2 border-red-500/60 overflow-hidden animate-fade-in
                            sm:corner-clip rounded-t-2xl sm:rounded-none
                            pb-safe" /* safe-area for notched phones */
                style={{ boxShadow: '0 0 50px rgba(255, 0, 0, 0.35), 0 0 80px rgba(255, 0, 0, 0.1)' }}
            >
                {/* Scan lines */}
                <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.1) 2px, rgba(255,0,0,0.1) 4px)' }}
                />

                {/* Red top bar */}
                <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: 'linear-gradient(90deg, #ef4444, #dc2626, transparent)', boxShadow: '0 0 15px rgba(239,68,68,0.8)' }}
                />

                {/* Mobile drag handle */}
                <div className="flex justify-center pt-3 sm:hidden">
                    <div className="w-10 h-1 bg-gray-600 rounded-full" />
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={isDeleting}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 corner-clip-sm border border-transparent hover:border-red-500/40 transition-all z-10 disabled:opacity-50"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Content */}
                <div className="px-5 py-4 sm:p-8 relative z-10">
                    {/* Warning icon */}
                    <div className="flex justify-center mb-4 sm:mb-6">
                        <div
                            className="w-14 h-14 sm:w-20 sm:h-20 corner-clip flex items-center justify-center bg-red-500/10 border-2 border-red-500/60"
                            style={{ boxShadow: '0 0 30px rgba(239,68,68,0.4)' }}
                        >
                            <AlertTriangle
                                className="w-7 h-7 sm:w-10 sm:h-10 text-red-400"
                                style={{ filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.9))' }}
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <h2
                        className="text-xl sm:text-2xl font-black text-red-400 uppercase tracking-wider text-center mb-2"
                        style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 15px rgba(239,68,68,0.8)' }}
                    >
                        Delete {itemType}
                    </h2>

                    {/* Message */}
                    <p className="text-gray-300 text-center mb-2 font-bold text-sm sm:text-base" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        Are you sure you want to delete
                    </p>
                    <p
                        className="text-white text-center font-black text-base sm:text-lg mb-4 sm:mb-6 px-3 sm:px-4 py-2 bg-red-500/10 border border-red-500/30 corner-clip-sm break-all"
                        style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 8px rgba(239,68,68,0.5)' }}
                    >
                        "{itemName}"
                    </p>
                    <p className="text-gray-500 text-center text-xs sm:text-sm font-bold mb-5 sm:mb-8" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        This action <span className="text-red-400">cannot be undone</span>.
                    </p>

                    {/* Buttons — stack on very small screens, side by side otherwise */}
                    <div className="flex flex-col xs:flex-row sm:flex-row items-stretch gap-3">
                        {/* Cancel */}
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 px-4 sm:px-6 py-3 sm:py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-black uppercase tracking-wide corner-clip-sm border-2 border-gray-600 hover:border-gray-500 transition-all disabled:opacity-50 text-sm sm:text-base"
                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                        >
                            Cancel
                        </button>

                        {/* Confirm Delete */}
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-black uppercase tracking-wide corner-clip-sm border-2 border-red-500/60 hover:border-red-400 transition-all disabled:opacity-50 text-sm sm:text-base"
                            style={{ fontFamily: 'Rajdhani, sans-serif', boxShadow: '0 0 15px rgba(239,68,68,0.3)' }}
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" style={{ filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.8))' }} />
                                    <span>Delete</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
