import React, { useEffect, useState } from "react";
import { 
  Package, 
  Calendar, 
  User, 
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Eye,
  XCircle,
  ArrowRight,
  Filter,
  Search
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { format } from "date-fns";

interface AdminStockpile {
  _id: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: "active" | "closed";
  endDate: string;
  createdAt: string;
  vendorId: {
    _id: string;
    businessName: string;
    email: string;
  };
  items: any[];
}

const AdminStockpiles: React.FC = () => {
  const { fetchWithAuth } = useAuth();
  const [stockpiles, setStockpiles] = useState<AdminStockpile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "closed">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchStockpiles();
  }, [filterStatus]);

  const fetchStockpiles = async () => {
    try {
      setLoading(true);
      const url = filterStatus === "all" ? "/api/admin/stockpiles" : `/api/admin/stockpiles?status=${filterStatus}`;
      const res = await fetchWithAuth(url);
      if (res.ok) {
        const data = await res.json();
        setStockpiles(data);
      }
    } catch (err) {
      console.error("Fetch stockpiles error:", err);
    } finally {
      setLoading(false);
    }
  };

  const forceClose = async (id: string) => {
    if (!confirm("Are you sure you want to force close this stockpile? This will notify the customer.")) return;
    
    try {
      setActionLoading(id);
      const res = await fetchWithAuth(`/api/admin/stockpiles/${id}/close`, { method: "POST" });
      if (res.ok) {
        setStockpiles(stockpiles.map(s => s._id === id ? { ...s, status: "closed" } : s));
      }
    } catch (err) {
      console.error("Force close error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight mb-2">Stockpile Registry</h1>
          <p className="text-gray-500 font-medium">Monitoring core operations. Every list, every item, and every deadline tracked here.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-[#F07E48]/10 shadow-sm">
          {(["all", "active", "closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                filterStatus === s 
                  ? "bg-[#F07E48] text-white shadow-lg" 
                  : "text-gray-400 hover:text-[#F07E48] hover:bg-gray-50"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      {/* Stats Summary for Stockpiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-[#F07E48]/10 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Total Active</p>
              <h4 className="text-2xl font-black text-[#1A1A1A]">{stockpiles.filter(s => s.status === "active").length}</h4>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#F07E48]">
              <Clock className="w-6 h-6" />
           </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-[#F07E48]/10 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Completed Today</p>
              <h4 className="text-2xl font-black text-[#1A1A1A]">{stockpiles.filter(s => s.status === "closed" && new Date(s.createdAt).toDateString() === new Date().toDateString()).length}</h4>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
           </div>
        </div>
        <div className="bg-[#1A1A1A] p-6 rounded-[32px] flex items-center justify-between text-white">
           <div>
              <p className="text-[10px] font-black uppercase text-white/40 tracking-wider mb-1">Platform Volume</p>
              <h4 className="text-2xl font-black text-white">₦{stockpiles.reduce((acc, s) => acc + s.totalAmount, 0).toLocaleString()}</h4>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
              <Package className="w-6 h-6" />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-[#F07E48]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#F07E48]/5 bg-gray-50/30">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Customer</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Vendor</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Financials</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Deadline</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F07E48]/5">
              <AnimatePresence mode="popLayout">
                {stockpiles.map((s) => (
                  <motion.tr 
                    key={s._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-[#FDF8F3]/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#1A1A1A]">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#1A1A1A]">{s.customerName}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{s.customerPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-[#F07E48]" />
                        <span className="text-sm font-bold text-[#1A1A1A]">{s.vendorId?.businessName}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-0.5">
                          <p className="text-sm font-black text-[#1A1A1A]">₦{s.totalAmount.toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{s.items.length} unique items</p>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className={cn(
                         "flex items-center gap-2 text-xs font-bold",
                         s.status === "active" 
                          ? (new Date(s.endDate) < new Date() ? "text-rose-500" : "text-amber-600")
                          : "text-emerald-600"
                       )}>
                          <Calendar className="w-4 h-4 opacity-60" />
                          <span>{format(new Date(s.endDate), "d MMM yyyy")}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-[#F07E48]/10 hover:text-[#F07E48]">
                             <Eye className="w-5 h-5" />
                          </Button>
                          {s.status === "active" && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => forceClose(s._id)}
                              disabled={actionLoading === s._id}
                              className="rounded-xl hover:bg-rose-50 hover:text-rose-500"
                            >
                              {actionLoading === s._id ? <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent animate-spin rounded-full" /> : <XCircle className="w-5 h-5" />}
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="rounded-xl">
                             <MoreHorizontal className="w-5 h-5 text-gray-400" />
                          </Button>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {stockpiles.length === 0 && !loading && (
             <div className="p-32 text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 border-2 border-dashed border-[#F07E48]/20">
                  <Package className="w-10 h-10 text-gray-300" />
                </div>
                <h4 className="text-2xl font-black text-[#1A1A1A] mb-3">No stockpiles here</h4>
                <p className="text-gray-500 font-medium max-w-sm mx-auto">Either no one is buying anything, or your filters are too strict. Adjust them to explore the ecosystem.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStockpiles;
