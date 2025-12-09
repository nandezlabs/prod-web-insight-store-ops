import { Card, CardHeader, CardContent } from "@insight/ui";
import { Button } from "@insight/ui";
import { useNavigate } from "react-router-dom";
import { Store, MapPin } from "lucide-react";

const stores = [
  {
    id: "1",
    name: "Downtown Store",
    address: "123 Main St, City",
    manager: "John Doe",
    status: "active",
  },
  {
    id: "2",
    name: "Suburban Store",
    address: "456 Oak Ave, Town",
    manager: "Jane Smith",
    status: "active",
  },
  {
    id: "3",
    name: "Mall Location",
    address: "789 Plaza Blvd, City",
    manager: "Bob Johnson",
    status: "inactive",
  },
];

  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stores</h1>
        <div className="flex gap-2">
          <Button>Add Store</Button>
          <Button variant="outline" onClick={() => navigate("/stores/profile")}>Manage Store PINs</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store) => (
          <Card key={store.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <Store className="w-8 h-8 text-primary" />
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    store.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {store.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-2">{store.name}</h3>
              <div className="space-y-1 text-sm text-muted-foreground mb-4">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {store.address}
                </p>
                <p>Manager: {store.manager}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
