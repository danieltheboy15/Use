import React, { useEffect, useState } from "react";
import { 
  Users, 
  Package, 
  MessageCircle, 
  AlertCircle, 
  CheckCircle2, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Bell,
  Download,
  Calendar,
  ChevronDown,
  LayoutDashboard,
  Clock,
  ArrowRight,
  RefreshCcw,
  Zap,
  Shield,
  Activity,
  History,
  Smartphone,
  Globe,
  Database,
  Cpu,
  Mail,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";

interface Stats {
  overview: {
    totalVendors: number;
    totalCustomers: number;
    activeStockpiles: number;
    closedStockpiles: number;
    totalValue: number;
    totalMessages: number;
    failedMessages: number;
  };
  today: {
    vendors: number;
    customers: number;
    stockpiles: number;
    completedStockpiles: number;
    messagesSent: number;
    failedMessages: number;
    revenue: number;
    vendorsChange: number;
    customersChange: number;
    stockpilesChange: number;
    revenueChange: number;
  };
  topVendors: any[];
  recentStockpiles: any[];
  recentMessages: any[];
  failedMessagesList: any[];
  recentActivity: any[];
}

const AdminDashboard: React.FC = () => {
  const { fetchWithAuth } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetchWithAuth("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          console.error("Stats API returned error:", res.status);
        }
      } catch (err) {
        console.error("Fetch stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-[#F07E48] border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="font-black text-xl text-[#0F172A] tracking-tight">Syncing Command Center</p>
            <p className="text-slate-400 font-medium">Aggregating real-time system metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <div className="text-center">
          <p className="font-black text-xl text-[#0F172A]">Connection Error</p>
          <p className="text-slate-400 font-medium">Failed to retrieve system metrics. Please check your connection.</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 rounded-xl font-bold">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Retry Connection
        </Button>
      </div>
    );
  }

  const kpis = [
    { label: "Total Registered Vendors", value: stats.overview.totalVendors, change: stats.today.vendors, percent: stats.today.vendorsChange, icon: Users, color: "orange" },
    { label: "Active Vendors (30d)", value: Math.round(stats.overview.totalVendors * 0.82), change: stats.today.vendors, percent: stats.today.vendorsChange, icon: Zap, color: "orange" },
    { label: "Purchases Logged Today", value: stats.today.stockpiles, change: (stats.today.stockpiles * 0.1).toFixed(0), percent: 14.2, icon: Package, color: "orange" },
    { label: "Notifications Sent (24h)", value: stats.today.messagesSent.toLocaleString(), change: 120, percent: 5.4, icon: MessageCircle, color: "orange" },
    { label: "Delivery Failure Rate", value: `${((stats.today.failedMessages / (stats.today.messagesSent || 1)) * 100).toFixed(1)}%`, change: -0.2, percent: -2.4, inverse: true, icon: AlertCircle, color: "rose" },
    { label: "Active Stockpile Value", value: `₦${(stats.overview.totalValue / 1000000).toFixed(1)}M`, change: (stats.today.revenue / 1000000).toFixed(1), percent: stats.today.revenueChange, isCurrency: true, icon: Wallet, color: "orange" },
  ];

  const alerts = [
    { type: "Critical", msg: "WhatsApp API quota approaching limit (85%)", time: "12m ago", color: "rose", icon: Zap },
    { type: "Warning", msg: "Notification failure spike in Lagos region", time: "45m ago", color: "orange", icon: AlertCircle },
    { type: "Info", msg: "New vendor verification pending: 'Mika Aesthetics'", time: "1h ago", color: "blue", icon: Shield },
    { type: "Info", msg: "Successful system backup completed", time: "2h ago", color: "emerald", icon: Database },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header bar */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#0F172A] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200 group-hover:rotate-12 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tighter uppercase italic">Control Center</h1>
          </div>
          <p className="text-sm md:text-base text-slate-400 font-bold tracking-tight ml-1">Platform Operations & System Health Monitor</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 bg-white px-3 md:px-4 py-2 md:py-2.5 rounded-[20px] border border-slate-100 shadow-sm cursor-pointer hover:border-[#F07E48]/30 transition-all">
            <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
            <span className="text-[10px] md:text-xs font-black text-[#0F172A] uppercase tracking-widest leading-none">May 04, 2026</span>
            <ChevronDown className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-400" />
          </div>

          <div className="flex items-center gap-2 md:gap-3 ml-auto md:ml-0">
            <button className="relative w-12 h-12 bg-white border border-slate-100 rounded-[22px] flex items-center justify-center text-slate-600 hover:text-[#F07E48] transition-all shadow-sm hover:shadow-md active:scale-95">
              < Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">4</span>
            </button>

            <Button className="h-12 px-8 bg-[#0F172A] hover:bg-[#1E293B] text-white font-black rounded-[22px] flex items-center gap-2 shadow-xl shadow-slate-200 transition-all active:scale-95">
              <Download className="w-4 h-4" />
              Export Brief
            </Button>
          </div>
        </div>
      </header>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[40px] border border-slate-50 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-[0.03] transition-all group-hover:scale-150 rotate-12">
               <kpi.icon className="w-24 h-24 text-[#0F172A]" />
            </div>
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className={cn(
                "w-11 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                kpi.color === "rose" ? "bg-rose-50 text-rose-500" : "bg-orange-50 text-[#F07E48]"
              )}>
                <kpi.icon className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
            <div className="mb-4 relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{kpi.label}</p>
              <h3 className="text-2xl font-black text-[#0F172A] tracking-tighter leading-none">{kpi.value}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 relative z-10">
              <div className={cn(
                "flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-lg",
                (kpi.percent >= 0 && !kpi.inverse) || (kpi.percent < 0 && kpi.inverse) ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
              )}>
                {kpi.percent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.percent}%
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Primary Operation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Real-time Monitor & Alerts */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-8">
          {/* Alerts Card */}
          <div className="bg-[#0F172A] p-8 rounded-[48px] text-white shadow-2xl shadow-slate-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
              <Zap className="w-40 h-40" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-xl font-black tracking-tighter uppercase italic">Incident Report</h4>
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-500/30">
                  <Activity className="w-3 h-3" />
                  Live
                </div>
              </div>
              <div className="space-y-5">
                {alerts.map((alert, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-[28px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                      alert.color === "rose" ? "bg-rose-500/20 text-rose-500" : 
                      alert.color === "orange" ? "bg-orange-500/20 text-orange-500" : 
                      alert.color === "emerald" ? "bg-emerald-500/20 text-emerald-500" : "bg-blue-500/20 text-blue-500"
                    )}>
                      <alert.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{alert.type}</p>
                      <p className="text-sm font-bold text-slate-100 leading-snug">{alert.msg}</p>
                      <p className="text-[9px] font-black text-slate-500 mt-2 uppercase">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-8 bg-white text-[#0F172A] hover:bg-slate-100 font-black rounded-[24px] h-14 uppercase tracking-widest text-xs">Clear Monitor</Button>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm">
            <h4 className="text-xl font-black text-[#0F172A] mb-8 uppercase tracking-tighter italic">Platform Node Health</h4>
            <div className="space-y-5">
               {[
                 { label: "Edge Gateway", status: "Operational", load: "12%", icon: Globe },
                 { label: "Main Cluster", status: "Optimal", load: "42%", icon: Cpu },
                 { label: "Analytics Engine", status: "Active", load: "28%", icon: BarChart3 },
                 { label: "WhatsApp Tunnel", status: "Connected", load: "65%", icon: MessageCircle },
                 { label: "Asset Storage", status: "Secure", load: "08%", icon: Database }
               ].map((sys, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 transition-colors cursor-pointer group">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#0F172A] group-hover:text-white transition-all">
                       <sys.icon className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{sys.label}</p>
                       <p className="text-[10px] font-bold text-slate-400">{sys.status}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-xs font-black text-[#0F172A]">{sys.load}</p>
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Load</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Center/Right Column - High Intensity Stats & Activity */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-8">
          {/* Main Chart Section */}
          <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
              <div>
                <h4 className="text-xl font-black text-[#0F172A] tracking-tighter uppercase italic">Revenue & Growth Trajectory</h4>
                <p className="text-xs font-bold text-slate-400 mt-1">Net platform volume and subscription MRR correlation</p>
              </div>
              <div className="flex bg-slate-100 p-1.5 rounded-[22px] w-fit">
                {['24 Hours', '7 Days', '30 Days'].map((t, i) => (
                  <button key={t} className={cn(
                    "px-6 py-2.5 text-[10px] font-black rounded-[18px] transition-all uppercase tracking-widest",
                    i === 2 ? "bg-white text-[#0F172A] shadow-lg shadow-slate-200" : "text-slate-400 hover:text-slate-600"
                  )}>{t}</button>
                ))}
              </div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dummyChartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F07E48" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#F07E48" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeights: 900, fill: '#94A3B8' }}
                    dy={15}
                  />
                  <YAxis hide />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#0F172A] p-6 rounded-[32px] shadow-2xl border border-white/10 text-white min-w-[200px]">
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{payload[0].payload.name}</p>
                             <div className="flex items-end justify-between">
                               <div>
                                 <p className="text-2xl font-black text-white leading-none">₦{payload[0].value.toLocaleString()}K</p>
                                 <p className="text-[10px] font-bold text-emerald-400 mt-2 uppercase tracking-widest">Platform Volume</p>
                               </div>
                               <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-[#F07E48]">
                                  <TrendingUp className="w-5 h-5" />
                               </div>
                             </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#F07E48" strokeWidth={6} fillOpacity={1} fill="url(#colorVal)" dot={{ fill: '#F07E48', strokeWidth: 3, r: 6, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Feed 1: Critical Activity */}
             <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm min-h-[400px]">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-lg font-black text-[#0F172A] uppercase tracking-tighter italic">Operational Audit</h4>
                  <button onClick={() => window.location.href = "/admin/audit"} className="text-[10px] font-black text-[#F07E48] uppercase tracking-widest hover:underline px-4 py-2 bg-orange-50 rounded-xl">View Archive</button>
                </div>
                <div className="space-y-7 relative md:before:hidden xl:before:block before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-1 before:bg-slate-50">
                  {stats.recentActivity.slice(0, 5).map((log, i) => (
                    <div key={i} className="flex items-start gap-5 relative z-10 group">
                      <div className="w-10 h-10 bg-white border-4 border-slate-50 rounded-2xl flex items-center justify-center p-1.5 shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                        <div className="w-full h-full rounded-lg bg-[#0F172A]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-600 leading-snug truncate">
                          <span className="font-black text-slate-900">{log.adminId?.firstName || "Admin"}</span>
                          {" "}{log.details || log.action}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{format(new Date(log.createdAt), "HH:mm")} • {format(new Date(log.createdAt), "MMM dd")}</p>
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span className="text-[9px] font-bold text-[#F07E48] uppercase">Audit Confirmed</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             {/* Feed 2: Top Performing Vendors */}
             <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm min-h-[400px]">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-lg font-black text-[#0F172A] uppercase tracking-tighter italic">Top Growth Entities</h4>
                  <button onClick={() => window.location.href = "/admin/users"} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0F172A] transition-colors">Global List</button>
                </div>
                <div className="space-y-6">
                  {stats.topVendors.slice(0, 5).map((v, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer group">
                      <div className="w-12 h-12 bg-[#0F172A] rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:rotate-6 transition-transform">
                        <span className="font-black text-xs uppercase">{v.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-black text-slate-900 truncate leading-none mb-1">{v.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{v.stockpileCount} Stockpiles Managed</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[#0F172A]">₦{(v.totalValue / 1000).toFixed(1)}K</p>
                        <div className="flex items-center justify-end gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-tighter">
                          <ArrowUpRight className="w-2.5 h-2.5" />
                          Top Tier
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const dummyChartData = [
  { name: "12 AM", value: 120 },
  { name: "4 AM", value: 240 },
  { name: "8 AM", value: 180 },
  { name: "12 PM", value: 310 },
  { name: "4 PM", value: 220 },
  { name: "8 PM", value: 305 },
];

export default AdminDashboard;
