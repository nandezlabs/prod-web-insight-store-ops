import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useSetupStore } from "../store/setupStore";
import { Button } from "@insight/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@insight/ui";
import { Lock, AlertCircle, LayoutDashboard } from "lucide-react";

export function PinLoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();
  const { adminPin } = useSetupStore();

  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoginError("");

    if (!pin) {
      setLoginError("Please enter your PIN");
      return;
    }

    if (pin !== adminPin) {
      setLoginError("Incorrect PIN. Please try again.");
      setPin("");
      return;
    }

    try {
      // Mock login with PIN (create a session)
      await login({
        email: "admin@app.local",
        password: pin,
        rememberMe: true,
      });
      navigate("/dashboard");
    } catch (err: any) {
      setLoginError("Login failed. Please try again.");
    }
  };

  const handlePinChange = (value: string) => {
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setPin(value.slice(0, 8));
      if (loginError) setLoginError("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md px-4">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mb-4">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">
            Enter your PIN to continue
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-center">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {(error || loginError) && (
                <div
                  className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Login Failed
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {loginError || error}
                    </p>
                  </div>
                </div>
              )}

              {/* PIN Input */}
              <div>
                <label
                  htmlFor="pin"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Admin PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                    placeholder="••••"
                    autoFocus
                    maxLength={8}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !pin}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © 2024 Admin Dashboard. All rights reserved.
        </p>
      </div>
    </div>
  );
}
