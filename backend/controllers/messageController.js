import mongoose from "mongoose";
import { createHash } from "node:crypto";
import Message from "../models/msgModel.js";
import sendEmail from "../utils/sendEmail.js";

const RETENTION_DAYS = 90;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;
const DUPLICATE_WINDOW = 15 * 60 * 1000;

// POST /api/messages
export const createMessage = async (req, res) => {
  try {
    const { name, email, subject = "", message, website = "" } = req.body || {};

    // Honeypot: bots sometimes fill hidden fields
    if (website !== "") {
      return res.status(200).json({
        success: true,
        message: "Message received",
      });
    }

    // Validate required fields
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid message data",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      });
    }

    if (
      cleanName.length > 100 ||
      cleanEmail.length > 254 ||
      cleanSubject.length > 200 ||
      cleanMessage.length > 5000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields are too long",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }

    // Hash normalized subject + message
    const messageHash = createHash("sha256")
      .update(
        JSON.stringify([
          cleanSubject.toLowerCase(),
          cleanMessage.toLowerCase(),
        ]),
      )
      .digest("hex");

    const recentDuplicate = await Message.findOne({
      email: cleanEmail,
      messageHash,
      createdAt: {
        $gte: new Date(Date.now() - DUPLICATE_WINDOW),
      },
    });

    if (recentDuplicate) {
      return res.status(409).json({
        success: false,
        message: "This message was recently submitted",
      });
    }

    // Save message to MongoDB
    await Message.create({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      messageHash,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("Create message error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET /api/messages (Admin)

export const getMessages = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = req.query.filter || "all";

    const query = {};

    if (filter === "unread") {
      query.isRead = false;
    } else if (filter === "important") {
      query.isImportant = true;
    } else if (filter !== "all") {
      return res.status(400).json({
        success: false,
        message: "Invalid filter",
      });
    }

    const [messages, totalMessages, unreadCount] = await Promise.all([
      Message.find(query)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit),

      Message.countDocuments(query),

      Message.countDocuments({ isRead: false }),
    ]);

    return res.status(200).json({
      success: true,
      messages,
      unreadCount,
      pagination: {
        page,
        limit,
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
        hasNextPage: page * limit < totalMessages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get messages error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET /api/messages/:id (Admin)
export const getMessage = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Get message error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// PATCH /api/messages/:id/read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Do not restart the countdown on repeat reads
    if (!message.isRead || !message.readAt) {
      message.isRead = true;

      if (!message.readAt) {
        message.readAt = new Date();
      }
    }

    // Important messages never expire
    if (message.isImportant) {
      message.expireAt = null;
    } else if (!message.expireAt) {
      message.expireAt = new Date(message.readAt.getTime() + RETENTION_MS);
    }

    await message.save();

    return res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: message,
    });
  } catch (error) {
    console.error("Mark as read error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELETE /api/messages/:id (Admin)
export const deleteMessage = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    const deleted = await Message.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * GET /api/messages/stats
 * Private: Admin Dashboard statistics
 */
export const getMessageStats = async (req, res) => {
  try {
    const [totalMessages, unreadMessages] = await Promise.all([
      Message.countDocuments(),
      Message.countDocuments({
        isRead: false,
      }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalMessages,
        unreadMessages,
        readMessages: totalMessages - unreadMessages,
      },
    });
  } catch (error) {
    console.error("Message stats error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch message statistics",
    });
  }
};

// PATCH /api/messages/:id/important
export const setMessageImportance = async (req, res) => {
  try {
    const { id } = req.params;
    const { isImportant } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    if (typeof isImportant !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isImportant must be true or false",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    message.isImportant = isImportant;

    if (isImportant) {
      // Important messages must never expire
      message.expireAt = null;
    } else if (message.isRead) {
      // Give a fresh 90-day period when unstarred
      message.expireAt = new Date(Date.now() + RETENTION_MS);
    } else {
      // Unread messages stay protected
      message.expireAt = null;
    }

    await message.save();

    return res.status(200).json({
      success: true,
      message: isImportant
        ? "Message marked as important"
        : "Message removed from important",
      data: message,
    });
  } catch (error) {
    console.error("Update message importance error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * POST /api/messages/:id/reply
 * Private: Admin only
 */
export const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body || {};

    // Validate MongoDB ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    // Validate reply
    if (typeof reply !== "string") {
      return res.status(400).json({
        success: false,
        message: "Reply must be text",
      });
    }

    const cleanReply = reply.trim();

    if (!cleanReply || cleanReply.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Reply must contain 1 to 5000 characters",
      });
    }

    // Find original visitor message
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Create safe email subject
    const originalSubject = (message.subject || "Your enquiry")
      .replace(/[\r\n]/g, " ")
      .trim();

    const emailSubject = `Re: ${originalSubject}`;

    const emailBody = [
      `Hi ${message.name},`,
      "",
      cleanReply,
      "",
      "Best regards,",
      "Portfolio Team",
    ].join("\n");

    // Send email through Nodemailer
    const emailInfo = await sendEmail({
      to: message.email,
      subject: emailSubject,
      text: emailBody,
    });

    // Save reply only after SMTP accepts the email
    const replyRecord = {
      body: cleanReply,
      sentAt: new Date(),
      messageId: emailInfo.messageId || "",
    };

    // Atomic update avoids overwriting concurrent replies
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      {
        $push: {
          replies: replyRecord,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedMessage) {
      return res.status(500).json({
        success: false,
        message:
          "Email was accepted, but the reply history could not be saved.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reply accepted by email server",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Reply to message error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not complete email reply. Check server logs.",
    });
  }
};
