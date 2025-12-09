import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@insight/ui";
import { StoreListSkeleton } from "../components/StoreListSkeleton";

const stores = [
  // ...existing store data...
];

export function StoresPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<typeof stores>([]);

  useEffect(() => {
    // Simulate async fetch
    setTimeout(() => {
      setData(stores);
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return <StoreListSkeleton />;
  }

  return (
    <div className="space-y-6">{/* ...existing header and grid code... */}</div>
  );
}
