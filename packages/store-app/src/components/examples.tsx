/**
 * Component Library Examples
 *
 * Comprehensive examples of all components in various configurations.
 */

import { useState } from "react";
import {
  Button,
  Input,
  Card,
  LoadingSpinner,
  ErrorMessage,
  Toast,
  ToastContainer,
  Modal,
  EmptyState,
} from "./index";
import {
  Save,
  Trash2,
  Download,
  Inbox,
  Settings,
  AlertCircle,
} from "lucide-react";

export function ComponentExamples() {
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <h1 className="text-3xl font-bold text-slate-900">Component Examples</h1>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Buttons</h2>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="md">
              Medium
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="primary" loading>
              Loading...
            </Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="primary" icon={<Save />} iconPosition="left">
              Save
            </Button>
            <Button variant="danger" icon={<Trash2 />} iconPosition="right">
              Delete
            </Button>
            <Button variant="secondary" icon={<Download />} />
          </div>

          <Button variant="primary" fullWidth>
            Full Width Button
          </Button>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Inputs</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            value=""
            onChange={() => {}}
            helperText="Include country code"
          />

          <Input
            label="Error Example"
            value=""
            onChange={() => {}}
            error="This field is required"
          />

          <Input
            label="With Counter"
            value="Hello"
            onChange={() => {}}
            maxLength={100}
          />

          <Input
            label="Disabled"
            value="Cannot edit"
            onChange={() => {}}
            disabled
          />
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Cards</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <h3 className="text-lg font-semibold mb-2">Simple Card</h3>
            <p className="text-slate-600">Basic card with just content.</p>
          </Card>

          <Card
            title="Card with Header"
            actions={<Button size="sm" variant="ghost" icon={<Settings />} />}
          >
            <p className="text-slate-600">Card with title and action button.</p>
          </Card>

          <Card hoverable onClick={() => alert("Card clicked!")}>
            <h3 className="text-lg font-semibold mb-2">Hoverable Card</h3>
            <p className="text-slate-600">Click me to see interaction!</p>
          </Card>
        </div>
      </section>

      {/* Loading Spinners */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          Loading Spinners
        </h2>

        <div className="flex flex-wrap items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-slate-600">Small</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size="md" />
            <span className="text-sm text-slate-600">Medium</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size="lg" />
            <span className="text-sm text-slate-600">Large</span>
          </div>

          <div className="flex flex-col items-center gap-2 bg-slate-900 p-4 rounded-lg">
            <LoadingSpinner size="md" color="white" />
            <span className="text-sm text-white">White</span>
          </div>
        </div>

        <Card>
          <LoadingSpinner size="lg" center label="Loading content..." />
        </Card>
      </section>

      {/* Error Messages */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          Error Messages
        </h2>

        <div className="space-y-3">
          <ErrorMessage
            message="Failed to save changes. Please try again."
            variant="filled"
            onDismiss={() => setError(null)}
          />

          <ErrorMessage
            message="Invalid email address format."
            variant="outlined"
          />

          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => setError(null)}
              autoDismiss
            />
          )}

          <Button
            variant="secondary"
            onClick={() => setError("This is an auto-dismiss error!")}
          >
            Show Auto-Dismiss Error
          </Button>
        </div>
      </section>

      {/* Toasts */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Toasts</h2>

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => setShowToast(true)}>
            Show Success Toast
          </Button>
        </div>

        {showToast && (
          <Toast
            message="Changes saved successfully!"
            variant="success"
            onClose={() => setShowToast(false)}
          />
        )}

        <Card>
          <h3 className="font-semibold mb-3">Toast Container Example</h3>
          <ToastContainer
            toasts={[
              {
                id: "1",
                message: "File uploaded",
                variant: "success",
                onClose: () => {},
              },
              {
                id: "2",
                message: "Processing data...",
                variant: "info",
                onClose: () => {},
              },
            ]}
            position="bottom-right"
          />
        </Card>
      </section>

      {/* Modals */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Modals</h2>

        <Button variant="primary" onClick={() => setShowModal(true)}>
          Open Modal
        </Button>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Confirm Action"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-500 flex-shrink-0" size={24} />
              <div>
                <p className="text-slate-900">
                  Are you sure you want to delete this item?
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  alert("Deleted!");
                  setShowModal(false);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </section>

      {/* Empty States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Empty States</h2>

        <Card>
          <EmptyState
            icon={Inbox}
            title="No messages"
            description="You don't have any messages yet. Start a conversation to get started."
            action={{
              label: "Compose Message",
              onClick: () => alert("Compose clicked!"),
            }}
          />
        </Card>

        <Card>
          <EmptyState
            icon={Settings}
            title="No settings configured"
            description="Configure your preferences to personalize your experience."
          >
            <div className="flex gap-2">
              <Button variant="primary" size="sm">
                Go to Settings
              </Button>
              <Button variant="ghost" size="sm">
                Learn More
              </Button>
            </div>
          </EmptyState>
        </Card>
      </section>

      {/* Combined Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          Combined Example
        </h2>

        <Card
          title="User Profile"
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" icon={<Settings />} />
              <Button size="sm" variant="primary">
                Edit
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input
              label="Display Name"
              value="John Doe"
              onChange={() => {}}
              helperText="This is how others will see you"
            />

            <Input
              label="Email"
              type="email"
              value="john@example.com"
              onChange={() => {}}
              disabled
            />

            <Input
              label="Bio"
              value="Software developer passionate about UX"
              onChange={() => {}}
              maxLength={200}
            />

            <div className="flex gap-3">
              <Button variant="primary" fullWidth>
                Save Changes
              </Button>
              <Button variant="ghost" fullWidth>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
