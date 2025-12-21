import { useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* below navbar */}
      <div className="flex pt-16">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 lg:p-8 w-full overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={goBack}
              className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
            >
              ← Back
            </button>

            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
            >
              <Menu size={20} />
            </button>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
