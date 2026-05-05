import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutGrid, 
  ShoppingBag, 
  Users, 
  Settings as SettingsIcon, 
  Bell, 
  ChevronDown, 
  Menu, 
  X, 
  LogOut,
  Search,
  ShieldCheck,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useNotifications } from "../contexts/NotificationContext";
import { Logo } from "../pages/Landing";
import { NotificationDrawer } from "./NotificationDrawer";
import { useToast } from "../contexts/ToastContext";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const { showToast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { icon: LayoutGrid, label: "Dashboard", path: "/dashboard" },
    { icon: ShoppingBag, label: "Stockpile", path: "/stockpile" },
    { icon: Users, label: "Customers", path: "/customers" },
    { icon: SettingsIcon, label: "Settings", path: "/settings" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="bg-white dark:bg-[#0F172A] border-b border-orange-50 dark:border-slate-800 px-4 md:px-8 h-20 flex items-center sticky top-0 z-50 transition-colors">
        {/* Mobile: Hamburger */}
        <div className="flex-1 flex items-center lg:hidden">
          <Button variant="ghost" size="icon" className="w-10 h-10 dark:text-white" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {/* Logo */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <Logo className="lg:static scale-90 md:scale-100" />
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button 
                variant="ghost" 
                className={`px-6 py-6 rounded-2xl flex items-center gap-2 transition-all ${
                  isActive(item.path) 
                    ? "bg-[#FFF5ED] dark:bg-orange-950/30 text-cartlist-orange font-bold" 
                    : "text-gray-400 dark:text-slate-400 font-medium hover:text-cartlist-orange dark:hover:text-cartlist-orange"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive(item.path) ? "fill-cartlist-orange" : ""}`} />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
          {/* Dark Mode Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-orange-50/50 dark:bg-slate-800/50 text-gray-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-slate-800 transition-all"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 md:gap-3 p-1 lg:pl-2 lg:pr-4 h-12 md:h-14 rounded-full hover:bg-orange-50 dark:hover:bg-slate-800 transition-all focus-visible:ring-0 focus-visible:ring-offset-0 relative"
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-slate-700">
                    <img src={user?.profilePicture || "https://raw.githubusercontent.com/DannyYo696/svillage/29b4c24e6ca88b3ecf3856f30fceb3f29eef40bf/profile%20picture.webp"} alt="Avatar" />
                  </div>
                  {/* Notification Badge on Profile Pic */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-[#E13D3D] text-white text-[8px] md:text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 z-10">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-bold leading-none mb-1 dark:text-white">{user?.ownerName || "User"}</p>
                  <p className="text-[10px] text-muted-foreground dark:text-slate-400">{user?.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden lg:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 border-orange-100 dark:border-slate-800 shadow-xl bg-white dark:bg-[#1E293B] z-[200]">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-bold px-3 py-2 text-gray-900 dark:text-white">My Account</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-orange-50 dark:bg-slate-800 my-1" />
              
              {/* Notifications Item (especially for mobile) */}
              <DropdownMenuItem 
                onClick={() => setIsNotificationDrawerOpen(true)}
                className="rounded-xl px-3 py-2.5 cursor-pointer flex items-center justify-between gap-3 text-gray-600 dark:text-slate-300 focus:bg-orange-50 dark:focus:bg-slate-800 focus:text-cartlist-orange dark:focus:text-cartlist-orange outline-none"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4" />
                  <span className="font-medium">Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => navigate("/settings")}
                className="rounded-xl px-3 py-2.5 cursor-pointer flex items-center gap-3 text-gray-600 dark:text-slate-300 focus:bg-orange-50 dark:focus:bg-slate-800 focus:text-cartlist-orange dark:focus:text-cartlist-orange outline-none"
              >
                <SettingsIcon className="w-4 h-4" />
                <span className="font-medium">Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-orange-50 dark:bg-slate-800 my-1" />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="rounded-xl px-3 py-2.5 cursor-pointer flex items-center gap-3 text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 outline-none"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-[#0F172A] z-[101] lg:hidden p-6 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <Logo />
                <Button variant="ghost" size="icon" className="dark:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start gap-3 h-12 rounded-xl transition-all ${
                        isActive(item.path) 
                          ? "bg-orange-50 dark:bg-orange-950/20 text-cartlist-orange font-bold" 
                          : "text-gray-500 dark:text-slate-400 font-medium hover:text-cartlist-orange dark:hover:text-cartlist-orange"
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive(item.path) ? "fill-cartlist-orange" : ""}`} />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
              <div className="mt-auto pt-6 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-4">
                <Button 
                  variant="ghost" 
                  onClick={toggleTheme}
                  className="w-full justify-start gap-3 h-12 rounded-xl text-gray-600 dark:text-slate-300 font-medium transition-all"
                >
                  {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="w-full justify-start gap-3 h-12 rounded-xl text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notification Drawer */}
      <NotificationDrawer 
        isOpen={isNotificationDrawerOpen} 
        onClose={() => setIsNotificationDrawerOpen(false)} 
      />
    </>
  );
};
