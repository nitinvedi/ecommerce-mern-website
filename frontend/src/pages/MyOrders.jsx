import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, API_ENDPOINTS } from "../config/api";
import { ArrowRight } from "lucide-react";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ORDERS.MY_ORDERS);

      // ✅ CORRECT: backend response shape
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch orders failed:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="max-w-6xl mx-auto px-4 pt-28 pb-12">
        <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

        {loading ? (
          <p className="text-sm text-gray-500">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-gray-500">You have no orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                className="flex items-center justify-between rounded-xl bg-white p-4 shadow hover:bg-gray-50 cursor-pointer"
              >
                <div>
                  <p className="font-medium">
                    Order #{order._id.slice(-6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    ₹{order.totalPrice?.toLocaleString()} · {order.status}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
