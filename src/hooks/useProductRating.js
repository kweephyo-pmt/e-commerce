import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useProductRating = (productId) => {
    const [rating, setRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRating = async () => {
            if (!productId) return;

            try {
                setLoading(true);
                const reviewsQuery = query(
                    collection(db, 'reviews'),
                    where('productId', '==', productId)
                );
                const reviewsSnapshot = await getDocs(reviewsQuery);
                const reviews = reviewsSnapshot.docs.map(doc => doc.data());

                if (reviews.length > 0) {
                    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
                    setRating(avgRating);
                    setReviewCount(reviews.length);
                } else {
                    setRating(0);
                    setReviewCount(0);
                }
            } catch (error) {
                console.error('Error fetching rating:', error);
                setRating(0);
                setReviewCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchRating();
    }, [productId]);

    return { rating, reviewCount, loading };
};
