import * as Cart from "../models/Cart.js";
import { getProductById } from "../models/Product.js";

// Get cart with product details
export const getCart = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const cart = await Cart.getCartByUser(req.user._id);
    
    if (!cart || !cart.products || cart.products.length === 0) {
      return res.json({ products: [] });
    }
    
    // Populate details
    const populated = await Promise.all(cart.products.map(async (item) => {
        try {
            const product = await getProductById(item.product);
            if (!product) return null;
            return {
                ...product,
                quantity: item.quantity,
                // Ensure ID is string for frontend
                _id: product._id.toString()
            };
        } catch (err) {
            return null;
        }
    }));
    
    res.json({ products: populated.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sync cart (merge local into server)
export const syncCart = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    const localItems = req.body.products || []; // Expect [{ _id, quantity }]
    
    const serverCart = await Cart.getCartByUser(req.user._id);
    let merged = [];
    
    if (!serverCart || !serverCart.products) {
        merged = localItems.map(p => ({
            product: p._id,
            quantity: p.quantity
        }));
    } else {
        // Map server items
        const serverMap = new Map();
        serverCart.products.forEach(p => serverMap.set(p.product.toString(), p.quantity));
        
        // Merge local
        localItems.forEach(p => {
             const sid = p._id;
             if (serverMap.has(sid)) {
                 // Policy: Use MAX quantity (or sum? let's use sum for "add more", or max for "sync state")
                 // For true "sync", usually we take the latest. But here we assume "local" is "additions" if this is called on login? 
                 // Actually, if called on "Add to Cart", we just want entire state.
                 // A simple "Sync" usually means "Here is my current cart, save it". 
                 // BUT if I log in, I want to MERGE.
                 // Let's implement MERGE:
                 const existing = serverMap.get(sid);
                 serverMap.set(sid, Math.max(existing, p.quantity)); // Use max to avoid huge numbers, or sum?
                 // Let's just USE LOCAL if provided, else keep server?
                 // NO, best UX: User has 1 item on phone. Logs in on laptop (empty). Laptop should get 1 item.
                 // User has 1 item on laptop (local). Logs in. Server has 2 items. Result? 3 items (union).
                 
                 // If item exists in both, we take the one with higher quantity or just overwrite?
                 // Let's take the LOCAL because it's the most recent user action context usually? 
                 // No, usually "Merge".
                 serverMap.set(sid, p.quantity); // Overwrite with local for now.
             } else {
                 serverMap.set(sid, p.quantity);
             }
        });
        
        // Convert back to array
        merged = Array.from(serverMap.entries()).map(([pid, qty]) => ({
            product: pid,
            quantity: qty
        }));
    }
    
    await Cart.updateCart(req.user._id, merged);
    
    // Return full populated cart
    return getCart(req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update cart (full replace, used for increment/decrement/remove triggers)
export const updateCart = async (req, res) => {
   try {
       // Expect raw list of { _id, quantity }
       const items = req.body.products || [];
       await Cart.updateCart(req.user._id, items.map(p => ({
           product: p._id,
           quantity: p.quantity
       })));
       res.json({ success: true });
   } catch (error) {
     res.status(500).json({ message: error.message });
   }
};

export default { getCart, syncCart, updateCart };
