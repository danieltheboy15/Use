import React, { useState } from "react";
import { 
  Wallet, 
  CreditCard, 
  Users, 
  ArrowUpRight, 
  TrendingUp,
  Download,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Zap,
  Star,
  Rocket,
  Shield
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

const AdminSubscriptions: React.FC = () => {
  const [filter, setFilter] = useState("all");

  const plans = [
    { name: "Free", price: "₦0", vendors: 420, icon: Zap, color: "slate" },
    { name: "Starter", price: "₦2,500", vendors: 156, icon: Star, color: "blue" },
    { name: "Growth", price: "₦6,500", vendors: 84, icon: TrendingUp, color: "orange" },
    { name: "Pro", price: "₦15,000", vendors: 32, icon: Rocket, color: "indigo" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2 uppercase italic">Subscription Management</h1>
          <p className="text-slate-500 font-medium">Configure plan limits, track MRR, and manage vendor billing cycles.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {["All", "Active", "Past Due", "Cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s.toLowerCase())}
              className={cn(
                "px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                filter === s.toLowerCase() 
                  ? "bg-[#0F172A] text-white shadow-lg" 
                  : "text-slate-400 hover:text-[#0F172A] hover:bg-slate-50"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      {/* Financial Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0F172A] p-8 rounded-[40px] text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110">
            <Wallet className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Monthly Recurring Revenue</p>
            <h2 className="text-4xl font-black mb-4 tracking-tighter">₦1,240,500</h2>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black">
              <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center">
                <ArrowUpRight className="w-3 h-3" />
              </div>
              +14.2% from last month
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Active Subscribers</p>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter">272</h2>
              <p className="text-xs font-bold text-slate-400 mt-2">Paid accounts across 3 tiers</p>
            </div>
            <div className="w-16 h-16 rounded-[24px] bg-blue-50 flex items-center justify-center text-blue-500">
               <Users className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Conversion Rate</p>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter">39.4%</h2>
              <p className="text-xs font-bold text-slate-400 mt-2">Free to Paid transition</p>
            </div>
            <div className="w-16 h-16 rounded-[24px] bg-orange-50 flex items-center justify-center text-orange-500">
               <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Plan Configuration Table */}
      <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-tighter italic">Plan Configuration (Admin)</h3>
          <Button variant="outline" className="rounded-xl font-bold h-10 px-4">Edit All Plans</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-50">
          {plans.map((plan) => (
            <div key={plan.name} className="p-8 hover:bg-slate-50/50 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <div className={cn("w-12 h-12 rounded-[22px] flex items-center justify-center", 
                  plan.color === "slate" ? "bg-slate-100 text-slate-600" :
                  plan.color === "blue" ? "bg-blue-100 text-blue-600" :
                  plan.color === "orange" ? "bg-orange-100 text-orange-600" : "bg-indigo-100 text-indigo-600"
                )}>
                  <plan.icon className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black text-[#0F172A] group-hover:scale-110 transition-transform">{plan.vendors}</span>
              </div>
              <h4 className="text-xl font-black text-[#0F172A] mb-1">{plan.name}</h4>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">{plan.price}/month</p>
              
              <div className="space-y-3 mb-8">
                {[
                  { label: "Active Customers", val: plan.name === "Free" ? "10" : plan.name === "Starter" ? "50" : plan.name === "Growth" ? "200" : "Unlimited" },
                  { label: "Notification Quota", val: plan.name === "Free" ? "50" : plan.name === "Starter" ? "500" : plan.name === "Growth" ? "2,000" : "Unlimited" },
                  { label: "Team Members", val: plan.name === "Pro" ? "5" : "1" },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{feature.label}</span>
                    <span className="text-[11px] font-black text-slate-900">{feature.val}</span>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full rounded-xl font-bold h-11 hover:bg-[#0F172A] hover:text-white border-slate-200">Adjust Limits</Button>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Subscriptions */}
      <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-tighter italic">Recent Subscriptions</h3>
          <Button variant="ghost" className="text-xs font-black text-[#F07E48] hover:bg-orange-50 rounded-xl px-4">View All Transactions</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Vendor</th>
                <th className="px-8 py-6">Plan</th>
                <th className="px-8 py-6">Cycle</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6">Next Billing</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: "Adaeze Foods", plan: "Growth", cycle: "Monthly", amt: "₦6,500", date: "24 May 2026", status: "Active" },
                { name: "Luxe Fashion", plan: "Starter", cycle: "Annual", amt: "₦27,000", date: "12 Dec 2026", status: "Active" },
                { name: "Bakery Hub", plan: "Free", cycle: "N/A", amt: "₦0", date: "N/A", status: "Active" },
                { name: "Glow Skin", plan: "Pro", cycle: "Monthly", amt: "₦15,000", date: "05 Jun 2026", status: "Past Due" },
                { name: "Home Mart", plan: "Growth", cycle: "Monthly", amt: "₦6,500", date: "18 May 2026", status: "Active" },
              ].map((sub, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-[#0F172A]">{sub.name}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-widest italic border",
                      sub.plan === "Pro" ? "bg-indigo-50 text-indigo-700 border-indigo-100" : 
                      sub.plan === "Growth" ? "bg-orange-50 text-orange-700 border-orange-100" :
                      sub.plan === "Starter" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-slate-50 text-slate-500 border-slate-100"
                    )}>{sub.plan}</span>
                  </td>
                  <td className="px-8 py-6 text-xs font-medium text-slate-500">{sub.cycle}</td>
                  <td className="px-8 py-6 text-xs font-black text-slate-900">{sub.amt}</td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-400">{sub.date}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", sub.status === "Active" ? "bg-emerald-500" : "bg-rose-500")} />
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", sub.status === "Active" ? "text-emerald-500" : "text-rose-500")}>{sub.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button variant="ghost" size="icon" className="rounded-xl"><MoreVertical className="w-5 h-5 text-slate-300 group-hover:text-slate-900" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminSubscriptions;
