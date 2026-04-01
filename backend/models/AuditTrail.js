import mongoose from "mongoose";

const auditActorSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: null,
      trim: true,
    },
    role: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { _id: false }
);

const auditChangeSchema = new mongoose.Schema(
  {
    field: {
      type: String,
      required: true,
      trim: true,
    },
    from: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    to: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false }
);

const auditMetadataSchema = new mongoose.Schema(
  {
    ipAddress: {
      type: String,
      default: null,
      trim: true,
    },
    userAgent: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { _id: false }
);

const auditTrailSchema = new mongoose.Schema(
  {
    actor: {
      type: auditActorSchema,
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: String,
      default: null,
      trim: true,
    },
    entityLabel: {
      type: String,
      default: null,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    changes: {
      type: [auditChangeSchema],
      default: [],
    },
    metadata: {
      type: auditMetadataSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

auditTrailSchema.index({ createdAt: -1 });
auditTrailSchema.index({ entityType: 1, createdAt: -1 });
auditTrailSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model("AuditTrail", auditTrailSchema);
