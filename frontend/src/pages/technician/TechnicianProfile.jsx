import { useState } from "react";
import { User, Mail, Shield, Smartphone } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";

export default function TechnicianProfile() {
  const { user } = useAuth();
  const toast = useToast();

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="max-w-2xl mx-auto px-6 pt-28 pb-12">
        <div className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
              {user?.name?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {user?.name}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                <Shield size={12} />
                Technician
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Email Address</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                        <Mail size={16} className="text-gray-400" />
                        {user?.email}
                    </div>
                </div>
                <div>
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Role</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                        <Shield size={16} className="text-gray-400" />
                        Technician
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Technician Status</h3>
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-sm text-green-800 flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    You are active and can accept repair jobs.
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
