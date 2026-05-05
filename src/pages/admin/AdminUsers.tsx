import React, { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Activity, 
  ShieldAlert, 
  ShieldCheck,
  RotateCcw,
  UserX,
  UserCheck,
  ExternalLink
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { formatDistanceToNow } from "date-fns";

interface AdminUser {
  _id: string;
  businessName: string;
  ownerName: string;
  email: string;
  whatsappNumber: string;
  profilePicture: string;
  status: "active" | "suspended";
  role: string;
  lastActiveAt: string;
  createdAt: string;
  stockpileCount: number;
  totalVolume: number;
}

const AdminUsers: React.FC = () => {
  const { fetchWithAuth } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "suspended" | "admins">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "", firstName: "", lastName: "" });

  useEffect(() => {
    fetchUsers();
  }, [filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (filterStatus === "admins") {
        query.append("role", "admin");
      } else if (filterStatus !== "all") {
        query.append("status", filterStatus);
      }
      if (search) query.append("search", search);

      const res = await fetchWithAuth(`/api/admin/users?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth("/api/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdmin)
      });
      if (res.ok) {
        setIsAddAdminOpen(false);
        setNewAdmin({ email: "", password: "", firstName: "", lastName: "" });
        fetchUsers();
      }
    } catch (err) {
      console.error("Create admin error:", err);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      setActionLoading(userId);
      const newStatus = currentStatus === "active" ? "suspended" : "active";
      const res = await fetchWithAuth(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus as any } : u));
      }
    } catch (err) {
      console.error("Toggle status error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight mb-2">Vendors & Partners</h1>
          <p className="text-gray-500 font-medium">Manage all businesses using the platform. Monitor activity, revenue volume, and account integrity.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-[#F07E48]/10 shadow-sm">
          {(["all", "active", "suspended", "admins"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                filterStatus === s 
                  ? "bg-[#1A1A1A] text-white shadow-lg" 
                  : "text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-50"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <Button 
          onClick={() => setIsAddAdminOpen(true)}
          className="rounded-2xl bg-[#F07E48] font-black h-12 px-8 shadow-lg shadow-[#F07E48]/20"
        >
          Provision Admin
        </Button>
      </header>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#F07E48] transition-colors" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by business name, email, or WhatsApp..."
          className="w-full bg-white border-2 border-transparent focus:border-[#F07E48]/20 focus:ring-0 rounded-[28px] py-6 pl-16 pr-8 text-[#1A1A1A] font-medium shadow-sm transition-all duration-300 outline-none"
        />
        <Button 
          type="submit"
          className="absolute right-3 top-3 bottom-3 rounded-2xl bg-[#1A1A1A] hover:bg-neutral-800 font-bold px-8"
        >
          Explore
        </Button>
      </form>

      {/* Users Table */}
      <div className="bg-white rounded-[40px] border border-[#F07E48]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#F07E48]/5">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Business / Vendor</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Activity Level</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Financials</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F07E48]/5">
              <AnimatePresence mode="popLayout">
                {users.map((user) => (
                  <motion.tr 
                    key={user._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-[#FDF8F3]/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl border-2 border-[#F07E48]/10 overflow-hidden relative shadow-sm">
                          <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-[#1A1A1A] leading-tight truncate max-w-[200px]">
                            {user.businessName || "No Business Name"}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-1.5 mt-1">
                            {user.ownerName}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                             <a href={`mailto:${user.email}`} className="text-gray-400 hover:text-blue-500 transition-colors"><Mail className="w-3.5 h-3.5" /></a>
                             <a href={`https://wa.me/${user.whatsappNumber}`} className="text-gray-400 hover:text-green-500 transition-colors"><Phone className="w-3.5 h-3.5" /></a>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <p className="text-sm font-black text-[#1A1A1A]">{user.stockpileCount} Stockpiles</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight text-gray-400">
                          <Activity className="w-3 h-3" />
                          <span>Active {formatDistanceToNow(new Date(user.lastActiveAt))} ago</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex flex-col">
                        <p className="text-sm font-black text-emerald-600">₦{user.totalVolume.toLocaleString()}</p>
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600/50">Processed</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        user.status === "active" ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {user.status === "active" ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        {user.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => toggleUserStatus(user._id, user.status)}
                           disabled={actionLoading === user._id}
                           className={cn(
                             "rounded-xl font-bold h-9",
                             user.status === "active" ? "hover:bg-rose-50 hover:text-rose-600 border-rose-100" : "hover:bg-green-50 hover:text-green-600 border-green-100"
                           )}
                         >
                           {actionLoading === user._id ? (
                             <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                           ) : (
                             user.status === "active" ? "Suspend" : "Activate"
                           )}
                         </Button>
                         <Button variant="ghost" size="icon" className="rounded-xl">
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                         </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {users.length === 0 && !loading && (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h4 className="text-xl font-black text-[#1A1A1A] mb-2">No vendors found</h4>
              <p className="text-gray-500 font-medium">Try adjusting your search or filters to see more results.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAddAdminOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddAdminOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl relative z-10"
            >
              <h3 className="text-2xl font-black text-[#1A1A1A] mb-2">Provision Admin</h3>
              <p className="text-gray-500 font-medium mb-8">Create a new administrative account with restricted core access.</p>
              
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">First Name</label>
                    <input 
                      type="text" 
                      value={newAdmin.firstName}
                      onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                      className="w-full h-12 bg-gray-50 border-0 rounded-xl px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-[#F07E48]/20" 
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Last Name</label>
                    <input 
                      type="text" 
                      value={newAdmin.lastName}
                      onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                      className="w-full h-12 bg-gray-50 border-0 rounded-xl px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-[#F07E48]/20" 
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Secure Email</label>
                  <input 
                    type="email" 
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    className="w-full h-12 bg-gray-50 border-0 rounded-xl px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-[#F07E48]/20" 
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Initial Password</label>
                  <input 
                    type="password" 
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    className="w-full h-12 bg-gray-50 border-0 rounded-xl px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-[#F07E48]/20" 
                    required
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsAddAdminOpen(false)} className="flex-1 rounded-xl h-12 font-bold">Cancel</Button>
                  <Button type="submit" className="flex-1 rounded-xl h-12 bg-[#1A1A1A] text-white font-black">Create Identity</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
