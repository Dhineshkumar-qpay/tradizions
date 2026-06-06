"use client";

import { useState, useEffect } from "react";
import { API } from "@/service/api_service";
import { API_ROUTES } from "@/routes/api_routes";
import { ResponseModel, VerifyOTPModel } from "@/models/auth_model";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [loginStep, setLoginStep] = useState<"mobile" | "otp">("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("token");
    if (token && token.trim() !== "") {
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userMobile");
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const response = await API.post<ResponseModel>(API_ROUTES.SENDOTP, {
        phone: mobileNumber,
      });
      if (response.status === 200) {
        setLoginStep("otp");
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setError(
        err?.response?.data?.message || "Error sending OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter complete 6-digit OTP.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const response = await API.post<VerifyOTPModel>(API_ROUTES.VERIFYOTP, {
        phone: mobileNumber,
        otp: Number(otp),
      });
      if (response.status === 200 && response.data.data?.token) {
        const token = response.data.data.token;
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userMobile", mobileNumber);
        localStorage.setItem("token", token);

        window.dispatchEvent(new Event("loginSuccess"));
        setIsAuthenticated(true);
      } else {
        setError("Invalid OTP or server error. Please try again.");
      }
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setError(
        err?.response?.data?.message || "Invalid OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f3] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--olive)]/5 blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--orange)]/5 blur-3xl"></div>
        </div>

        <div className="max-w-md w-full z-10 bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-[0_16px_48px_rgba(85,107,47,0.08)] border border-[#e8dfc8] animate-fade-in-up">
          <img
            src="/app-logo.png"
            alt="Tradizions Logo"
            className="w-30 h-16 mb-6 mx-auto object-contain"
          />
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Tradizions
            </h2>
            <p className="text-gray-500 text-sm font-medium tracking-wide uppercase">
              Welcome Back 👋
            </p>
          </div>

          {loginStep === "mobile" ? (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Mobile Number
                </label>
                <div className="flex group focus-within:ring-2 focus-within:ring-[var(--olive)]/20 rounded-xl transition-all">
                  <div className="flex items-center justify-center px-4 border border-gray-200 border-r-0 rounded-l-xl bg-gray-50 text-gray-500 font-medium text-sm group-focus-within:border-[var(--olive)] transition-colors">
                    +91
                  </div>
                  <input
                    id="mobile-number"
                    name="mobile"
                    type="tel"
                    required
                    maxLength={10}
                    className="w-full border border-gray-200 rounded-r-xl py-3.5 px-4 text-sm font-bold text-gray-700 outline-none group-focus-within:border-[var(--olive)] transition-colors placeholder:text-gray-300 placeholder:font-medium"
                    placeholder="Enter 10-digit number"
                    value={mobileNumber}
                    onChange={(e) =>
                      setMobileNumber(e.target.value.replace(/\D/g, ""))
                    }
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs font-bold text-center animate-fade-in-up">
                  {error}
                </p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading || mobileNumber.length !== 10}
                  className="w-full py-4 rounded-xl bg-[var(--olive)] text-white font-bold text-[13px] tracking-widest shadow-lg shadow-[var(--olive)]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 flex justify-center items-center gap-2 uppercase"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                  6-digit OTP
                </label>
                <div className="group focus-within:ring-2 focus-within:ring-[var(--olive)]/20 rounded-xl transition-all">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    className="w-full border border-gray-200 rounded-xl py-3.5 px-4 text-center tracking-[0.5em] text-lg font-bold text-gray-700 outline-none focus:border-[var(--olive)] transition-colors placeholder:text-gray-300 placeholder:font-medium placeholder:tracking-normal placeholder:text-sm"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs font-bold text-center animate-fade-in-up">
                  {error}
                </p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full py-4 rounded-xl bg-[var(--olive)] text-white font-bold text-[13px] tracking-widest shadow-lg shadow-[var(--olive)]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 flex justify-center items-center gap-2 uppercase"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Verify OTP"
                  )}
                </button>
              </div>
              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setLoginStep("mobile");
                    setError("");
                    setOtp("");
                  }}
                  className="text-[11px] font-bold text-gray-400 hover:text-[var(--olive)] uppercase tracking-widest transition-colors"
                >
                  ← Change Mobile Number
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
