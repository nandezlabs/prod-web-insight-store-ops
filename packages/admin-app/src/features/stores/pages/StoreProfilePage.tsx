import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
} from "@insight/ui";

// Dummy data for stores and PINs
const initialStores = [
  { id: "PX1001", name: "Store 1001", pin: "1234" },
  { id: "PX1002", name: "Store 1002", pin: "5678" },
];

export function StoreProfilePage() {
  const [stores, setStores] = useState(initialStores);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPin, setNewPin] = useState("");

  const handleEdit = (id: string, pin: string) => {
    setEditingId(id);
    setNewPin(pin);
  };

  const handleSave = (id: string) => {
    setStores((prev) =>
      prev.map((store) => (store.id === id ? { ...store, pin: newPin } : store))
    );
    setEditingId(null);
    setNewPin("");
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Store Profile Management</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2">Store ID</th>
                <th className="py-2">Name</th>
                <th className="py-2">PIN</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-b">
                  <td className="py-2 font-mono">{store.id}</td>
                  <td className="py-2">{store.name}</td>
                  <td className="py-2">
                    {editingId === store.id ? (
                      <Input
                        value={newPin}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewPin(e.target.value)
                        }
                        className="w-24"
                        maxLength={4}
                        pattern="\d{4}"
                        inputMode="numeric"
                      />
                    ) : (
                      <span className="font-semibold tracking-widest">
                        {store.pin}
                      </span>
                    )}
                  </td>
                  <td className="py-2">
                    {editingId === store.id ? (
                      <Button size="sm" onClick={() => handleSave(store.id)}>
                        Save
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(store.id, store.pin)}
                      >
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
