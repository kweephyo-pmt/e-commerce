import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within WishlistProvider');
    return context;
};

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState([]); // array of product IDs

    // Load wishlist from Firestore when user logs in
    useEffect(() => {
        if (!user) {
            setWishlist([]);
            return;
        }
        const fetchWishlist = async () => {
            try {
                const ref = doc(db, 'wishlists', user.uid);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    setWishlist(snap.data().items || []);
                } else {
                    setWishlist([]);
                }
            } catch (err) {
                console.error('Error fetching wishlist:', err);
            }
        };
        fetchWishlist();
    }, [user]);

    const isWishlisted = (productId) => wishlist.includes(productId);

    const toggleWishlist = async (productId) => {
        if (!user) return false; // not logged in

        const ref = doc(db, 'wishlists', user.uid);
        const alreadyIn = wishlist.includes(productId);

        try {
            if (alreadyIn) {
                setWishlist(prev => prev.filter(id => id !== productId));
                await updateDoc(ref, { items: arrayRemove(productId) });
            } else {
                setWishlist(prev => [...prev, productId]);
                // Use setDoc with merge so it creates the doc if it doesn't exist
                await setDoc(ref, { items: arrayUnion(productId) }, { merge: true });
            }
            return !alreadyIn; // returns new state
        } catch (err) {
            console.error('Error updating wishlist:', err);
            // Revert optimistic update
            setWishlist(prev =>
                alreadyIn ? [...prev, productId] : prev.filter(id => id !== productId)
            );
            return alreadyIn;
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlist, isWishlisted, toggleWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
