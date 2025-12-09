# Component Library

Touch-optimized, accessible React components built with TailwindCSS and Framer Motion.

## Components

### 🔘 Button

Versatile button with variants, sizes, and loading states.

**Features:**

- 4 variants: primary, secondary, danger, ghost
- 3 sizes: sm (48px), md (56px), lg (64px)
- Loading state with spinner
- Icon support (left/right)
- Full-width option
- Touch feedback animation

**Usage:**

```tsx
import { Button } from '@/components';
import { Save } from 'lucide-react';

<Button variant="primary" size="lg" onClick={handleSubmit}>
  Submit Form
</Button>

<Button variant="secondary" loading>
  Saving...
</Button>

<Button variant="danger" icon={<Save />} iconPosition="left">
  Save Changes
</Button>

<Button variant="ghost" fullWidth>
  Cancel
</Button>
```

### 📝 Input

Text input with validation, error states, and character counter.

**Features:**

- Type support: text, number, email, tel
- Label and helper text
- Error state with message
- Character counter
- Clear button (X icon)
- Min height: 56px for touch

**Usage:**

```tsx
import { Input } from '@/components';

<Input
  label="Email Address"
  type="email"
  value={email}
  onChange={setEmail}
  error={errors.email}
  required
/>

<Input
  label="Bio"
  value={bio}
  onChange={setBio}
  helperText="Tell us about yourself"
  maxLength={500}
/>
```

### 🗂️ Card

Container component with optional header and hover effects.

**Features:**

- Optional title and actions
- Hover effect (elevation increase)
- Click handler for interactive cards
- Rounded corners (12px)
- Subtle shadow

**Usage:**

```tsx
import { Card, Button } from '@/components';

<Card title="User Profile" actions={<Button size="sm">Edit</Button>}>
  <p>User content here</p>
</Card>

<Card hoverable onClick={handleCardClick}>
  <h3>Clickable Card</h3>
  <p>Click anywhere to open</p>
</Card>
```

### ⏳ LoadingSpinner

Animated loading indicator with size and color variants.

**Features:**

- 3 sizes: sm (24px), md (40px), lg (64px)
- 3 colors: primary, white, gray
- Center option
- Accessible (role="status")

**Usage:**

```tsx
import { LoadingSpinner } from '@/components';

<LoadingSpinner size="lg" center />

<LoadingSpinner size="sm" color="white" label="Loading data..." />
```

### ❌ ErrorMessage

Error callout with auto-dismiss and manual close.

**Features:**

- 2 variants: filled, outlined
- Auto-dismiss after 5 seconds (optional)
- Dismiss button
- ARIA alert role

**Usage:**

```tsx
import { ErrorMessage } from '@/components';

<ErrorMessage
  message="Failed to save changes"
  onDismiss={() => setError(null)}
  autoDismiss
/>

<ErrorMessage
  message="Invalid email address"
  variant="outlined"
/>
```

### 🔔 Toast

Notification toast with auto-dismiss and animations.

**Features:**

- 4 variants: success, error, info, warning
- Auto-dismiss after 4 seconds
- Slide-in animation
- 2 positions: top-center, bottom-right
- Stack multiple toasts with ToastContainer

**Usage:**

```tsx
import { Toast, ToastContainer } from "@/components";

// Single toast
<Toast
  message="Changes saved successfully"
  variant="success"
  onClose={() => setToast(null)}
/>;

// Multiple toasts
const [toasts, setToasts] = useState([
  { id: "1", message: "File uploaded", variant: "success" },
  { id: "2", message: "Processing...", variant: "info" },
]);

<ToastContainer toasts={toasts} position="bottom-right" />;
```

### 🪟 Modal

Overlay modal dialog with animations and keyboard support.

**Features:**

- 4 sizes: sm, md, lg, full
- Close on overlay click (optional)
- Close on Escape key
- Focus trap
- Prevent body scroll
- ARIA dialog attributes

**Usage:**

```tsx
import { Modal, Button } from "@/components";

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Action"
  size="md"
>
  <p>Are you sure you want to proceed?</p>
  <div className="flex gap-2 mt-4">
    <Button variant="danger" onClick={handleConfirm}>
      Confirm
    </Button>
    <Button variant="ghost" onClick={() => setShowModal(false)}>
      Cancel
    </Button>
  </div>
</Modal>;
```

### 📭 EmptyState

Placeholder for empty data states.

**Features:**

- Icon from Lucide React
- Title and description
- Optional action button
- Custom content slot
- Centered layout

**Usage:**

```tsx
import { EmptyState } from "@/components";
import { Inbox } from "lucide-react";

<EmptyState
  icon={Inbox}
  title="No messages"
  description="You don't have any messages yet."
  action={{
    label: "Compose Message",
    onClick: handleCompose,
  }}
/>;
```

## Design Tokens

### Colors

- **Primary**: `blue-600` (#3b82f6)
- **Success**: `emerald-600` (#10b981)
- **Warning**: `amber-500` (#f59e0b)
- **Danger**: `red-600` (#ef4444)
- **Neutral**: `slate-600` (#64748b)

### Spacing

Based on 8px grid: 0, 8, 16, 24, 32, 40, 48, 56, 64...

### Border Radius

- Small: `8px`
- Medium: `12px`
- Large: `16px`

### Shadows

- Small: `shadow-sm`
- Medium: `shadow-md`
- Large: `shadow-lg`

### Transitions

- Fast: `150ms`
- Standard: `300ms`

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- ✅ Proper ARIA attributes
- ✅ Keyboard navigation support
- ✅ Focus indicators (3px ring)
- ✅ Sufficient color contrast (4.5:1 minimum)
- ✅ Touch targets ≥48×48px
- ✅ Screen reader support

## Touch Optimization

- **Minimum touch target**: 48×48px
- **Primary buttons**: 56-64px height
- **Active feedback**: Scale animation on press
- **Spacing**: Minimum 8px between interactive elements
- **Safe areas**: Padding for notched devices

## Dependencies

- `react` 18.3.1+
- `framer-motion` 12.23.25+
- `lucide-react` 0.556.0+
- `tailwindcss` 3.4.1+

## TypeScript

All components are fully typed with exported interfaces:

```tsx
import type { ButtonProps, InputProps, ModalProps } from "@/components";
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Safari (latest)
- ✅ Firefox (latest)
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android 8+)

## Examples

See `examples.tsx` for comprehensive usage examples.
