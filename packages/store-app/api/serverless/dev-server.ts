/**
 * Local Development Server for Serverless Functions
 *
 * Runs serverless functions locally without requiring Vercel/Netlify authentication
 * Usage: npx tsx dev-server.ts
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8888;

// Middleware
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("🔧 Loading serverless functions...\n");

// Import serverless functions dynamically
const functions: Record<string, any> = {
  "auth-login": await import("./auth-login.ts"),
  "auth-logout": await import("./auth-logout.ts"),
  "auth-validate": await import("./auth-validate.ts"),
  "store-checklist": await import("./store-checklist.ts"),
  "store-inventory": await import("./store-inventory.ts"),
  "store-replacement": await import("./store-replacement.ts"),
  "admin-dashboard": await import("./admin-dashboard.ts"),
  "admin-force-logout": await import("./admin-force-logout.ts"),
  "admin-forms": await import("./admin-forms.ts"),
  "admin-users": await import("./admin-users.ts"),
  "admin-users-bulk": await import("./admin-users-bulk.ts"),
  "admin-user-activity": await import("./admin-user-activity.ts"),
  "admin-pin-reset": await import("./admin-pin-reset.ts"),
  "admin-stores": await import("./admin-stores.ts"),
  "admin-stores-bulk": await import("./admin-stores-bulk.ts"),
  "admin-financials": await import("./admin-financials.ts"),
  "admin-financial-reports": await import("./admin-financial-reports.ts"),
  "admin-tasks": await import("./admin-tasks.ts"),
  "store-tasks": await import("./store-tasks.ts"),
  "admin-notifications": await import("./admin-notifications.ts"),
  "store-notifications": await import("./store-notifications.ts"),
  comments: await import("./comments.ts"),
  messages: await import("./messages.ts"),
};

// Helper to create serverless-compatible request/response
function createServerlessHandler(handler: any) {
  return async (req: express.Request, res: express.Response) => {
    try {
      // Create serverless-compatible request object
      const event = {
        httpMethod: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body),
        queryStringParameters: req.query,
        path: req.path,
      };

      // Call the serverless handler
      await handler(event, res);
    } catch (error) {
      console.error("Handler error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  };
}

// Route mapping
const routes = [
  { method: "POST", path: "/api/auth/login", handler: "auth-login" },
  { method: "POST", path: "/api/auth/logout", handler: "auth-logout" },
  { method: "GET", path: "/api/auth/validate", handler: "auth-validate" },
  { method: "POST", path: "/api/auth/validate", handler: "auth-validate" },
  { method: "GET", path: "/api/store/checklist", handler: "store-checklist" },
  { method: "POST", path: "/api/store/checklist", handler: "store-checklist" },
  { method: "GET", path: "/api/store/inventory", handler: "store-inventory" },
  {
    method: "POST",
    path: "/api/store/replacement",
    handler: "store-replacement",
  },
  { method: "GET", path: "/api/admin/dashboard", handler: "admin-dashboard" },
  {
    method: "POST",
    path: "/api/admin/force-logout",
    handler: "admin-force-logout",
  },
  { method: "GET", path: "/api/admin/forms", handler: "admin-forms" },
  { method: "POST", path: "/api/admin/forms", handler: "admin-forms" },
  { method: "GET", path: "/api/admin/users", handler: "admin-users" },
  { method: "POST", path: "/api/admin/users", handler: "admin-users" },
  { method: "PUT", path: "/api/admin/users", handler: "admin-users" },
  { method: "DELETE", path: "/api/admin/users", handler: "admin-users" },
  {
    method: "POST",
    path: "/api/admin/users/bulk",
    handler: "admin-users-bulk",
  },
  {
    method: "GET",
    path: "/api/admin/user-activity",
    handler: "admin-user-activity",
  },
  { method: "POST", path: "/api/admin/pin-reset", handler: "admin-pin-reset" },
  { method: "GET", path: "/api/admin/stores", handler: "admin-stores" },
  { method: "POST", path: "/api/admin/stores", handler: "admin-stores" },
  { method: "PUT", path: "/api/admin/stores", handler: "admin-stores" },
  { method: "DELETE", path: "/api/admin/stores", handler: "admin-stores" },
  {
    method: "POST",
    path: "/api/admin/stores/bulk",
    handler: "admin-stores-bulk",
  },
  { method: "GET", path: "/api/admin/financials", handler: "admin-financials" },
  {
    method: "POST",
    path: "/api/admin/financials",
    handler: "admin-financials",
  },
  { method: "PUT", path: "/api/admin/financials", handler: "admin-financials" },
  {
    method: "DELETE",
    path: "/api/admin/financials",
    handler: "admin-financials",
  },
  {
    method: "GET",
    path: "/api/admin/financial-reports",
    handler: "admin-financial-reports",
  },
  { method: "GET", path: "/api/admin/tasks", handler: "admin-tasks" },
  { method: "POST", path: "/api/admin/tasks", handler: "admin-tasks" },
  { method: "PUT", path: "/api/admin/tasks", handler: "admin-tasks" },
  { method: "DELETE", path: "/api/admin/tasks", handler: "admin-tasks" },
  { method: "GET", path: "/api/store/tasks", handler: "store-tasks" },
  { method: "PUT", path: "/api/store/tasks", handler: "store-tasks" },
  {
    method: "GET",
    path: "/api/admin/notifications",
    handler: "admin-notifications",
  },
  {
    method: "POST",
    path: "/api/admin/notifications",
    handler: "admin-notifications",
  },
  {
    method: "PUT",
    path: "/api/admin/notifications",
    handler: "admin-notifications",
  },
  {
    method: "DELETE",
    path: "/api/admin/notifications",
    handler: "admin-notifications",
  },
  {
    method: "GET",
    path: "/api/store/notifications",
    handler: "store-notifications",
  },
  {
    method: "PUT",
    path: "/api/store/notifications",
    handler: "store-notifications",
  },
  { method: "GET", path: "/api/comments", handler: "comments" },
  { method: "POST", path: "/api/comments", handler: "comments" },
  { method: "PUT", path: "/api/comments", handler: "comments" },
  { method: "DELETE", path: "/api/comments", handler: "comments" },
  { method: "GET", path: "/api/messages", handler: "messages" },
  { method: "POST", path: "/api/messages", handler: "messages" },
  { method: "PUT", path: "/api/messages", handler: "messages" },
  { method: "DELETE", path: "/api/messages", handler: "messages" },
];

// Register routes
routes.forEach(({ method, path, handler }) => {
  const fn = functions[handler]?.default || functions[handler]?.handler;
  if (fn) {
    app[method.toLowerCase()](path, createServerlessHandler(fn));
    console.log(`✅ ${method.padEnd(6)} ${path}`);
  } else {
    console.log(`⚠️  ${method.padEnd(6)} ${path} - Handler not found`);
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Serverless functions are running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path,
    method: req.method,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `\n🚀 Local serverless functions running at http://localhost:${PORT}`
  );
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `\n💡 Update your .env files to use: VITE_API_URL=http://localhost:${PORT}/api\n`
  );
});
