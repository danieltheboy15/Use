import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, MessageSquare, Package, Settings, LogOut, ChevronRight, Menu, X, ShieldCheck, ClipboardList, BarChart3, Wallet, Lock, Activity, CheckCircle2, ShoppingCart } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/admin/login");
    }
  }, [user, navigate]);

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Vendor Management", path: "/admin/users", icon: Users },
    { name: "Customer CRM", path: "/admin/customers", icon: Users },
    { name: "Stockpile Ops", path: "/admin/stockpiles", icon: Package },
    { name: "Notification Monitor", path: "/admin/whatsapp", icon: MessageSquare },
    { name: "Subscriptions", path: "/admin/subscriptions", icon: Wallet },
    { name: "Platform Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Content & Config", path: "/admin/settings", icon: Settings },
    { name: "Audit Trail", path: "/admin/audit", icon: ShieldCheck },
  ];

  const systemHealth = [
    { name: "WhatsApp API", status: "ok" },
    { name: "Webhook", status: "ok" },
    { name: "Database", status: "ok" },
    { name: "Queue Worker", status: "ok" },
    { name: "SMS Service", status: "ok" },
  ];

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#0F172A] h-screen sticky top-0 overflow-y-auto shrink-0">
        <div className="p-8 flex items-center">
          <img 
            src="https://raw.githubusercontent.com/DannyYo696/svillage/cfdfd8520f96d8d336b2d00597bb7e5bde1cde14/cl%20logo.png" 
            alt="Cartlist" 
            className="h-10 w-auto"
            referrerPolicy="no-referrer"
          />
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                  isActive 
                    ? "bg-[#F07E48] text-white shadow-lg shadow-[#F07E48]/20" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
                <span className="font-bold text-sm tracking-tight">{item.name}</span>
                {isActive && (
                  <motion.div layoutId="sidebarActive" className="ml-auto w-1.5 h-1.5 rounded-full bg-white/40" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* System Health Section */}
        <div className="px-6 py-6 border-t border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Health</h4>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-500">Active</span>
            </div>
          </div>
          <div className="space-y-2.5">
            {systemHealth.map((item) => (
              <div key={item.name} className="flex items-center justify-between group">
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200 transition-colors">{item.name}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500/60" />
              </div>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 p-b-8">
          <div className="bg-white/5 rounded-[24px] p-4 flex items-center gap-3 border border-white/5">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
              <img src={user.profilePicture || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white truncate leading-none mb-0.5">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Super Admin</p>
            </div>
            <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-rose-400">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-h-screen overflow-y-auto relative bg-[#F8FAFC]">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-[#0F172A] px-6 flex items-center justify-between sticky top-0 z-40">
           <div className="flex items-center">
            <img 
              src="https://raw.githubusercontent.com/DannyYo696/svillage/cfdfd8520f96d8d336b2d00597bb7e5bde1cde14/cl%20logo.png" 
              alt="Cartlist" 
              className="h-8 w-auto"
              referrerPolicy="no-referrer"
            />
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-[#0F172A]/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] shadow-2xl flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <img 
                  src="https://raw.githubusercontent.com/DannyYo696/svillage/cfdfd8520f96d8d336b2d00597bb7e5bde1cde14/cl%20logo.png" 
                  alt="Cartlist" 
                  className="h-8 w-auto"
                  referrerPolicy="no-referrer"
                />
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-4 rounded-xl transition-all font-bold text-sm",
                        isActive ? "bg-[#F07E48] text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-white/5">
                <button 
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-sm text-rose-500 hover:bg-white/5 transition-all w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

        <div className="p-6 md:p-10 lg:p-12 min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
