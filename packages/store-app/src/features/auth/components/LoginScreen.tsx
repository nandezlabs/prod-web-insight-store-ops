import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2, Zap } from "lucide-react";
import { PinEntry } from "./PinEntry";
import { GeofenceStatus } from "./GeofenceStatus";
import { useAuthStore } from "../stores/authStore";

// Test mode configuration
const isTestMode =
  import.meta.env.MODE === "test" ||
  import.meta.env.VITE_ENABLE_AUTO_LOGIN === "true";
const isDevelopment = import.meta.env.DEV;
const showQuickLogin = isDevelopment || isTestMode;

const DEV_TEST_PIN = import.meta.env.VITE_TEST_PIN || "1234";

interface LoginScreenProps {
  storeId: string;
  storeName?: string;
  logoUrl?: string;
}

export function LoginScreen({
  storeId,
  storeName = "Store",
  logoUrl,
}: LoginScreenProps) {
  const [pin, setPin] = useState(showQuickLogin ? DEV_TEST_PIN : "");
  const { login, isLoading, error, clearError, lockedUntil, attempts } =
    useAuthStore();

  // Calculate remaining lockout time
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState<string>("");

  useEffect(() => {
    // Update lockout timer every second
    if (lockedUntil && lockedUntil > Date.now()) {
      const interval = setInterval(() => {
        const remaining = lockedUntil - Date.now();
        if (remaining <= 0) {
          setLockoutTimeRemaining("");
        } else {
          const minutes = Math.ceil(remaining / 60000);
          setLockoutTimeRemaining(`${minutes} minute${minutes > 1 ? "s" : ""}`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }

    setLockoutTimeRemaining("");
    return undefined;
  }, [lockedUntil]);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error, clearError]);

  // Clear error when PIN changes
  useEffect(() => {
    if (pin.length > 0 && error) {
      clearError();
    }
  }, [pin, error, clearError]);

  // Auto-login in test mode
  useEffect(() => {
    if (isTestMode && import.meta.env.VITE_ENABLE_AUTO_LOGIN === "true") {
      const autoLogin = async () => {
        try {
          await login(storeId, DEV_TEST_PIN);
        } catch (err) {
          console.error("Auto-login failed:", err);
        }
      };
      // Delay to show the UI briefly
      const timer = setTimeout(autoLogin, 500);
      return () => clearTimeout(timer);
    }
  }, [login, storeId]);

  const handleSubmit = async () => {
    if (pin.length !== 4) return;
    if (isLoading) return;
    if (lockedUntil && lockedUntil > Date.now()) return;

    try {
      await login(storeId, pin);
    } catch (err) {
      // Error is handled in the store
    } finally {
      // Clear PIN after submission
      setPin("");
    }
  };

  const handleClear = () => {
    setPin("");
    clearError();
  };

  const handleQuickLogin = async () => {
    clearError();
    setPin(DEV_TEST_PIN);

    // Auto-submit after setting PIN
    setTimeout(async () => {
      try {
        await login(storeId, DEV_TEST_PIN);
      } catch (err) {
        // Error is handled in the store
      }
    }, 100);
  };

  const isLocked = lockedUntil && lockedUntil > Date.now();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8"
    >
      <div className="w-full max-w-md">
        {/* Logo/Store Name */}
        <div className="flex flex-col items-center mb-12">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="h-20 mb-4" />
          ) : (
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-3xl font-bold">
                {storeName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-800">{storeName}</h1>
          <p className="text-gray-600 mt-2">Enter your PIN to continue</p>
        </div>

        {/* Geofence Status */}
        <div className="flex justify-center mb-8">
          <GeofenceStatus />
        </div>

        {/* Quick Login - Development/Test Mode Only */}
        {showQuickLogin && (
          <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {isTestMode ? "🧪 Test Mode" : "Dev Mode"}
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  PIN: {DEV_TEST_PIN}
                </p>
              </div>
              <button
                type="button"
                onClick={handleQuickLogin}
                disabled={isLoading || !!isLocked}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Zap className="w-4 h-4" />
                Quick Login
              </button>
            </div>
          </div>
        )}

        {/* Error Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                x: [0, -10, 10, -10, 10, 0], // Shake animation
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.3,
                x: { duration: 0.5, ease: "easeInOut" },
              }}
              className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">{error}</p>
                  {!isLocked && attempts > 0 && attempts < 5 && (
                    <p className="text-red-600 text-sm mt-1">
                      {5 - attempts} attempt{5 - attempts > 1 ? "s" : ""}{" "}
                      remaining
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {isLocked && lockoutTimeRemaining && (
            <motion.div
              key="locked"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-lg p-4"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-amber-800 font-medium">
                    Account temporarily locked
                  </p>
                  <p className="text-amber-700 text-sm mt-1">
                    Try again in {lockoutTimeRemaining}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PIN Entry */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <PinEntry
            pin={pin}
            onPinChange={setPin}
            onSubmit={handleSubmit}
            onClear={handleClear}
            disabled={isLoading || !!isLocked}
            error={error}
          />

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Loader2
                className="w-5 h-5 text-blue-600 animate-spin"
                aria-hidden="true"
              />
              <span className="text-blue-600 font-medium">
                Authenticating...
              </span>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Need help? Contact your store manager
          </p>
        </div>
      </div>
    </motion.div>
  );
}
