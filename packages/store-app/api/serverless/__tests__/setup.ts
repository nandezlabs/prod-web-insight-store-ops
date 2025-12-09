/**
 * Test setup file
 * Runs before all tests
 */

import { beforeAll, afterAll } from "vitest";

beforeAll(() => {
  // Set up test environment variables
  process.env.NODE_ENV = "test";
  process.env.NOTION_API_KEY = "secret_test_key";
  process.env.DB_STORE_USERS = "test_db_users";
  process.env.DB_CHECKLISTS = "test_db_checklists";
  process.env.DB_INVENTORY = "test_db_inventory";
  process.env.DB_REPLACEMENTS = "test_db_replacements";
  process.env.DB_FORMS = "test_db_forms";
  process.env.DB_ANALYTICS_LOGS = "test_db_logs";
  process.env.JWT_SECRET = "test_jwt_secret_min_32_characters_long";
  process.env.ENCRYPTION_KEY = "test_encryption_key_exactly_32!";
  process.env.ALLOWED_ORIGINS = "http://localhost:3000,http://localhost:5173";
});

afterAll(() => {
  // Clean up
});
