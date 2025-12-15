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

  const clampToStock = (product, desiredQty) => {
    if (product.stock === undefined || product.stock === null) return desiredQty;
    return Math.min(desiredQty, Number(product.stock));
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        const nextQty = clampToStock(product, existing.quantity + quantity);
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: nextQty }
            : item
        );
      }
      return [...prev, { ...product, quantity: clampToStock(product, quantity) }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, quantity, stock) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
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

