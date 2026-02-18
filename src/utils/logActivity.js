import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Log an admin action to the activityLogs Firestore collection.
 * @param {Object} opts
 * @param {'product'|'category'|'order'|'user'|'settings'} opts.type
 * @param {'Package'|'ShoppingCart'|'Tag'|'Users'|'Settings'} opts.icon
 * @param {string} opts.title  - Short action label e.g. "Product Added"
 * @param {string} opts.description - Detail e.g. "Nike Air Max added to inventory"
 * @param {'cyan'|'green'|'orange'|'magenta'|'purple'|'red'|'yellow'} opts.color
 */
export const logActivity = async ({ type, icon, title, description, color }) => {
    try {
        await addDoc(collection(db, 'activityLogs'), {
            type,
            icon,
            title,
            description,
            color,
            createdAt: serverTimestamp()
        });
    } catch (err) {
        // Non-critical — don't surface to user
        console.warn('Activity log failed:', err);
    }
};
