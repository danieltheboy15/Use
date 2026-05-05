import React, { useEffect, useState } from "react";
import { 
  ClipboardList, 
  User, 
  Activity, 
  ShieldAlert, 
  Clock,
  Search,
  Filter,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { format } from "date-fns";

interface AuditLog {
  _id: string;
  adminId: {
    businessName: string;
    email: string;
  };
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

const AdminAuditLogs: React.FC = () => {
  const { fetchWithAuth } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetchWithAuth("/api/admin/audit-logs");
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error("Fetch audit logs error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 text-left">
      <header>
        <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight mb-2">Audit Registry</h1>
        <p className="text-gray-500 font-medium font-inter">Full lifecycle tracking of every administrative action. Accountability and security at the core.</p>
      </header>

      <div className="bg-white rounded-[40px] border border-[#F07E48]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#F07E48]/5 bg-gray-50/50">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Admin</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Action</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Target</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F07E48]/5">
              {logs.map((log) => (
                <motion.tr 
                  key={log._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-[#FDF8F3]/50 transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-white text-[10px] font-bold">
                        {log.adminId?.email.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1A1A1A]">{log.adminId?.businessName || "System"}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{log.adminId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider">{log.action.replace(/_/g, " ")}</span>
                      <span className="text-[10px] text-gray-500 font-medium line-clamp-1">{log.details}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-600 uppercase tracking-tight">
                       {log.targetType}
                       <ArrowRight className="w-2.5 h-2.5" />
                       {log.targetId.substring(log.targetId.length - 6)}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(log.createdAt), "HH:mm:ss · MMM d")}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {logs.length === 0 && !loading && (
             <div className="p-24 text-center">
                <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-6" />
                <p className="text-gray-500 font-bold">No audit logs found.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
