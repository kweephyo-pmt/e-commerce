import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        // Initialize cart from localStorage
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);

            if (existingItem) {
                // Update quantity if item already exists
                return prevItems.map((item) => {
                    if (item.id === product.id) {
                        const newQuantity = item.quantity + quantity;
                        // Check if new quantity would exceed stock
                        if (product.stock && newQuantity > product.stock) {
                            // Cap at available stock
                            return { ...item, quantity: product.stock, stock: product.stock };
                        }
                        return { ...item, quantity: newQuantity, stock: product.stock };
                    }
                    return item;
                });
            } else {
                // Add new item to cart
                // Make sure quantity doesn't exceed stock
                const safeQuantity = product.stock && quantity > product.stock
                    ? product.stock
                    : quantity;
                return [...prevItems, { ...product, quantity: safeQuantity }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCartItems((prevItems) =>
            prevItems.filter((item) => item.id !== productId)
        );
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) => {
                if (item.id === productId) {
                    // Check if trying to exceed available stock
                    if (item.stock && quantity > item.stock) {
                        // Don't allow quantity to exceed stock
                        return { ...item, quantity: item.stock };
                    }
                    return { ...item, quantity };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    };

    const getCartItemsCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
