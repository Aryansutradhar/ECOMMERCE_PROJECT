
import { createContext, useContext, useEffect, useState } from "react";
import { authFetch, getAccessToken } from "../utils/auth";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;

    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

    // =========================
    // Fetch Cart
    // =========================
    const fetchCart = async () => {
        try {
            const res = await  authFetch(`${BASEURL}/api/cart/`);
            const data = await res.json();

            setCartItems(data.items || data.item || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    };

    useEffect(() => {
    if (getAccessToken()) {
        fetchCart();
    }
    }, []);

    // =========================
    // Add To Cart
    // =========================
    const addToCart = async (product) => {
        try {
            const res = await  authFetch(`${BASEURL}/api/cart/add/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    product_id: product.id,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));

                throw new Error(
                    errorData.error || "Failed to add product to cart"
                );
            }

            // Get latest cart from backend
            await fetchCart();

        } catch (error) {
            console.error("Error adding to cart:", error);
        }
    };

    // =========================
    // Remove From Cart
    // =========================
    const removeFromCart = async (itemId) => {
        try {
            const res = await  authFetch(`${BASEURL}/api/cart/remove/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    item_id: itemId,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to remove item from cart");
            }

            await fetchCart();

        } catch (error) {
            console.error("Error removing from cart:", error);
        }
    };

    // =========================
    // Update Quantity
    // =========================
    const updateQuantity = async (itemId, quantity) => {
        if (quantity < 1) {
            await removeFromCart(itemId);
            return;
        }

        try {
            const res = await  authFetch(`${BASEURL}/api/cart/update/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    item_id: itemId,
                    quantity: quantity,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));

                throw new Error(
                    errorData.error || "Failed to update quantity"
                );
            }

            await fetchCart();

        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const clearCart = ()=>{
        setCartItems([]);
        setTotal(0);
    }
    return (
        <CartContext.Provider
            value={{
                cartItems,
                total,
                addToCart,
                removeFromCart,
                updateQuantity,
                fetchCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};
