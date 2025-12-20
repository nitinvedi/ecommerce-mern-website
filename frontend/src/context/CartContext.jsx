import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Helper to check if adding quantity triggers OOS
  const checkStock = (product, newQty) => {
    if (product.stock === undefined || product.stock === null) return true; // Assume in stock if unknown
    return newQty <= Number(product.stock);
  };

  const addToCart = (product, quantity = 1) => {
    let success = false;
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      const currentQty = existing ? existing.quantity : 0;
      const proposedQty = currentQty + quantity;

      if (!checkStock(product, proposedQty)) {
        // Option: Cap at max stock? Or just fail? 
        // Let's cap at max stock for better UX, but return "limited" signal if needed.
        // For now, let's just allow capping.
        const maxQty = Number(product.stock || 1000);
        if (currentQty >= maxQty) return prev; // Already at max
        
        // Add whatever is left
        success = true; 
        if (existing) {
             return prev.map(item => item._id === product._id ? { ...item, quantity: maxQty } : item);
        }
        return [...prev, { ...product, quantity: maxQty }];
      }

      success = true;
      if (existing) {
         return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: proposedQty }
            : item
        );
      }
      return [...prev, { ...product, quantity: proposedQty }];
    });
    return success;
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, quantity, stock) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    // Strict Cap
    const capped = stock !== undefined ? Math.min(quantity, Number(stock)) : quantity;
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === productId ? { ...item, quantity: capped } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
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

