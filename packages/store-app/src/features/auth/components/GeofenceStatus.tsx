import { useEffect, useState } from "react";
import { MapPin, MapPinOff, Loader2 } from "lucide-react";

interface GeofenceStatusProps {
  className?: string;
}

export function GeofenceStatus({ className = "" }: GeofenceStatusProps) {
  const [status, setStatus] = useState<
    "checking" | "valid" | "invalid" | "error"
  >("checking");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    checkGeolocation();
  }, []);

  const checkGeolocation = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMessage("Geolocation not supported");
      return;
    }

    setStatus("checking");

    navigator.geolocation.getCurrentPosition(
      () => {
        // Successfully got location
        // In a real app, you would verify against store boundaries here
        setStatus("valid");
      },
      () => {
        // Failed to get location
        setStatus("invalid");
        setErrorMessage("Location access denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${className}`}
      role="status"
      aria-live="polite"
    >
      {status === "checking" && (
        <>
          <Loader2
            className="w-5 h-5 text-gray-400 animate-spin"
            aria-hidden="true"
          />
          <span className="text-sm text-gray-600">Checking location...</span>
        </>
      )}

      {status === "valid" && (
        <>
          <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full">
            <MapPin className="w-3 h-3 text-white" aria-hidden="true" />
          </div>
          <span className="text-sm text-green-700 font-medium">
            Location verified
          </span>
        </>
      )}

      {status === "invalid" && (
        <>
          <div className="flex items-center justify-center w-5 h-5 bg-red-500 rounded-full">
            <MapPinOff className="w-3 h-3 text-white" aria-hidden="true" />
          </div>
          <span className="text-sm text-red-700 font-medium">
            {errorMessage || "Location not verified"}
          </span>
        </>
      )}

      {status === "error" && (
        <>
          <div className="flex items-center justify-center w-5 h-5 bg-amber-500 rounded-full">
            <MapPinOff className="w-3 h-3 text-white" aria-hidden="true" />
          </div>
          <span className="text-sm text-amber-700 font-medium">
            {errorMessage || "Location unavailable"}
          </span>
        </>
      )}
    </div>
  );
}
