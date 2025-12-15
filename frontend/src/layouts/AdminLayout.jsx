import Navbar from "../components/Navbar";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      {/* below navbar */}
      <div className="flex pt-16">
        <AdminSidebar />

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
