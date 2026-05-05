import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  CheckCircle2, 
  User, 
  Building2, 
  Phone, 
  ChevronDown, 
  Lock,
  Layers,
  Store
} from "lucide-react";
import { AnimatePresence } from "motion/react";

const registerSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(80),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters").max(80),
  email: z.string().email("Invalid email address"),
  gender: z.string().min(1, "Please select your gender"),
  whatsappNumber: z.string().regex(/^(080|081|070|090|091|07)\d{8}$/, "Invalid Nigerian phone number format"),
  businessCategory: z.string().optional(),
  otherBusinessCategory: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { login, fetchWithAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "success" | "error">("idle");

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gender: "",
      businessCategory: ""
    }
  });

  const businessCategoryValue = watch("businessCategory", "");

  const handleResendLink = async () => {
    if (!registeredEmail || isResending) return;
    
    setIsResending(true);
    setResendStatus("idle");
    
    try {
      const response = await fetchWithAuth("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });
      
      if (response.ok) {
        setResendStatus("success");
      } else {
        setResendStatus("error");
      }
    } catch (err) {
      setResendStatus("error");
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: RegisterValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const finalData = {
        ...data,
        businessCategory: data.businessCategory === "Other" ? data.otherBusinessCategory : data.businessCategory
      };
      const response = await fetchWithAuth("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      const result = await response.json();

      if (response.ok) {
        setRegisteredEmail(data.email);
        setShowVerificationModal(true);
      } else {
        setError(result.message || "Registration failed");
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
            <h1 className="text-2xl font-bold font-heading text-gray-900 tracking-tight mb-0.5">Welcome to Cartlist</h1>
            <p className="text-gray-500 font-medium tracking-tight text-xs">Create an account with your details to get started.</p>
          </div>

          {/* Google Login - Moved to TOP as requested */}
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
            Signup with Google
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Business Name */}
              <div className="space-y-1">
                <Label htmlFor="businessName" className="text-[11px] font-bold text-gray-500">Business name</Label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input 
                    id="businessName" 
                    placeholder="E.g Adaeze Grains" 
                    {...register("businessName")}
                    className={cn(
                      "h-10 pl-10 rounded-xl border-gray-100 bg-white focus:ring-0 focus:border-cartlist-orange transition-all font-medium text-base",
                      errors.businessName && "border-rose-200 bg-rose-50/30"
                    )}
                  />
                </div>
                {errors.businessName && <p className="text-[9px] font-bold text-rose-500">{errors.businessName.message}</p>}
              </div>
              
              {/* Owner Name */}
              <div className="space-y-1">
                <Label htmlFor="ownerName" className="text-[11px] font-bold text-gray-500">Full name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input 
                    id="ownerName" 
                    placeholder="E.g Adaeze Obi" 
                    {...register("ownerName")}
                    className={cn(
                      "h-10 pl-10 rounded-xl border-gray-100 bg-white focus:ring-0 focus:border-cartlist-orange transition-all font-medium text-base",
                      errors.ownerName && "border-rose-200 bg-rose-50/30"
                    )}
                  />
                </div>
                {errors.ownerName && <p className="text-[9px] font-bold text-rose-500">{errors.ownerName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-[11px] font-bold text-gray-500">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter email" 
                    {...register("email")}
                    className={cn(
                      "h-10 pl-10 rounded-xl border-gray-100 bg-white focus:ring-0 focus:border-cartlist-orange transition-all font-medium text-base",
                      errors.email && "border-rose-200 bg-rose-50/30"
                    )}
                  />
                </div>
                {errors.email && <p className="text-[9px] font-bold text-rose-500">{errors.email.message}</p>}
              </div>
              
              {/* Gender */}
              <div className="space-y-1">
                <Label htmlFor="gender" className="text-[11px] font-bold text-gray-500">Gender</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 z-10" />
                  <Select onValueChange={(v: string) => setValue("gender", v)}>
                    <SelectTrigger className={cn(
                      "h-10 pl-10 rounded-xl border-gray-100 bg-white focus:ring-0 transition-all font-medium text-xs",
                      errors.gender && "border-rose-200 bg-rose-50/30"
                    )}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.gender && <p className="text-[9px] font-bold text-rose-500">{errors.gender.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Phone */}
              <div className="space-y-1">
                <Label htmlFor="whatsappNumber" className="text-[11px] font-bold text-gray-500">Phone number</Label>
                <div className="flex gap-2">
                   <div className="relative min-w-[85px]">
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <span className="text-sm">🇳🇬</span>
                        <span className="text-[10px] font-bold text-gray-900">+234</span>
                        <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
                      </div>
                      <div className="h-10 rounded-xl border border-gray-100 bg-white"></div>
                   </div>
                  <div className="relative flex-1">
                    <Input 
                      id="whatsappNumber" 
                      placeholder="801..." 
                      {...register("whatsappNumber")}
                      className={cn(
                        "h-10 rounded-xl border-gray-100 bg-white focus:ring-0 focus:border-cartlist-orange transition-all font-medium text-base",
                        errors.whatsappNumber && "border-rose-200 bg-rose-50/30"
                      )}
                    />
                  </div>
                </div>
                {errors.whatsappNumber && <p className="text-[9px] font-bold text-rose-500">{errors.whatsappNumber.message}</p>}
              </div>
              
              {/* Business Category */}
              <div className="space-y-1">
                <Label htmlFor="businessCategory" className="text-[11px] font-bold text-gray-500">Business Category</Label>
                <div className="relative">
                  <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 z-10" />
                  <Select onValueChange={(v: string) => setValue("businessCategory", v)}>
                    <SelectTrigger className="h-10 pl-10 rounded-xl border-gray-100 bg-white focus:ring-0 transition-all font-medium text-xs text-gray-400">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Fashion">Fashion</SelectItem>
                      <SelectItem value="Beauty">Beauty</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Other Category - Conditional */}
            <AnimatePresence>
              {businessCategoryValue === "Other" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 overflow-hidden"
                >
                  <Label htmlFor="otherBusinessCategory" className="text-[11px] font-bold text-gray-500">Specify Category</Label>
                  <Input 
                    id="otherBusinessCategory" 
                    placeholder="Details..." 
                    {...register("otherBusinessCategory")}
                    className="h-10 rounded-xl border-gray-100 bg-white focus:ring-0 focus:border-cartlist-orange transition-all font-medium text-xs"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-[11px] font-bold text-gray-500">Password</Label>
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
              
              {/* Confirm Password */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-[11px] font-bold text-gray-500">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"} 
                    {...register("confirmPassword")}
                    className={cn(
                      "h-10 pl-10 pr-10 rounded-xl border-gray-100 bg-white focus:ring-0 focus:border-cartlist-orange transition-all font-medium text-base",
                      errors.confirmPassword && "border-rose-200 bg-rose-50/30"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-[9px] font-bold text-rose-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-11 bg-cartlist-orange hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all active:scale-[0.98] mt-1 shadow-sm"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-xs font-medium text-gray-500 mt-2">
              Already have an account? <Link to="/login" className="text-cartlist-orange font-bold hover:underline">Login</Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Column - Decorative Background + Mockup Image */}
      {/* Right Column - PURE IMAGE */}
<div className="hidden lg:block w-1/2 fixed right-0 top-0 h-screen">
  <img 
    src="https://res.cloudinary.com/dpsvazol5/image/upload/v1777910850/auth-bg_z9waxr.png"
    alt="Auth background"
    className="w-full h-full object-cover"
    referrerPolicy="no-referrer"
  />
</div>

      {/* Verification Modal - Maintained from original */}
      <AnimatePresence>
        {showVerificationModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowVerificationModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-cartlist-orange" />
              </div>
              <h2 className="text-2xl font-bold font-heading mb-4">Verify your email</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                We've sent a verification link to <span className="font-bold text-gray-900">{registeredEmail}</span>. 
                Please check your inbox and click the link to activate your account.
              </p>
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate("/login")}
                  className="w-full h-12 bg-cartlist-orange hover:bg-orange-600 text-white rounded-full font-bold shadow-lg shadow-orange-100"
                >
                  Go to Login
                </Button>
                <div className="text-xs text-muted-foreground">
                  {resendStatus === "success" ? (
                    <p className="text-green-600 font-medium flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Email resent successfully!
                    </p>
                  ) : resendStatus === "error" ? (
                    <p className="text-destructive font-medium">
                      Failed to resend. Please try again.
                    </p>
                  ) : (
                    <p>
                      Didn't receive the email? Check your spam folder or{" "}
                      <button 
                        onClick={handleResendLink}
                        disabled={isResending}
                        className="text-cartlist-orange font-bold hover:underline disabled:opacity-50"
                      >
                        {isResending ? "resending..." : "resend link"}
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
