import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "motion/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

import { 
  Eye, 
  EyeOff,
  Mail,
  Lock
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, fetchWithAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(location.state?.message || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Clear success message when user interacts
    if (error) setSuccessMessage(null);
  }, [error]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    }
  });

  const onSubmit = async (data: LoginValues) => {
    console.log("Login onSubmit called", data);
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        login(result.user, result.token);
        navigate("/dashboard");
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch("/api/auth/google/url");
      const { url } = await response.json();
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;
      
      const popup = window.open(
        url,
        "google-login",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
          login(event.data.user, event.data.token);
          navigate("/dashboard");
          window.removeEventListener("message", handleMessage);
        }
      };

      window.addEventListener("message", handleMessage);
    } catch (err) {
      setError("Failed to initialize Google login");
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 px-6 md:px-12 xl:px-16 overflow-y-auto flex flex-col justify-center">
        <div className="max-w-xl mx-auto w-full py-4">
          <Logo className="mb-4" />
          
          <div className="mb-2">
            <h1 className="text-2xl font-bold font-heading text-gray-900 tracking-tight mb-0.5">Welcome Back</h1>
            <p className="text-gray-500 font-medium tracking-tight text-xs">Login to manage your stockpile</p>
          </div>

          {/* Google Login - At the TOP */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-11 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </Button>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100"></span>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
              <span className="bg-white px-4 text-gray-400">OR</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold rounded-xl">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="p-2.5 bg-green-50 border border-green-100 text-green-700 text-[11px] font-bold rounded-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {successMessage}
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email" className="text-[11px] font-bold text-gray-500">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter email address" 
                  {...register("email")}
                  className={cn(
                    "h-10 pl-10 rounded-xl border-gray-100 bg-white focus:ring-0 focus:border-cartlist-orange transition-all font-medium text-base",
                    errors.email && "border-rose-200 bg-rose-50/30"
                  )}
                />
              </div>
              {errors.email && <p className="text-[9px] font-bold text-rose-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[11px] font-bold text-gray-500">Password</Label>
                <Link to="/forgot-password" text="Forgot password?" className="text-[10px] text-cartlist-orange font-bold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  {...register("password")}
                  className={cn(
                    "h-10 pl-10 pr-10 rounded-xl border-gray-100 bg-white focus:ring-0 focus:border-cartlist-orange transition-all font-medium text-base",
                    errors.password && "border-rose-200 bg-rose-50/30"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.password && <p className="text-[9px] font-bold text-rose-500">{errors.password.message}</p>}
            </div>

            <div className="flex items-center space-x-2 py-1">
              <Checkbox 
                id="rememberMe" 
                onCheckedChange={(checked) => setValue("rememberMe", !!checked)}
                className="w-3.5 h-3.5 rounded border-gray-200 data-[state=checked]:bg-cartlist-orange data-[state=checked]:border-cartlist-orange"
              />
              <label
                htmlFor="rememberMe"
                className="text-[11px] font-medium text-gray-500 leading-none cursor-pointer"
              >
                Remember me for 30 days
              </label>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-11 bg-cartlist-orange hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all active:scale-[0.98] mt-1 shadow-sm"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>

            <p className="text-center text-xs font-medium text-gray-500 mt-2">
              Don't have an account? <Link to="/register" className="text-cartlist-orange font-bold hover:underline">Sign up</Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Column - PURE IMAGE */}
      <div className="hidden lg:block w-1/2 fixed right-0 top-0 h-screen">
        <img 
          src="https://res.cloudinary.com/dpsvazol5/image/upload/v1777910850/auth-bg_z9waxr.png"
          alt="Auth background"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
