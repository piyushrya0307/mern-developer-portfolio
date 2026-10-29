import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    subject: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    messageHash: {
      type: String,
      select: false,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },

    isImportant: {
      type: Boolean,
      default: false,
    },

    expireAt: {
      type: Date,
      default: null,
    },

    replies: [
      {
        body: {
          type: String,
          required: true,
          trim: true,
        },

        sentAt: {
          type: Date,
          default: Date.now,
        },

        messageId: {
          type: String,
          default: "",
        },
      },
    ],
  },
  { timestamps: true },
);

messageSchema.index({
  email: 1,
  messageHash: 1,
  createdAt: -1,
});

// MongoDB deletes only documents with an
// expireAt date that has passed.
messageSchema.index(
  { expireAt: 1 },
  {
    expireAfterSeconds: 0,
    name: "message_retention_ttl",
  },
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
