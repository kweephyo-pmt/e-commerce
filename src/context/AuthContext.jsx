import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// Helper function to convert Firebase error codes to user-friendly messages
const getAuthErrorMessage = (error) => {
    const errorCode = error.code;

    switch (errorCode) {
        case 'auth/invalid-credential':
            return 'Invalid email or password. Please check your credentials and try again.';
        case 'auth/user-not-found':
            return 'No account found with this email address. Please sign up first.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again or reset your password.';
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please sign in instead.';
        case 'auth/weak-password':
            return 'Password is too weak. Please use at least 6 characters.';
        case 'auth/invalid-email':
            return 'Invalid email address. Please enter a valid email.';
        case 'auth/user-disabled':
            return 'This account has been disabled. Please contact support.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later or reset your password.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection and try again.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in popup was closed. Please try again.';
        case 'auth/cancelled-popup-request':
            return 'Sign-in was cancelled. Please try again.';
        case 'auth/operation-not-allowed':
            return 'This sign-in method is not enabled. Please contact support.';
        default:
            return error.message || 'An unexpected error occurred. Please try again.';
    }
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Helper to load user profile and admin status from Firestore.
                // Retries once after a short delay to handle auth-token propagation lag.
                const loadUserData = async (retryOnPermissionError = true) => {
                    try {
                        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                        const userData = userDoc.data();
                        const adminStatus = userData?.isAdmin === true;

                        setIsAdmin(adminStatus);
                        // Set user AFTER Firestore read so dependents (WishlistContext etc.)
                        // don't fire before the auth token is fully propagated.
                        setUser(firebaseUser);
                        setUserProfile({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: userData?.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                            photoURL: userData?.photoURL || firebaseUser.photoURL || null,
                            phone: userData?.phone || null,
                        });

                        // Redirect based on user type
                        const currentPath = window.location.pathname;
                        if (adminStatus && !currentPath.startsWith('/admin')) {
                            window.location.href = '/admin/dashboard';
                        } else if (!adminStatus && currentPath.startsWith('/admin/dashboard')) {
                            window.location.href = '/';
                        }
                    } catch (error) {
                        // Auth token can take a moment to propagate to Firestore after sign-in.
                        // Retry once after 1.5 s before giving up.
                        if (retryOnPermissionError && error.code === 'permission-denied') {
                            console.warn('Auth token not yet propagated, retrying in 1.5s...');
                            await new Promise(res => setTimeout(res, 1500));
                            return loadUserData(false);
                        }
                        console.error('Error checking admin status:', error);
                        // Fall back: expose the Firebase user without admin privileges
                        setIsAdmin(false);
                        setUser(firebaseUser);
                        setUserProfile({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                            photoURL: firebaseUser.photoURL || null,
                            phone: null,
                        });
                    } finally {
                        setLoading(false);
                    }
                };

                await loadUserData();
            } else {
                setUser(null);
                setUserProfile(null);
                setIsAdmin(false);
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);


    const signUp = async (email, password, displayName = null, phone = null) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Update user profile with display name
            if (displayName) {
                await updateProfile(result.user, {
                    displayName: displayName
                });
            }

            // Create user document in Firestore
            await setDoc(doc(db, 'users', result.user.uid), {
                email: result.user.email,
                isAdmin: false, // Default to non-admin
                createdAt: serverTimestamp(),
                displayName: displayName || null,
                phone: phone || null,
                photoURL: result.user.photoURL || null
            });

            return result.user;
        } catch (error) {
            const friendlyError = new Error(getAuthErrorMessage(error));
            friendlyError.code = error.code;
            throw friendlyError;
        }
    };

    const signIn = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);

            // Check if user is admin
            const userDoc = await getDoc(doc(db, 'users', result.user.uid));
            const userData = userDoc.data();

            if (userData?.isAdmin === true) {
                // Sign out immediately to prevent redirect
                await firebaseSignOut(auth);
                throw new Error('Admin accounts cannot log in here. Please use the admin login page.');
            }

            return result.user;
        } catch (error) {
            // If it's our custom admin error, throw it as-is
            if (error.message === 'Admin accounts cannot log in here. Please use the admin login page.') {
                throw error;
            }
            // Otherwise, convert to friendly error
            const friendlyError = new Error(getAuthErrorMessage(error));
            friendlyError.code = error.code;
            throw friendlyError;
        }
    };

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            // Check if user document exists
            const userDoc = await getDoc(doc(db, 'users', result.user.uid));

            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData?.isAdmin === true) {
                    // Sign out immediately if admin tries to use Google sign-in on customer page
                    await firebaseSignOut(auth);
                    throw new Error('Admin accounts cannot use Google sign-in on this page.');
                }
            } else {
                // Create new user document for first-time Google sign-in
                await setDoc(doc(db, 'users', result.user.uid), {
                    email: result.user.email,
                    isAdmin: false, // Default to non-admin
                    createdAt: serverTimestamp(),
                    displayName: result.user.displayName || null,
                    photoURL: result.user.photoURL || null
                });
            }

            return result.user;
        } catch (error) {
            const friendlyError = new Error(getAuthErrorMessage(error));
            friendlyError.code = error.code;
            throw friendlyError;
        }
    };

    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            const friendlyError = new Error(getAuthErrorMessage(error));
            friendlyError.code = error.code;
            throw friendlyError;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            // Redirect based on current location
            const currentPath = window.location.pathname;
            if (currentPath.startsWith('/admin')) {
                window.location.href = '/admin';
            } else {
                window.location.href = '/';
            }
        } catch (error) {
            const friendlyError = new Error(getAuthErrorMessage(error));
            friendlyError.code = error.code;
            throw friendlyError;
        }
    };

    const value = {
        user,
        userProfile,
        loading,
        isAdmin,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
