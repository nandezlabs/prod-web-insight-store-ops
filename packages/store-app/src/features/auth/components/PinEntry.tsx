import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface PinEntryProps {
  pin: string;
  onPinChange: (pin: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  disabled?: boolean;
  error?: string | null;
  maxLength?: number;
}

export function PinEntry({
  pin,
  onPinChange,
  onSubmit,
  onClear,
  disabled = false,
  error = null,
  maxLength = 4,
}: PinEntryProps) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Auto-submit when max length is reached
  useEffect(() => {
    if (pin.length === maxLength && !disabled) {
      onSubmit();
    }
  }, [pin, maxLength, disabled, onSubmit]);

  // Clear error when user starts typing
  useEffect(() => {
    if (pin.length > 0 && error) {
      // Error will be cleared by parent component
    }
  }, [pin, error]);

  const handleNumberPress = (num: number) => {
    if (disabled || pin.length >= maxLength) return;

    // Haptic feedback (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    onPinChange(pin + num.toString());
  };

  const handleClear = () => {
    if (disabled) return;
    onClear();

    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    if (event.key >= "0" && event.key <= "9") {
      handleNumberPress(parseInt(event.key));
    } else if (event.key === "Backspace") {
      handleClear();
    } else if (event.key === "Enter") {
      if (pin.length === maxLength) {
        onSubmit();
      }
    }
  };

  const buttons = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
    { value: 6, label: "6" },
    { value: 7, label: "7" },
    { value: 8, label: "8" },
    { value: 9, label: "9" },
    { value: null, label: "Clear", action: "clear" },
    { value: 0, label: "0" },
    { value: null, label: "Enter", action: "enter" },
  ];

  return (
    <div
      className="flex flex-col items-center gap-6"
      onKeyDown={handleKeyDown}
      role="group"
      aria-label="PIN entry"
    >
      {/* PIN Display */}
      <div
        className="flex items-center justify-center gap-3 h-16"
        aria-live="polite"
        aria-atomic="true"
      >
        {Array.from({ length: maxLength }).map((_, index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-full border-2 transition-all ${
              index < pin.length
                ? "bg-blue-600 border-blue-600"
                : "bg-transparent border-gray-300"
            } ${error ? "border-red-500" : ""}`}
            aria-hidden="true"
          />
        ))}
        <span className="sr-only">
          {pin.length} of {maxLength} digits entered
        </span>
      </div>

      {/* PIN Pad */}
      <div
        className="grid grid-cols-3 gap-4"
        role="group"
        aria-label="Number pad"
      >
        {buttons.map((btn, index) => {
          if (btn.value !== null) {
            // Number button
            return (
              <motion.button
                key={btn.value}
                ref={(el) => (buttonRefs.current[index] = el)}
                onClick={() => handleNumberPress(btn.value as number)}
                disabled={disabled || pin.length >= maxLength}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className={`
                  w-16 h-16 rounded-xl text-2xl font-semibold
                  bg-white border-2 border-gray-200
                  hover:border-blue-400 hover:bg-blue-50
                  active:bg-blue-100
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-4 focus:ring-blue-300
                  transition-colors
                  ${error ? "border-red-300" : ""}
                `}
                aria-label={`Number ${btn.value}`}
                type="button"
              >
                {btn.value}
              </motion.button>
            );
          } else if (btn.action === "clear") {
            // Clear button
            return (
              <motion.button
                key="clear"
                ref={(el) => (buttonRefs.current[index] = el)}
                onClick={handleClear}
                disabled={disabled || pin.length === 0}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className={`
                  w-16 h-16 rounded-xl text-sm font-semibold
                  bg-gray-100 border-2 border-gray-200
                  hover:border-gray-400 hover:bg-gray-200
                  active:bg-gray-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-4 focus:ring-gray-300
                  transition-colors
                `}
                aria-label="Clear PIN"
                type="button"
              >
                {btn.label}
              </motion.button>
            );
          } else {
            // Enter button
            return (
              <motion.button
                key="enter"
                ref={(el) => (buttonRefs.current[index] = el)}
                onClick={onSubmit}
                disabled={disabled || pin.length !== maxLength}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className={`
                  w-16 h-16 rounded-xl text-sm font-semibold
                  bg-blue-600 text-white border-2 border-blue-600
                  hover:bg-blue-700 hover:border-blue-700
                  active:bg-blue-800
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-4 focus:ring-blue-300
                  transition-colors
                `}
                aria-label="Submit PIN"
                type="button"
              >
                {btn.label}
              </motion.button>
            );
          }
        })}
      </div>
    </div>
  );
}
