import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import { motion } from "motion/react";
import { useToast } from "../../contexts/ToastContext";

const AdminLogin: React.FC = () => {
  const { login, fetchWithAuth } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  React.useEffect(() => {
    // Check if any admins exist using the public endpoint
    const checkAdmins = async () => {
      console.log("Checking admin status...");
      try {
        const res = await fetch("/api/admin/check-setup");
        if (res.ok) {
          const data = await res.json();
          console.log("Admin setup status:", data);
          if (data.needsSetup) {
            setShowSetup(true);
            showToast("System ready for first-time admin setup.", "info");
          }
        } else {
          console.error("Check setup failed with status:", res.status);
        }
      } catch (e) {
        console.error("Failed to check admin setup:", e);
      }
    };
    checkAdmins();
  }, []);

  const handleSetup = async () => {
    // Using the credentials provided by the user
    const defaultEmail = "fatunsed@gmail.com";
    const defaultPass = "9%7g564F123";

    console.log("Attempting primary admin provisioning...");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/setup-initial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: defaultEmail, 
          password: defaultPass, 
          firstName: "System", 
          lastName: "Administrator" 
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        console.log("Admin provisioned successfully");
        showToast("Primary Admin Identity Provisioned. Access Granted.", "success");
        setShowSetup(false);
        setEmail(defaultEmail);
        setPassword(defaultPass);
        
        // Auto-login after successful setup
        await handleAutoLogin(defaultEmail, defaultPass);
      } else {
        console.error("Provisioning error:", data.message);
        showToast(data.message || "Setup failed", "error");
      }
    } catch (e) {
      console.error("Setup network error:", e);
      showToast("System network error during setup", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoLogin = async (e: string, p: string) => {
    try {
      const response = await fetchWithAuth("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e, password: p }),
      });
      const result = await response.json();
      if (response.ok && result.user.role === "admin") {
        login(result.user, result.token);
        showToast("Authenticated as Primary Admin.", "success");
        navigate("/admin");
      }
    } catch (err) {
      showToast("Manual login required after setup.", "info");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Admin login attempt for:", email);
      const response = await fetchWithAuth("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.user.role === "admin") {
          login(result.user, result.token);
          showToast("Admin access granted. Welcome to Command Center.", "success");
          navigate("/admin");
        } else {
          showToast("Access Denied: Not an admin account.", "error");
        }
      } else {
        showToast(result.message || "Invalid credentials", "error");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      showToast("System error during authentication", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#F07E48] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-[40px] p-10 lg:p-12 shadow-2xl overflow-hidden relative">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-[#F07E48] rounded-2zl flex items-center justify-center rotate-3 shadow-xl shadow-[#F07E48]/20 mb-6">
              <ShieldCheck className="w-10 h-10 text-white -rotate-3" />
            </div>
            <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight text-center">Command Center</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Administrative Gateway</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {showSetup && (
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl mb-6">
                 <p className="text-[10px] font-black text-cartlist-orange uppercase tracking-widest mb-2">System Initialization Required</p>
                 <p className="text-xs text-gray-600 font-medium mb-3">No administrative accounts detected. Provision the primary identity to proceed.</p>
                 <Button type="button" onClick={handleSetup} className="w-full h-10 bg-cartlist-orange text-white font-bold text-xs rounded-xl">Initialize Command Center</Button>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Authorized Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-[#F07E48] transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-[#FDF8F3] border-2 border-transparent focus:border-[#F07E48]/20 rounded-2xl pl-14 pr-6 text-sm font-bold outline-none transition-all"
                  placeholder="admin@cartlist.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Secure Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-[#F07E48] transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-[#FDF8F3] border-2 border-transparent focus:border-[#F07E48]/20 rounded-2xl pl-14 pr-14 text-sm font-bold outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-5 flex items-center text-gray-400 hover:text-[#F07E48]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-[#1A1A1A] hover:bg-neutral-800 text-white font-black text-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 shadow-xl"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate Access
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <Link to="/login" className="text-xs font-bold text-gray-400 hover:text-[#F07E48] transition-colors">
              Return to Vendor Portal
            </Link>
          </div>
        </div>

        <p className="text-white/30 text-center mt-8 font-bold text-[10px] uppercase tracking-widest leading-loose">
          Secure Administrative System<br />
          Controlled by Meta Dynamics Engineering
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
