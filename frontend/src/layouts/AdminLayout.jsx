import Navbar from "../components/Navbar";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      {/* below navbar */}
      <div className="flex pt-16">
        <AdminSidebar />

        <main className="flex-1 p-8">
          <div className="mb-4">
            <button
              onClick={goBack}
              className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
            >
              ← Back
            </button>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
