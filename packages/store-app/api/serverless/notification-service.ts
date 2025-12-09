/**
 * Notification Service
 * Handles notification creation and delivery for various events
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_NOTIFICATIONS = process.env.NOTION_DB_NOTIFICATIONS || "";

export interface NotificationPayload {
  type:
    | "task_assigned"
    | "form_submitted"
    | "comment_mention"
    | "message_received"
    | "system_alert";
  title: string;
  message: string;
  recipientType: "user" | "store" | "role";
  recipientValue: string;
  priority?: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdBy: string;
}

/**
 * Create a notification
 */
export async function createNotification(
  payload: NotificationPayload
): Promise<string> {
  try {
    const {
      type,
      title,
      message,
      recipientType,
      recipientValue,
      priority = "medium",
      actionUrl,
      metadata = {},
      createdBy,
    } = payload;

    const page = await notion.pages.create({
      parent: { database_id: DB_NOTIFICATIONS },
      properties: {
        Type: { select: { name: type } },
        Title: { title: [{ text: { content: title } }] },
        Message: { rich_text: [{ text: { content: message } }] },
        RecipientType: { select: { name: recipientType } },
        RecipientValue: { rich_text: [{ text: { content: recipientValue } }] },
        Priority: { select: { name: priority } },
        Status: { select: { name: "unread" } },
        ActionUrl: actionUrl ? { url: actionUrl } : { url: "" },
        Metadata: {
          rich_text: [{ text: { content: JSON.stringify(metadata) } }],
        },
        CreatedBy: { rich_text: [{ text: { content: createdBy } }] },
        CreatedAt: { date: { start: new Date().toISOString() } },
      },
    });

    return page.id;
  } catch (error) {
    console.error("Create notification error:", error);
    throw error;
  }
}

/**
 * Notify when a task is assigned
 */
export async function notifyTaskAssigned(params: {
  taskId: string;
  taskTitle: string;
  assignedTo: string;
  assignedBy: string;
  storeId: string;
  dueDate?: string;
}) {
  const { taskId, taskTitle, assignedTo, assignedBy, storeId, dueDate } =
    params;

  const message = dueDate
    ? `You have been assigned a new task: "${taskTitle}". Due: ${new Date(
        dueDate
      ).toLocaleDateString()}`
    : `You have been assigned a new task: "${taskTitle}"`;

  await createNotification({
    type: "task_assigned",
    title: "New Task Assignment",
    message,
    recipientType: "user",
    recipientValue: assignedTo,
    priority: "medium",
    actionUrl: `/tasks/${taskId}`,
    metadata: { taskId, storeId, dueDate },
    createdBy: assignedBy,
  });
}

/**
 * Notify when a form is submitted
 */
export async function notifyFormSubmitted(params: {
  formId: string;
  formTitle: string;
  submittedBy: string;
  storeId: string;
  storeName: string;
}) {
  const { formId, formTitle, submittedBy, storeId, storeName } = params;

  await createNotification({
    type: "form_submitted",
    title: "Form Submitted",
    message: `${storeName} submitted "${formTitle}"`,
    recipientType: "role",
    recipientValue: "admin",
    priority: "low",
    actionUrl: `/forms/${formId}`,
    metadata: { formId, storeId, submittedBy },
    createdBy: submittedBy,
  });
}

/**
 * Notify when mentioned in a comment
 */
export async function notifyCommentMention(params: {
  commentId: string;
  mentionedUserId: string;
  mentionedBy: string;
  mentionedByName: string;
  context: string;
  contextUrl: string;
}) {
  const {
    commentId,
    mentionedUserId,
    mentionedBy,
    mentionedByName,
    context,
    contextUrl,
  } = params;

  await createNotification({
    type: "comment_mention",
    title: "You were mentioned",
    message: `${mentionedByName} mentioned you in a comment: "${context}"`,
    recipientType: "user",
    recipientValue: mentionedUserId,
    priority: "medium",
    actionUrl: contextUrl,
    metadata: { commentId, mentionedBy },
    createdBy: mentionedBy,
  });
}

/**
 * Notify when a message is received
 */
export async function notifyMessageReceived(params: {
  messageId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  preview: string;
  conversationId: string;
}) {
  const {
    messageId,
    senderId,
    senderName,
    recipientId,
    preview,
    conversationId,
  } = params;

  await createNotification({
    type: "message_received",
    title: `Message from ${senderName}`,
    message: preview,
    recipientType: "user",
    recipientValue: recipientId,
    priority: "medium",
    actionUrl: `/messages/${conversationId}`,
    metadata: { messageId, senderId, conversationId },
    createdBy: senderId,
  });
}

/**
 * Send system alert to all admins
 */
export async function notifySystemAlert(params: {
  title: string;
  message: string;
  priority?: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
}) {
  const { title, message, priority = "high", actionUrl } = params;

  await createNotification({
    type: "system_alert",
    title,
    message,
    recipientType: "role",
    recipientValue: "admin",
    priority,
    actionUrl,
    metadata: {},
    createdBy: "system",
  });
}

/**
 * Send notification to specific store
 */
export async function notifyStore(params: {
  storeId: string;
  title: string;
  message: string;
  type:
    | "task_assigned"
    | "form_submitted"
    | "comment_mention"
    | "message_received"
    | "system_alert";
  priority?: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdBy: string;
}) {
  const {
    storeId,
    title,
    message,
    type,
    priority = "medium",
    actionUrl,
    metadata = {},
    createdBy,
  } = params;

  await createNotification({
    type,
    title,
    message,
    recipientType: "store",
    recipientValue: storeId,
    priority,
    actionUrl,
    metadata,
    createdBy,
  });
}

/**
 * Batch create notifications
 */
export async function batchCreateNotifications(
  notifications: NotificationPayload[]
): Promise<string[]> {
  try {
    const results = await Promise.all(
      notifications.map((notification) => createNotification(notification))
    );
    return results;
  } catch (error) {
    console.error("Batch create notifications error:", error);
    throw error;
  }
}
