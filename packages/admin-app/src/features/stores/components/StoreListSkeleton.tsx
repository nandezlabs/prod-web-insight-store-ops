import { Card, CardHeader, CardTitle, CardContent } from "@insight/ui";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function StoreListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>
              <Skeleton width={120} height={24} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton count={3} height={18} style={{ marginBottom: 8 }} />
            <Skeleton width={80} height={32} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
