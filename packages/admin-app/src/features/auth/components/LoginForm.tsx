import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";
import { Button } from "@insight/ui";
import { Input } from "@insight/ui";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Zap } from "lucide-react";
import { cn } from "@/utils";

// Test mode configuration
const isTestMode =
  import.meta.env.MODE === "test" ||
  import.meta.env.VITE_ENABLE_AUTO_LOGIN === "true";
const isDevelopment = import.meta.env.DEV;
const showQuickLogin = isDevelopment || isTestMode;

const DEFAULT_CREDENTIALS = {
  email: import.meta.env.VITE_TEST_EMAIL || "admin@test.com",
  password: import.meta.env.VITE_TEST_PASSWORD || "Test123!",
};

export function LoginForm() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: showQuickLogin ? DEFAULT_CREDENTIALS.email : "",
    password: showQuickLogin ? DEFAULT_CREDENTIALS.password : "",
    rememberMe: showQuickLogin,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Auto-login in test mode
  useEffect(() => {
    if (isTestMode && import.meta.env.VITE_ENABLE_AUTO_LOGIN === "true") {
      const autoLogin = async () => {
        try {
          await login({
            email: DEFAULT_CREDENTIALS.email,
            password: DEFAULT_CREDENTIALS.password,
            rememberMe: true,
          });
          navigate("/dashboard");
        } catch (err) {
          console.error("Auto-login failed:", err);
        }
      };
      // Delay to show the UI briefly
      const timer = setTimeout(autoLogin, 500);
      return () => clearTimeout(timer);
    }
  }, [login, navigate]);

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!authService.validateEmail(formData.email)) {
      errors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      navigate("/dashboard");
    } catch (err: any) {
      // Error is handled by the store
      console.error("Login failed:", err);
    }
  };

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]:
          e.target.type === "checkbox" ? e.target.checked : e.target.value,
      }));

      // Clear field-specific error
      if (validationErrors[field as "email" | "password"]) {
        setValidationErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const handleQuickLogin = async () => {
    clearError();
    setFormData({
      email: DEFAULT_CREDENTIALS.email,
      password: DEFAULT_CREDENTIALS.password,
      rememberMe: true,
    });

    // Auto-submit after setting credentials
    setTimeout(async () => {
      try {
        await login({
          email: DEFAULT_CREDENTIALS.email,
          password: DEFAULT_CREDENTIALS.password,
          rememberMe: true,
        });
        navigate("/dashboard");
      } catch (err: any) {
        console.error("Quick login failed:", err);
      }
    }, 100);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Quick Login Button - Development/Test Mode Only */}
      {showQuickLogin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                {isTestMode ? "🧪 Test Mode" : "Dev Mode"}
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                {DEFAULT_CREDENTIALS.email}
              </p>
            </div>
            <Button
              type="button"
              onClick={handleQuickLogin}
              disabled={loading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="w-4 h-4 mr-1" />
              Quick Login
            </Button>
          </div>
        </div>
      )}

      {/* Global Error */}
      {error && (
        <div
          className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Login Failed</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="w-5 h-5 text-slate-400" />
          </div>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            className={cn(
              "pl-10",
              validationErrors.email &&
                "border-red-300 focus:border-red-500 focus:ring-red-500"
            )}
            placeholder="admin@example.com"
            autoComplete="email"
            required
            aria-invalid={!!validationErrors.email}
            aria-describedby={
              validationErrors.email ? "email-error" : undefined
            }
          />
        </div>
        {validationErrors.email && (
          <p
            id="email-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {validationErrors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 text-slate-400" />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange("password")}
            className={cn(
              "pl-10 pr-10",
              validationErrors.password &&
                "border-red-300 focus:border-red-500 focus:ring-red-500"
            )}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            aria-invalid={!!validationErrors.password}
            aria-describedby={
              validationErrors.password ? "password-error" : undefined
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 text-slate-400 hover:text-slate-600" />
            ) : (
              <Eye className="w-5 h-5 text-slate-400 hover:text-slate-600" />
            )}
          </button>
        </div>
        {validationErrors.password && (
          <p
            id="password-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {validationErrors.password}
          </p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleChange("rememberMe")}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-slate-700 cursor-pointer"
          >
            Remember me for 8 hours
          </label>
        </div>

        <button
          type="button"
          className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
          onClick={() => {
            // TODO: Navigate to password reset
            console.log("Password reset");
          }}
        >
          Forgot password?
        </button>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Signing in...
          </div>
        ) : (
          "Sign in"
        )}
      </Button>

      {/* Security Notice */}
      <p className="text-xs text-center text-slate-500">
        Protected by enterprise-grade security. Maximum 5 login attempts per 15
        minutes.
      </p>
    </form>
  );
}
