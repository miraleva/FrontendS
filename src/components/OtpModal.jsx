import React, { useState, useEffect, useRef } from "react";
import { X, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../services/api";

export default function OtpModal({
  type = "email", // "email" | "sms"
  target = "",
  onClose,
  onSuccess
}) {
  const { t } = useTranslation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const inputRefs = useRef([]);

  useEffect(() => {
    // Automatically trigger OTP dispatch on initial modal open
    const sendInitialOtp = async () => {
      try {
        await api.post("/api/auth/send-email-otp", { email: target });
      } catch (err) {
        console.error("[OtpModal] Failed to send initial OTP email:", err);
      }
    };
    if (target) {
      sendInitialOtp();
    }
  }, [target]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setErrorMsg("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      } else {
        if (code.join("").length === 6 && !loading) {
          handleVerify();
        }
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      const newCode = pasted.split("");
      setCode(newCode);
      setErrorMsg("");
      inputRefs.current[5]?.focus();
    }
  };

  const handleResend = async () => {
    if (timer > 0 || loading) return;
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.post("/api/auth/send-email-otp", { email: target });
      setTimer(60);
      setSuccessMsg(t("otpSentTo", { target, defaultValue: `${target} adresine 6 haneli doğrulama kodunu gönderdik.` }));
    } catch (err) {
      setErrorMsg(t("otpSendError", "Kod gönderilirken bir hata oluştu. Lütfen tekrar deneyin."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setErrorMsg(t("invalidOtp", "Lütfen 6 haneli doğrulama kodunu eksiksiz giriniz."));
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await api.post("/api/auth/verify-email-otp", { code: fullCode, email: target });

      if (response.data?.success) {
        setSuccessMsg(t("verified", "Doğrulandı!"));
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 800);
      } else {
        setErrorMsg(response.data?.message || t("invalidOtp", "Hatalı veya süresi dolmuş doğrulama kodu."));
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || t("invalidOtp", "Hatalı veya süresi dolmuş doğrulama kodu."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/85 dark:bg-slate-900/85 p-6 sm:p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <ShieldCheck size={32} />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {t("otpModalTitle", "Doğrulama Kodunu Girin")}
          </h3>

          <p className="mt-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("otpSentTo", {
              target: target || "e-posta adresinize",
              defaultValue: `${target || 'E-posta adresinize'} 6 haneli doğrulama kodunu gönderdik.`
            })}
          </p>
        </div>

        {/* OTP Input Boxes */}
        <div className="mt-6 flex justify-center gap-1.5 sm:gap-3" onPaste={handlePaste}>
          {code.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="h-10 w-9 sm:h-14 sm:w-12 text-center text-lg sm:text-xl font-bold rounded-xl border border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-800/70 text-slate-900 dark:text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          ))}
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-rose-500 dark:text-rose-400 animate-shake">
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={14} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Submit Action Button */}
        <button
          onClick={handleVerify}
          disabled={loading || code.join("").length !== 6}
          className="mt-6 w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            t("verify", "Doğrula")
          )}
        </button>

        {/* Resend Timer */}
        <div className="mt-4 text-center">
          {timer > 0 ? (
            <span className="text-xs font-medium text-slate-400">
              {t("resendCodeIn", { seconds: timer, defaultValue: `Kodu Tekrar Gönder (${timer}s)` })}
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline transition-colors"
            >
              {t("resendCode", "Kodu Tekrar Gönder")}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
