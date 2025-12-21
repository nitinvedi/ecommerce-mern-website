import { createContext, useContext, useState, useEffect } from 'react';
import { api, API_ENDPOINTS } from '../config/api';
import useAuth from '../hooks/useAuth';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync with server on login/mount
  useEffect(() => {
    const syncCart = async () => {
      if (user) {
        try {
          // If we have local items, sync (merge) with server
          const { products } = await api.post(API_ENDPOINTS.CART.SYNC, { products: cartItems });
          // Update local state with the merged result from server
          setCartItems(products.map(p => ({
              ...p,
              quantity: Number(p.quantity) // Ensure number
          })));
        } catch (error) {
          console.error("Failed to sync cart:", error);
        }
      }
    };
    
    // Only run this when USER changes (e.g. login)
    // We shouldn't run it on every cart change, that's handled individually.
    if (user) syncCart();
  }, [user]); 

  // Persist to LocalStorage (Always, as backup/cache)
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);


  // Helper to check stock
  const checkStock = (product, newQty) => {
    if (product.stock === undefined || product.stock === null) return true; // Assume in stock
    return newQty <= Number(product.stock);
  };

  const syncUpdateToServer = async (newItems) => {
      if (!user) return;
      try {
          // Debounce could be good here, but for now direct update
          await api.put(API_ENDPOINTS.CART.BASE, { 
              products: newItems.map(p => ({ _id: p._id, quantity: p.quantity })) 
          });
      } catch (err) {
          console.error("Failed to save cart:", err);
      }
  };

  const addToCart = (product, quantity = 1) => {
    let success = false;
    let newItems = [];
    
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      const currentQty = existing ? existing.quantity : 0;
      const proposedQty = currentQty + quantity;
      
      const maxQty = Number(product.stock || 1000);

      // Stock Check
      if (!checkStock(product, proposedQty)) {
        if (currentQty >= maxQty) {
            newItems = prev;
            return prev;
        }
        
        // Cap
        if (existing) {
             newItems = prev.map(item => item._id === product._id ? { ...item, quantity: maxQty } : item);
        } else {
             newItems = [...prev, { ...product, quantity: maxQty }];
        }
        success = true;
      } else {
        success = true;
        if (existing) {
             newItems = prev.map((item) =>
                item._id === product._id ? { ...item, quantity: proposedQty } : item
            );
        } else {
             newItems = [...prev, { ...product, quantity: proposedQty }];
        }
      }
      return newItems;
    });
    
    if (success) syncUpdateToServer(newItems);
    return success;
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
        const next = prev.filter((item) => item._id !== productId);
        syncUpdateToServer(next);
        return next;
    });
  };

  const updateQuantity = (productId, quantity, stock) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const capped = stock !== undefined ? Math.min(quantity, Number(stock)) : quantity;
    
    setCartItems((prev) => {
        const next = prev.map((item) =>
            item._id === productId ? { ...item, quantity: capped } : item
        );
        syncUpdateToServer(next);
        return next;
    });
  };

  const clearCart = async () => {
    setCartItems([]);
    if (user) {
        try {
            await api.put(API_ENDPOINTS.CART.BASE, { products: [] });
        } catch (err) {
            console.error("Failed to clear server cart");
        }
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

export default CartContext;
