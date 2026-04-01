import AuditTrailRepository from "../repositories/AuditTrailRepository.js";

class AuditTrailService {
  async recordEvent(auditData) {
    try {
      return await AuditTrailRepository.create(auditData);
    } catch (error) {
      console.error("Failed to record audit trail event:", error.message);
      return null;
    }
  }

  async listEvents(page = 1, limit = 10, filters = {}) {
    return AuditTrailRepository.findAll({
      page,
      limit,
      entityType: filters.entityType || "",
      action: filters.action || "",
    });
  }
}

export default new AuditTrailService();
