import React from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  MessageSquare, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

const AdminAnalytics: React.FC = () => {
  const growthData = [
    { name: "Mon", vendors: 12, stockpiles: 140 },
    { name: "Tue", vendors: 19, stockpiles: 180 },
    { name: "Wed", vendors: 15, stockpiles: 160 },
    { name: "Thu", vendors: 22, stockpiles: 210 },
    { name: "Fri", vendors: 30, stockpiles: 280 },
    { name: "Sat", vendors: 25, stockpiles: 240 },
    { name: "Sun", vendors: 32, stockpiles: 290 },
  ];

  const categoryData = [
    { name: "Food", value: 45, color: "#F07E48" },
    { name: "Fashion", value: 30, color: "#FB923C" },
    { name: "Beauty", value: 15, color: "#FDBA74" },
    { name: "Household", value: 10, color: "#FED7AA" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2 uppercase italic">Platform Analytics</h1>
          <p className="text-slate-500 font-medium">Deep insights into vendor growth, usage patterns, and system performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11 px-6 font-bold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </Button>
          <Button className="rounded-xl h-11 px-6 bg-[#0F172A] text-white font-black flex items-center gap-2 shadow-lg active:scale-95 transition-all">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </header>

      {/* Analytics Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: "Growth Rate", val: "+24.8%", sub: "vs previous month", icon: TrendingUp, color: "emerald" },
          { label: "Avg Items / Log", val: "6.4", sub: "Platform average", icon: Package, color: "orange" },
          { label: "WA Open Rate", val: "92.1%", sub: "View link CTR", icon: MessageSquare, color: "blue" },
          { label: "ARPU", val: "₦14,200", sub: "Average revenue per user", icon: DollarSign, color: "emerald" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", 
                stat.color === "orange" ? "bg-orange-50 text-orange-500" : 
                stat.color === "emerald" ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"
              )}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500">
                <ArrowUpRight className="w-3 h-3" />
                12%
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-[#0F172A]">{stat.val}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Growth Chart */}
        <div className="lg:col-span-12 xl:col-span-8 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-tighter italic">Vendor Adoption vs Activity</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F07E48]" />
                <span className="text-[10px] font-black text-slate-400 uppercase">New Vendors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0F172A]" />
                <span className="text-[10px] font-black text-slate-400 uppercase">Stockpiles Logged</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorVendors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F07E48" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#F07E48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    border: 'none', 
                    borderRadius: '16px', 
                    padding: '12px',
                    color: '#fff' 
                  }}
                  itemStyle={{ color: '#F07E48', fontSize: '12px', fontWeight: '900' }}
                />
                <Area type="monotone" dataKey="vendors" stroke="#F07E48" strokeWidth={4} fillOpacity={1} fill="url(#colorVendors)" dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#F07E48' }} />
                <Area type="monotone" dataKey="stockpiles" stroke="#0F172A" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie */}
        <div className="lg:col-span-12 xl:col-span-4 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-[#0F172A] mb-8 uppercase tracking-tighter italic">Vendor Verticals</h3>
          <div className="h-[200px] relative mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#0F172A]">820</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Vendors</span>
            </div>
          </div>
          <div className="space-y-4 mt-auto">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">{cat.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
