import Navbar from "../../components/Navbar";
import useAuth from "../../hooks/useAuth";

export default function TechnicianProfile() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="max-w-xl mx-auto px-6 pt-24">
        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Technician Profile
          </h1>

          <div className="mt-6 space-y-3 text-sm">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> Technician</p>
          </div>
        </div>
      </main>
    </div>
  );
}
