# Component Library - Quick Start

## Installation

All dependencies are already installed:

- ✅ `framer-motion` 12.23.25
- ✅ `lucide-react` 0.556.0
- ✅ `tailwindcss` 3.4.1

## Import Components

```tsx
// Import specific components
import { Button, Input, Card } from "@/components";

// Import with types
import { Button, type ButtonProps } from "@/components";

// Import all
import * as Components from "@/components";
```

## Quick Examples

### Button

```tsx
import { Button } from '@/components';
import { Save } from 'lucide-react';

// Primary action
<Button variant="primary" onClick={handleSave}>
  Save Changes
</Button>

// With icon
<Button variant="secondary" icon={<Save />} iconPosition="left">
  Save Draft
</Button>

// Loading state
<Button variant="primary" loading disabled>
  Saving...
</Button>

// Icon-only
<Button variant="ghost" icon={<Save />} />
```

### Input

```tsx
import { Input } from "@/components";

const [email, setEmail] = useState("");

<Input
  label="Email Address"
  type="email"
  value={email}
  onChange={setEmail}
  error={errors.email}
  required
/>;
```

### Card

```tsx
import { Card, Button } from "@/components";

<Card title="User Settings" actions={<Button size="sm">Edit</Button>}>
  <p>Your account settings</p>
</Card>;
```

### Modal

```tsx
import { Modal, Button } from '@/components';

const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>
  Open Dialog
</Button>

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm"
>
  <p>Are you sure?</p>
  <Button onClick={() => setIsOpen(false)}>
    Confirm
  </Button>
</Modal>
```

### Toast

```tsx
import { Toast } from "@/components";

const [toast, setToast] = useState(null);

{
  toast && (
    <Toast
      message="Saved successfully!"
      variant="success"
      onClose={() => setToast(null)}
    />
  );
}

// Trigger
<Button onClick={() => setToast(true)}>Show Toast</Button>;
```

### Empty State

```tsx
import { EmptyState } from "@/components";
import { Inbox } from "lucide-react";

<EmptyState
  icon={Inbox}
  title="No items"
  description="Start by adding your first item"
  action={{
    label: "Add Item",
    onClick: handleAdd,
  }}
/>;
```

## Common Patterns

### Form with Validation

```tsx
import { Input, Button, ErrorMessage } from "@/components";

function MyForm() {
  const [data, setData] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.submit(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
          autoDismiss
        />
      )}

      <Input
        label="Name"
        value={data.name}
        onChange={(v) => setData({ ...data, name: v })}
        error={errors.name}
        required
      />

      <Input
        label="Email"
        type="email"
        value={data.email}
        onChange={(v) => setData({ ...data, email: v })}
        error={errors.email}
        required
      />

      <Button
        variant="primary"
        onClick={handleSubmit}
        loading={loading}
        fullWidth
      >
        Submit
      </Button>
    </div>
  );
}
```

### Confirmation Dialog

```tsx
import { Modal, Button } from "@/components";
import { AlertCircle } from "lucide-react";

function DeleteConfirmation({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Delete">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <p className="font-medium">Delete this item?</p>
            <p className="text-sm text-slate-600">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

### Loading State

```tsx
import { Card, LoadingSpinner } from "@/components";

function DataCard({ data, loading }) {
  if (loading) {
    return (
      <Card>
        <LoadingSpinner size="lg" center label="Loading data..." />
      </Card>
    );
  }

  return (
    <Card title="Data">
      <p>{data}</p>
    </Card>
  );
}
```

### Toast Notifications

```tsx
import { ToastContainer } from "@/components";
import { useState } from "react";

function App() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, variant = "info") => {
    const id = Date.now().toString();
    setToasts([...toasts, { id, message, variant }]);
  };

  const removeToast = (id) => {
    setToasts(toasts.filter((t) => t.id !== id));
  };

  return (
    <>
      {/* Your app content */}

      <ToastContainer
        toasts={toasts.map((t) => ({
          ...t,
          onClose: () => removeToast(t.id),
        }))}
        position="bottom-right"
      />
    </>
  );
}
```

## Styling

All components use TailwindCSS. Customize via:

1. **Extend in tailwind.config.js**:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#your-color",
      },
    },
  },
};
```

2. **Override with className prop** (where available):

```tsx
<Card className="border-2 border-blue-500">Custom styles</Card>
```

## Accessibility

All components are accessible by default:

- ✅ ARIA attributes
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Screen reader support

Test with:

- Tab through interactive elements
- Use screen reader (VoiceOver, NVDA)
- Verify focus states are visible

## See Also

- `README.md` - Full component documentation
- `examples.tsx` - Live examples of all components
