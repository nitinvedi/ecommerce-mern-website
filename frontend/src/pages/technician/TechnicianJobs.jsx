import { motion } from "framer-motion";
import { Wrench, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const MOCK_JOBS = [
  {
    id: "REP00123",
    device: "iPhone 13",
    issue: "Screen replacement",
    status: "In Progress",
  },
  {
    id: "REP00124",
    device: "Samsung S21",
    issue: "Battery issue",
    status: "Pending",
  },
];

export default function TechnicianJobs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Assigned Repairs
        </h1>

        <div className="space-y-4">
          {MOCK_JOBS.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-black/5 p-5 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-black/5 p-2">
                  <Wrench />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {job.device}
                  </p>
                  <p className="text-xs text-gray-500">
                    {job.issue} • {job.status}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate(`/technician/job/${job.id}`)
                }
                className="text-sm text-gray-700 hover:text-black flex items-center gap-1"
              >
                Open <ArrowRight size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
