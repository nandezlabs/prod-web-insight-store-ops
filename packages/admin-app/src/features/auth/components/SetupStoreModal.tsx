import { useState } from "react";
import { motion } from "framer-motion";
import { Store, Copy, Check } from "lucide-react";
import { Button } from "@insight/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@insight/ui";
import { generateRandomPin } from "../store/setupStore";

interface SetupStoreModalProps {
  onStoreCreated: (storeNumber: string, pin: string) => void;
}

export function SetupStoreModal({ onStoreCreated }: SetupStoreModalProps) {
  const [storeNumber, setStoreNumber] = useState("");
  const [generatedPin] = useState(generateRandomPin());
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStoreNumber = (value: string): string | undefined => {
    if (!value) {
      return "Store number is required";
    }
    if (!value.startsWith("PX")) {
      return "Store number must start with PX";
    }
    if (value.length < 3) {
      return "Please enter a store number after PX";
    }
    if (!/^PX\d+$/.test(value)) {
      return "Store number must be PX followed by numbers only";
    }
    return undefined;
  };

  const handleStoreNumberChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setStoreNumber(upperValue);
    if (error) {
      setError(validateStoreNumber(upperValue));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateStoreNumber(storeNumber);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    // Simulate saving
    await new Promise((resolve) => setTimeout(resolve, 500));
    onStoreCreated(storeNumber, generatedPin);
  };

  const copyPin = () => {
    navigator.clipboard.writeText(generatedPin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Store className="w-5 h-5 text-blue-600" />
                </div>
                <CardTitle>Create Your Store</CardTitle>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              Enter your store number to get started
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="storeNumber"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Store Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-semibold text-lg pointer-events-none">
                    PX
                  </div>
                  <input
                    id="storeNumber"
                    type="text"
                    value={storeNumber.replace("PX", "")}
                    onChange={(e) =>
                      handleStoreNumberChange("PX" + e.target.value)
                    }
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg ${
                      error ? "border-red-300" : "border-slate-300"
                    }`}
                    placeholder="001"
                    autoFocus
                    maxLength={10}
                  />
                </div>
                {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
                <p className="text-xs text-slate-500 mt-2">
                  Example: PX001, PX100, PX999
                </p>
              </div>

              {storeNumber && !error && storeNumber.length > 2 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium">
                    Preview: {storeNumber}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    This will be your store identifier
                  </p>
                </div>
              )}

              {/* Generated PIN Display */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-blue-900">
                    🔐 Auto-Generated Store PIN
                  </p>
                  <button
                    type="button"
                    onClick={copyPin}
                    className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-white rounded-lg p-4 mb-2">
                  <p className="text-center text-3xl font-bold font-mono text-slate-900 tracking-widest">
                    {generatedPin}
                  </p>
                </div>
                <p className="text-xs text-blue-700">
                  💡 Save this PIN - it's needed to access the store app
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    isSubmitting || !storeNumber || storeNumber === "PX"
                  }
                >
                  {isSubmitting ? "Creating..." : "Create Store"}
                </Button>
              </div>

              <p className="text-xs text-center text-slate-500">
                💡 You can add more stores later from the dashboard
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
