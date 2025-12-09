import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
} from "@insight/ui";

const initialStores = Array.from({ length: 1000 }, (_, i) => ({
  id: `PX${1000 + i}`,
  name: `Store ${1000 + i}`,
  pin: `${1000 + i}`.slice(-4),
}));

export function StoreProfileVirtualPage() {
  const [stores] = useState(initialStores);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPin, setNewPin] = useState("");
  const [start, setStart] = useState(0);
  const pageSize = 20;

  const handleEdit = (id: string, pin: string) => {
    setEditingId(id);
    setNewPin(pin);
  };

  const handleSave = (id: string) => {
    // ...update logic...
    setEditingId(null);
    setNewPin("");
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Store Profile Management (Virtualized)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Button
              size="sm"
              onClick={() => setStart(Math.max(0, start - pageSize))}
              disabled={start === 0}
            >
              Prev
            </Button>
            <Button
              size="sm"
              onClick={() =>
                setStart(Math.min(stores.length - pageSize, start + pageSize))
              }
              disabled={start + pageSize >= stores.length}
            >
              Next
            </Button>
          </div>
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
              {stores.slice(start, start + pageSize).map((store) => (
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
