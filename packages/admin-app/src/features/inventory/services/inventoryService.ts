import axios from "axios";
import type { InventoryItem, InventoryStatus } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class InventoryService {
  /**
   * Get all inventory items
   */
  async getAllItems(): Promise<InventoryItem[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      // Return mock data for development
      return this.getMockItems();
    }
  }

  /**
   * Get inventory item by ID
   */
  async getItemById(id: string): Promise<InventoryItem | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch item:", error);
      return null;
    }
  }

  /**
   * Create new inventory item
   */
  async createItem(
    item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">
  ): Promise<InventoryItem> {
    try {
      const response = await axios.post(`${API_BASE_URL}/inventory`, item);
      return response.data;
    } catch (error) {
      console.error("Failed to create item:", error);
      throw error;
    }
  }

  /**
   * Update existing inventory item
   */
  async updateItem(
    id: string,
    item: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    try {
      const response = await axios.put(`${API_BASE_URL}/inventory/${id}`, item);
      return response.data;
    } catch (error) {
      console.error("Failed to update item:", error);
      throw error;
    }
  }

  /**
   * Delete inventory item (soft delete - set status to Pending Delete)
   */
  async deleteItem(id: string): Promise<void> {
    try {
      await axios.patch(`${API_BASE_URL}/inventory/${id}`, {
        status: "Pending Delete",
      });
    } catch (error) {
      console.error("Failed to delete item:", error);
      throw error;
    }
  }

  /**
   * Bulk delete items
   */
  async bulkDelete(ids: string[]): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/inventory/bulk-delete`, { ids });
    } catch (error) {
      console.error("Failed to bulk delete:", error);
      throw error;
    }
  }

  /**
   * Bulk update status
   */
  async bulkUpdateStatus(
    ids: string[],
    status: InventoryStatus
  ): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/inventory/bulk-status`, {
        ids,
        status,
      });
    } catch (error) {
      console.error("Failed to bulk update status:", error);
      throw error;
    }
  }

  /**
   * Upload photo
   */
  async uploadPhoto(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await axios.post(
        `${API_BASE_URL}/inventory/upload-photo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.url;
    } catch (error) {
      console.error("Failed to upload photo:", error);
      throw error;
    }
  }

  /**
   * Import items from CSV
   */
  async importItems(
    items: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">[]
  ): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/inventory/import`, { items });
    } catch (error) {
      console.error("Failed to import items:", error);
      throw error;
    }
  }

  /**
   * Export items to CSV
   */
  exportToCSV(items: InventoryItem[]): void {
    const headers = [
      "Name",
      "Code",
      "Category",
      "Type",
      "Description",
      "Status",
    ];
    const rows = items.map((item) => [
      item.name,
      item.code,
      item.category,
      item.type,
      item.description || "",
      item.status,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inventory-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Check if item code is unique
   */
  async isCodeUnique(code: string, excludeId?: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/inventory/check-code/${code}${
          excludeId ? `?exclude=${excludeId}` : ""
        }`
      );
      return response.data.isUnique;
    } catch (error) {
      console.error("Failed to check code uniqueness:", error);
      return true; // Assume unique if check fails
    }
  }

  /**
   * Mock data for development
   */
  private getMockItems(): InventoryItem[] {
    return [
      {
        id: "1",
        name: "Orange Chicken",
        code: "ENT-ORC-001",
        category: "Protein",
        type: "Entree",
        description: "Crispy chicken with orange sauce",
        status: "Active",
        createdAt: new Date("2024-01-15").toISOString(),
        updatedAt: new Date("2024-12-01").toISOString(),
      },
      {
        id: "2",
        name: "Beijing Beef",
        code: "ENT-BEF-001",
        category: "Protein",
        type: "Entree",
        description: "Crispy beef with bell peppers and onions",
        status: "Active",
        createdAt: new Date("2024-01-15").toISOString(),
        updatedAt: new Date("2024-11-20").toISOString(),
      },
      {
        id: "3",
        name: "Kung Pao Chicken",
        code: "ENT-KPC-001",
        category: "Protein",
        type: "Entree",
        description: "Spicy chicken with peanuts and vegetables",
        status: "Active",
        createdAt: new Date("2024-01-15").toISOString(),
        updatedAt: new Date("2024-12-05").toISOString(),
      },
      {
        id: "4",
        name: "Fried Rice",
        code: "SIDE-FRD-001",
        category: "Grains",
        type: "Sides",
        description: "Classic fried rice with vegetables and egg",
        status: "Active",
        createdAt: new Date("2024-01-15").toISOString(),
        updatedAt: new Date("2024-12-03").toISOString(),
      },
      {
        id: "5",
        name: "Chow Mein",
        code: "SIDE-CHM-001",
        category: "Grains",
        type: "Sides",
        description: "Stir-fried noodles with vegetables",
        status: "Active",
        createdAt: new Date("2024-01-15").toISOString(),
        updatedAt: new Date("2024-12-02").toISOString(),
      },
      {
        id: "6",
        name: "Super Greens",
        code: "SIDE-SGR-001",
        category: "Vegetables",
        type: "Sides",
        description: "Broccoli, kale, and cabbage mix",
        status: "Active",
        createdAt: new Date("2024-01-15").toISOString(),
        updatedAt: new Date("2024-12-04").toISOString(),
      },
      {
        id: "7",
        name: "Spring Roll",
        code: "APP-SPR-001",
        category: "Protein",
        type: "Appetizer",
        description: "Crispy vegetable spring rolls",
        status: "Active",
        createdAt: new Date("2024-01-15").toISOString(),
        updatedAt: new Date("2024-11-28").toISOString(),
      },
      {
        id: "8",
        name: "Rangoon",
        code: "APP-RNG-001",
        category: "Protein",
        type: "Appetizer",
        description: "Cream cheese filled wonton",
        status: "Active",
        createdAt: new Date("2024-01-15").toISOString(),
        updatedAt: new Date("2024-11-30").toISOString(),
      },
      {
        id: "9",
        name: "Fountain Drink",
        code: "BEV-FTN-001",
        category: "Beverages",
        type: "Beverage",
        description: "Soft drinks",
        status: "Active",
        createdAt: new Date("2024-01-15").toISOString(),
        updatedAt: new Date("2024-12-01").toISOString(),
      },
      {
        id: "10",
        name: "Sweet & Sour Sauce",
        code: "SAU-SWS-001",
        category: "Sauces",
        type: "Ingredient",
        description: "Classic sweet and sour sauce",
        status: "Active",
        createdAt: new Date("2024-01-15").toISOString(),
        updatedAt: new Date("2024-12-06").toISOString(),
      },
    ];
  }
}

export const inventoryService = new InventoryService();
