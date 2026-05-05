import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Search, Phone, Mail, User as UserIcon, Calendar, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../../lib/utils";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  vendorId: {
    businessName: string;
  };
  createdAt: string;
}

const AdminCustomers: React.FC = () => {
  const { fetchWithAuth } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetchWithAuth("/api/admin/customers");
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        }
      } catch (err) {
        console.error("Fetch customers error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) ||
    c.vendorId?.businessName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">Global Customers</h1>
          <p className="text-slate-500 font-medium tracking-tight">Managing every individual customer across the entire platform.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#F07E48] transition-colors" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-72 h-11 bg-white border border-slate-200 rounded-2xl pl-11 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-[#F07E48]/10 focus:border-[#F07E48]/50 transition-all shadow-sm"
          />
        </div>
      </header>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="text-left px-8 py-5 font-black">Customer</th>
                <th className="text-left px-8 py-5 font-black">Contact</th>
                <th className="text-left px-8 py-5 font-black">Attached Vendor</th>
                <th className="text-left px-8 py-5 font-black">Join Date</th>
                <th className="text-right px-8 py-5 font-black">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6">
                      <div className="h-4 bg-slate-100 rounded-full w-full" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                        <Search className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold">No customers found matching your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white font-black text-sm">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#0F172A] leading-tight">{c.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {c._id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Phone className="w-3 h-3 text-[#F07E48]" />
                          {c.phone}
                        </div>
                        {c.email && (
                          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                            <Mail className="w-3 h-3" />
                            {c.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center gap-2 bg-orange-50 text-[#F07E48] px-3 py-1.5 rounded-xl border border-orange-100">
                        <span className="text-[11px] font-black uppercase tracking-tight">{c.vendorId?.businessName || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        {format(new Date(c.createdAt), "MMM dd, yyyy")}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-[#0F172A]">
                         <MessageSquare className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
