import { useState } from "react";
import { SetupPinScreen } from "./SetupPinScreen";
import { SetupStoreModal } from "./SetupStoreModal";
import { useSetupStore } from "../store/setupStore";

type SetupStep = "pin" | "store" | "complete";

export function SetupWizard() {
  const { setAdminPin, addStore, completeSetup } = useSetupStore();
  const [currentStep, setCurrentStep] = useState<SetupStep>("pin");

  const handlePinCreated = (pin: string) => {
    setAdminPin(pin);
    setCurrentStep("store");
  };

  const handleStoreCreated = (storeNumber: string, storePin: string) => {
    addStore(storeNumber, storePin);
    completeSetup();
    setCurrentStep("complete");
    // Trigger page reload to show dashboard
    window.location.reload();
  };

  if (currentStep === "pin") {
    return <SetupPinScreen onPinCreated={handlePinCreated} />;
  }

  if (currentStep === "store") {
    return <SetupStoreModal onStoreCreated={handleStoreCreated} />;
  }

  return null;
}
