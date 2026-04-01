import AuditTrail from "../models/AuditTrail.js";

class AuditTrailRepository {
  async create(auditData) {
    const auditTrail = new AuditTrail(auditData);
    return auditTrail.save();
  }

  async findAll({ page = 1, limit = 10, entityType, action }) {
    const skip = (page - 1) * limit;
    const query = {};

    if (entityType) {
      query.entityType = entityType;
    }

    if (action) {
      query.action = action;
    }

    const [entries, total] = await Promise.all([
      AuditTrail.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditTrail.countDocuments(query),
    ]);

    return { entries, total, page, limit };
  }
}

export default new AuditTrailRepository();
