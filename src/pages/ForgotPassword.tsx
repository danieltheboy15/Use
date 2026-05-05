import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "./Landing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "@/lib/utils";

import { 
  Mail, 
  KeyRound, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  ChevronDown
} from "lucide-react";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmailValues = z.infer<typeof emailSchema>;
type OtpValues = z.infer<typeof otpSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { fetchWithAuth } = useAuth();
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const emailForm = useForm<EmailValues>({ resolver: zodResolver(emailSchema) });
  const otpForm = useForm<OtpValues>({ resolver: zodResolver(otpSchema) });
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const passwordValue = passwordForm.watch("password", "");

  const onEmailSubmit = async (data: EmailValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setEmail(data.email);
        setIsSubmitting(false);
        setStep("otp");
        setResendTimer(60);
      } else {
        const result = await response.json();
        setError(result.message || "Something went wrong");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isSubmitting) return;
    
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setResendTimer(60);
      } else {
        setError(result.message || "Failed to resend OTP");
        if (result.retryAfter) {
          setResendTimer(result.retryAfter);
        }
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onOtpSubmit = async (data: OtpValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: data.otp }),
      });
      if (response.ok) {
        setOtp(data.otp);
        setIsSubmitting(false);
        setStep("reset");
        return; // Exit early to avoid finally block if component is switching
      } else {
        const result = await response.json();
        setError(result.message || "Invalid OTP");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: data.password }),
      });
      if (response.ok) {
        setIsSubmitting(false);
        navigate("/login", { state: { message: "Password reset successfully! Please login with your new password." } });
      } else {
        const result = await response.json();
        setError(result.message || "Failed to reset password");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 px-6 md:px-12 xl:px-16 overflow-y-auto flex flex-col justify-center">
        <div className="max-w-xl mx-auto w-full py-4">
          <Logo className="mb-4" />
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold font-heading text-gray-900 tracking-tight mb-0.5">Password reset</h1>
            <p className="text-gray-500 font-medium tracking-tight text-xs">
              {step === "email" && "Please enter your email address to receive reset OTP"}
              {step === "otp" && `Enter the 6-digit OTP sent to ${email}`}
              {step === "reset" && "Create a new secure password for your account"}
            </p>
          </div>

          <div className="mb-4">
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error-message"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold rounded-xl overflow-hidden mb-4"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.form
                key="email-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-[11px] font-bold text-gray-500">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className={cn(
                        "h-10 pl-10 rounded-xl border-gray-100 bg-white focus:ring-0 focus:border-cartlist-orange transition-all font-medium text-xs",
                        emailForm.formState.errors.email && "border-rose-200 bg-rose-50/30"
                      )}
                      {...emailForm.register("email")}
                    />
                  </div>
                  {emailForm.formState.errors.email && (
                    <p className="text-[9px] font-bold text-rose-500">{emailForm.formState.errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-cartlist-orange hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all active:scale-[0.98] mt-2 shadow-sm"
                >
                  {isSubmitting ? "Sending..." : "Send OTP"}
                </Button>
              </motion.form>
            )}

            {step === "otp" && (
              <motion.form
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <Label htmlFor="otp" className="text-[11px] font-bold text-gray-500">6-Digit OTP</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      className={cn(
                        "h-10 pl-10 rounded-xl border-gray-100 bg-white focus:ring-0 focus:border-cartlist-orange transition-all font-bold tracking-[0.5em] text-center text-base",
                        otpForm.formState.errors.otp && "border-rose-200 bg-rose-50/30"
                      )}
                      {...otpForm.register("otp")}
                    />
                  </div>
                  {otpForm.formState.errors.otp && (
                    <p className="text-[9px] font-bold text-rose-500">{otpForm.formState.errors.otp.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-cartlist-orange hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all active:scale-[0.98] mt-2 shadow-sm"
                >
                  {isSubmitting ? "Verifying..." : "Verify OTP"}
                </Button>

                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={resendTimer > 0 || isSubmitting}
                    onClick={handleResendOtp}
                    className="w-full h-10 text-cartlist-orange font-bold text-xs hover:bg-orange-50 rounded-xl disabled:text-gray-400"
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("email")}
                    className="w-full h-10 text-gray-500 font-bold text-xs hover:bg-gray-50 rounded-xl"
                  >
                    Change Email
                  </Button>
                </div>
              </motion.form>
            )}

            {step === "reset" && (
              <motion.form
                key="reset-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-[11px] font-bold text-gray-500">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={cn(
                        "h-10 pl-10 pr-10 rounded-xl border-gray-100 bg-white focus:ring-0 focus:border-cartlist-orange transition-all font-medium text-xs",
                        passwordForm.formState.errors.password && "border-rose-200 bg-rose-50/30"
                      )}
                      {...passwordForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={passwordValue} />
                  {passwordForm.formState.errors.password && (
                    <p className="text-[9px] font-bold text-rose-500">{passwordForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-[11px] font-bold text-gray-500">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={cn(
                        "h-10 pl-10 pr-10 rounded-xl border-gray-100 bg-white focus:ring-0 focus:border-cartlist-orange transition-all font-medium text-xs",
                        passwordForm.formState.errors.confirmPassword && "border-rose-200 bg-rose-50/30"
                      )}
                      {...passwordForm.register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-[9px] font-bold text-rose-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-cartlist-orange hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all active:scale-[0.98] mt-2 shadow-sm"
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-xs font-medium text-gray-500 hover:text-cartlist-orange font-bold transition-colors">
              Back to <span className="text-cartlist-orange underline">Login</span>
            </Link>
          </div>
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
