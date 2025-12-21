import React from "react";
import { User, ShoppingCart, Wrench, AlertCircle } from "lucide-react";
import { SOCKET_URL } from "../../config/api";

export function TopProducts({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Top Products</h3>
        <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={product._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
            <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
            <img 
              src={product.images?.[0]?.startsWith("http") ? product.images[0] : `${SOCKET_URL}${product.images?.[0]}`} 
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover bg-gray-100" 
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h4>
              <p className="text-xs text-gray-500">{product.category}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">₹{product.price.toLocaleString()}</p>
              <p className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">In Stock: {product.stock}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecentActivity({ activities }) {
  // Mocking activity merging if not fully provided by backend in a single stream
  // Expecting activities = { orders, users, repairs }
  
  const events = [];
  if (activities?.orders) {
    activities.orders.forEach(o => events.push({
      type: 'order',
      date: new Date(o.createdAt),
      title: `New Order #${o._id.slice(-6).toUpperCase()}`,
      desc: `Total: ₹${o.totalPrice.toLocaleString()}`,
      icon: ShoppingCart,
      color: "bg-blue-100 text-blue-600"
    }));
  }
  if (activities?.users) {
    activities.users.forEach(u => events.push({
      type: 'user',
      date: new Date(u.createdAt),
      title: `New User Joined`,
      desc: u.name,
      icon: User,
      color: "bg-green-100 text-green-600"
    }));
  }
  if (activities?.repairs) {
    activities.repairs.forEach(r => events.push({
      type: 'repair',
      date: new Date(r.createdAt),
      title: `Repair Request`,
      desc: `${r.deviceType} - ${r.issue}`,
      icon: Wrench,
      color: "bg-purple-100 text-purple-600"
    }));
  }

  // Sort by date desc
  const sortedEvents = events.sort((a, b) => b.date - a.date).slice(0, 5);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full max-h-[500px] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
      </div>

      <div className="relative pl-4 border-l border-gray-200 space-y-8">
        {sortedEvents.map((event, i) => (
          <div key={i} className="relative">
             <div className={`absolute -left-[25px] p-1.5 rounded-full ${event.color} border-4 border-white`}>
                <event.icon size={14} />
             </div>
             <div>
                <p className="text-xs text-gray-400 mb-0.5">{event.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                <h4 className="text-sm font-semibold text-gray-900">{event.title}</h4>
                <p className="text-sm text-gray-500">{event.desc}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InventoryAlert({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="text-red-600" />
        <h3 className="text-lg font-bold text-red-900">Low Stock Alert</h3>
      </div>
      <div className="space-y-3">
        {products.map(product => (
          <div key={product._id} className="bg-white p-3 rounded-xl border border-red-100 flex items-center justify-between shadow-sm">
             <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">{product.name}</span>
             <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg">Only {product.stock} left</span>
          </div>
        ))}
      </div>
    </div>
  );
}
