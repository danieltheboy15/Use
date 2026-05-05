import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";

const NavLink: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => {
  const isExternal = to.startsWith("#") || to.startsWith("http");
  const Component = isExternal ? "a" : Link;
  const props = isExternal ? { href: to } : { to };

  return (
    <Component 
      {...props as any}
      onClick={onClick}
      className="text-[13px] font-normal text-gray-700 hover:text-black transition-colors font-sans"
    >
      {children}
    </Component>
  );
};

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "About", to: "/#about" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[110] transition-all duration-300 ${isMenuOpen ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : 'opacity-100'} ${isScrolled ? 'md:bg-white bg-white/80 backdrop-blur-lg shadow-sm' : 'bg-transparent backdrop-blur-md'} border-b border-black/5`}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Mobile Logo */}
          <div className="md:hidden flex-1">
            <Logo className="scale-110 origin-left" />
          </div>

          {/* Desktop: Grouped and Centered */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-12 lg:gap-20">
            <div className="flex items-center gap-8 lg:gap-12">
              {navLinks.map((link) => (
                <NavLink key={link.label} to={link.to}>{link.label}</NavLink>
              ))}
            </div>
            
            <Logo />
            
            <div className="flex items-center gap-6 lg:gap-12">
              <Link to="/login" className="text-[13px] font-normal text-cartlist-orange hover:text-orange-600 transition-colors font-sans">
                Login
              </Link>
              <Link to="/register">
                <Button className="h-[34px] px-5 rounded-full bg-[#F07E48] hover:bg-orange-600 text-white font-normal text-[13px] shadow-sm transition-transform active:scale-95 border-0 font-sans">
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Mobile Menu Trigger */}
          <div className="flex items-center justify-end md:flex-1 md:hidden">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="group p-2 relative w-10 h-10 flex flex-col justify-center items-center rounded-full hover:bg-black/[0.03] transition-all active:scale-90"
            >
              <div className="flex flex-col gap-1.5 items-end">
                <motion.span 
                  animate={isMenuOpen ? { rotate: 45, y: 6, width: "1.5rem" } : { rotate: 0, y: 0, width: "1.5rem" }}
                  className="h-0.5 bg-gray-900 rounded-full origin-center"
                />
                <motion.span 
                  animate={isMenuOpen ? { opacity: 0, x: 10 } : { opacity: 1, x: 0 }}
                  className="w-4 h-0.5 bg-gray-900 rounded-full"
                />
                <motion.span 
                  animate={isMenuOpen ? { rotate: -45, y: -6, width: "1.5rem" } : { rotate: 0, y: 0, width: "1.25rem" }}
                  className="h-0.5 bg-gray-900 rounded-full origin-center"
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/10 backdrop-blur-md md:hidden"
            />
            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] z-[70] bg-white md:hidden flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.1)]"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-center mb-16">
                  <Logo />
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2.5 text-gray-900 bg-gray-100/50 hover:bg-gray-100 rounded-full transition-all active:scale-90"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex flex-col gap-8">
                  {[
                    ...navLinks, 
                    { label: "Login", to: "/login" }, 
                    { label: "Sign up", to: "/register" }
                  ].map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                    >
                      <Link 
                        to={link.to}
                        onClick={() => setIsMenuOpen(false)}
                        className={`text-[40px] font-bold font-sans tracking-tight leading-none group flex items-center justify-between ${
                          link.label === "Login" || link.label === "Sign up" 
                          ? "text-cartlist-orange" 
                          : "text-black"
                        }`}
                      >
                        <span>{link.label}</span>
                        <motion.span 
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1 }}
                          className="w-3 h-3 bg-current rounded-full" 
                        />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
