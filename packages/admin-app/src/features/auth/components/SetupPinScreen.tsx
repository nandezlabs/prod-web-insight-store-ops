import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@insight/ui";

interface SetupPinScreenProps {
  onPinCreated: (pin: string) => void;
}

export function SetupPinScreen({ onPinCreated }: SetupPinScreenProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [errors, setErrors] = useState<{ pin?: string; confirmPin?: string }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePin = (value: string): string | undefined => {
    if (value.length < 4) {
      return "PIN must be at least 4 digits";
    }
    if (value.length > 8) {
      return "PIN must be no more than 8 digits";
    }
    if (!/^\d+$/.test(value)) {
      return "PIN must contain only numbers";
    }
    return undefined;
  };

  const handlePinChange = (value: string) => {
    setPin(value);
    if (errors.pin) {
      const error = validatePin(value);
      setErrors({ ...errors, pin: error });
    }
  };

  const handleConfirmPinChange = (value: string) => {
    setConfirmPin(value);
    if (errors.confirmPin && value === pin) {
      setErrors({ ...errors, confirmPin: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pinError = validatePin(pin);
    const confirmError = pin !== confirmPin ? "PINs do not match" : undefined;

    if (pinError || confirmError) {
      setErrors({ pin: pinError, confirmPin: confirmError });
      return;
    }

    setIsSubmitting(true);
    // Simulate saving
    await new Promise((resolve) => setTimeout(resolve, 500));
    onPinCreated(pin);
  };

  const pinStrength =
    pin.length >= 6 ? "strong" : pin.length >= 4 ? "medium" : "weak";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome Admin!</h1>
          <p className="text-slate-600 mt-2">Let's set up your secure PIN</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Create Your Admin PIN</CardTitle>
            <p className="text-sm text-slate-600 mt-2">
              This PIN will be used to access your dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* PIN Input */}
              <div>
                <label
                  htmlFor="pin"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Enter PIN (4-8 digits)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value)}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.pin ? "border-red-300" : "border-slate-300"
                    }`}
                    placeholder="Enter PIN"
                    maxLength={8}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPin ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.pin && (
                  <p className="text-sm text-red-600 mt-1">{errors.pin}</p>
                )}
                {pin && !errors.pin && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-600">Strength:</span>
                      <span
                        className={`font-medium ${
                          pinStrength === "strong"
                            ? "text-green-600"
                            : pinStrength === "medium"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {pinStrength === "strong"
                          ? "Strong"
                          : pinStrength === "medium"
                          ? "Medium"
                          : "Weak"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm PIN Input */}
              <div>
                <label
                  htmlFor="confirmPin"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Confirm PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="confirmPin"
                    type={showPin ? "text" : "password"}
                    value={confirmPin}
                    onChange={(e) => handleConfirmPinChange(e.target.value)}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.confirmPin ? "border-red-300" : "border-slate-300"
                    }`}
                    placeholder="Confirm PIN"
                    maxLength={8}
                  />
                  {confirmPin && pin === confirmPin && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                  )}
                </div>
                {errors.confirmPin && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.confirmPin}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !pin || !confirmPin}
              >
                {isSubmitting ? "Setting up..." : "Continue"}
              </Button>

              <p className="text-xs text-center text-slate-500">
                💡 Tip: Use a PIN you can remember but others can't guess
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
