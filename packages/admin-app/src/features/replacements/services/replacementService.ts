import axios from "axios";
import type {
  ReplacementRequest,
  ReplacementPriority,
  ApprovalAction,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ReplacementService {
  /**
   * Get all replacement requests
   */
  async getAllRequests(): Promise<ReplacementRequest[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/replacements`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      return this.getMockRequests();
    }
  }

  /**
   * Get request by ID
   */
  async getRequestById(id: string): Promise<ReplacementRequest | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/replacements/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch request:", error);
      return null;
    }
  }

  /**
   * Approve request
   */
  async approveRequest(action: ApprovalAction): Promise<ReplacementRequest> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/replacements/${action.requestId}/approve`,
        {
          adminNote: action.adminNote,
          priority: action.priority,
          suggestedAlternative: action.suggestedAlternative,
        }
      );

      // Log to Analytics
      await this.logAnalytics(action.requestId, "approved");

      return response.data;
    } catch (error) {
      console.error("Failed to approve request:", error);
      throw error;
    }
  }

  /**
   * Reject request
   */
  async rejectRequest(action: ApprovalAction): Promise<ReplacementRequest> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/replacements/${action.requestId}/reject`,
        {
          adminNote: action.adminNote,
        }
      );

      // Log to Analytics
      await this.logAnalytics(action.requestId, "rejected");

      return response.data;
    } catch (error) {
      console.error("Failed to reject request:", error);
      throw error;
    }
  }

  /**
   * Update request priority
   */
  async updatePriority(
    id: string,
    priority: ReplacementPriority
  ): Promise<ReplacementRequest> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/replacements/${id}/priority`,
        {
          priority,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update priority:", error);
      throw error;
    }
  }

  /**
   * Add admin note
   */
  async addAdminNote(id: string, note: string): Promise<ReplacementRequest> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/replacements/${id}/notes`,
        {
          note,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to add note:", error);
      throw error;
    }
  }

  /**
   * Bulk approve requests
   */
  async bulkApprove(requestIds: string[], adminNote: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/replacements/bulk-approve`, {
        requestIds,
        adminNote,
      });

      // Log bulk action
      await this.logAnalytics("bulk", "approved", { count: requestIds.length });
    } catch (error) {
      console.error("Failed to bulk approve:", error);
      throw error;
    }
  }

  /**
   * Update Notion page
   */
  async updateNotionPage(
    id: string,
    updates: Partial<ReplacementRequest>
  ): Promise<void> {
    try {
      await axios.patch(`${API_BASE_URL}/notion/replacements/${id}`, updates);
    } catch (error) {
      console.error("Failed to update Notion:", error);
      throw error;
    }
  }

  /**
   * Log to Analytics & Logs database
   */
  private async logAnalytics(
    requestId: string,
    action: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/analytics/log`, {
        category: "Replacement Request",
        action,
        requestId,
        metadata,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to log analytics:", error);
    }
  }

  /**
   * Mock data for development
   */
  private getMockRequests(): ReplacementRequest[] {
    return [
      {
        id: "1",
        originalItem: "Orange Chicken",
        suggestedReplacement: "Honey Sesame Chicken",
        requestedBy: "John Manager",
        storeName: "Downtown Store",
        storeId: "store-001",
        requestDate: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: "Pending",
        priority: "High",
        reasons: [
          "Customer complaints",
          "Quality issues",
          "Better alternative available",
        ],
        additionalNotes:
          "Multiple customers have mentioned the breading gets soggy quickly. The suggested replacement has better reviews.",
        photoUrls: [
          "https://placehold.co/600x400/orange/white?text=Orange+Chicken",
          "https://placehold.co/600x400/amber/white?text=Quality+Issue",
        ],
        adminNotes: [],
        statusHistory: [
          {
            id: "h1",
            status: "Pending",
            changedBy: "System",
            changedAt: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ],
      },
      {
        id: "2",
        originalItem: "Beef Broccoli",
        suggestedReplacement: "Shanghai Angus Steak",
        requestedBy: "Sarah Manager",
        storeName: "Westside Mall",
        storeId: "store-002",
        requestDate: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: "Pending",
        priority: "Urgent",
        reasons: ["Low sales", "High waste", "Competitor has better option"],
        additionalNotes:
          "Sales dropped 40% this quarter. Nearby competitor introduced premium beef dish that customers prefer.",
        photoUrls: [
          "https://placehold.co/600x400/green/white?text=Sales+Report",
        ],
        adminNotes: [
          {
            id: "n1",
            content: "Need to review cost analysis before approval",
            createdBy: "Admin User",
            createdAt: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ],
        statusHistory: [
          {
            id: "h2",
            status: "Pending",
            changedBy: "System",
            changedAt: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ],
      },
      {
        id: "3",
        originalItem: "Fried Rice",
        requestedBy: "Mike Manager",
        storeName: "Airport Location",
        storeId: "store-003",
        requestDate: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: "Pending",
        priority: "Medium",
        reasons: ["Portion size complaints", "Ingredient availability"],
        additionalNotes:
          "Customers say portion too small for price. Also having issues with rice supplier.",
        photoUrls: [],
        adminNotes: [],
        statusHistory: [
          {
            id: "h3",
            status: "Pending",
            changedBy: "System",
            changedAt: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ],
      },
      {
        id: "4",
        originalItem: "Chow Mein",
        suggestedReplacement: "Lo Mein",
        requestedBy: "Lisa Manager",
        storeName: "University District",
        storeId: "store-004",
        requestDate: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: "Approved",
        priority: "Medium",
        reasons: ["Customer preference", "Regional demand"],
        additionalNotes:
          "Students consistently ask for lo mein instead of chow mein.",
        photoUrls: [],
        adminNotes: [
          {
            id: "n2",
            content: "Approved. Roll out in Q1 2025.",
            createdBy: "Admin User",
            createdAt: new Date(
              Date.now() - 8 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ],
        reviewedBy: "Admin User",
        reviewDate: new Date(
          Date.now() - 8 * 24 * 60 * 60 * 1000
        ).toISOString(),
        statusHistory: [
          {
            id: "h4a",
            status: "Pending",
            changedBy: "System",
            changedAt: new Date(
              Date.now() - 10 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            id: "h4b",
            status: "Approved",
            changedBy: "Admin User",
            changedAt: new Date(
              Date.now() - 8 * 24 * 60 * 60 * 1000
            ).toISOString(),
            note: "Good business case",
          },
        ],
      },
      {
        id: "5",
        originalItem: "Spring Rolls",
        suggestedReplacement: "Chicken Egg Rolls",
        requestedBy: "Tom Manager",
        storeName: "Suburban Plaza",
        storeId: "store-005",
        requestDate: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: "Rejected",
        priority: "Low",
        reasons: ["Personal preference"],
        additionalNotes: "Just think egg rolls would sell better.",
        photoUrls: [],
        adminNotes: [
          {
            id: "n3",
            content:
              "Rejected. Spring rolls are performing well corporately. No data to support change.",
            createdBy: "Admin User",
            createdAt: new Date(
              Date.now() - 14 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ],
        reviewedBy: "Admin User",
        reviewDate: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
        statusHistory: [
          {
            id: "h5a",
            status: "Pending",
            changedBy: "System",
            changedAt: new Date(
              Date.now() - 15 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            id: "h5b",
            status: "Rejected",
            changedBy: "Admin User",
            changedAt: new Date(
              Date.now() - 14 * 24 * 60 * 60 * 1000
            ).toISOString(),
            note: "Insufficient justification",
          },
        ],
      },
    ];
  }
}

export const replacementService = new ReplacementService();
