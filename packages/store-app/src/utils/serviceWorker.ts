import { Workbox } from "workbox-window";

export function registerServiceWorker(): void {
  if ("serviceWorker" in navigator) {
    const wb = new Workbox("/sw.js");

    wb.addEventListener("installed", (event) => {
      if (event.isUpdate) {
        // New service worker installed, show update notification
        if (confirm("New version available! Reload to update?")) {
          window.location.reload();
        }
      }
    });

    wb.addEventListener("activated", (event) => {
      if (!event.isUpdate) {
        console.log("Service worker activated for the first time");
      }
    });

    wb.register().catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  }
}
