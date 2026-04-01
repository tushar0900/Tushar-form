import AuditTrailService from "../services/AuditTrailService.js";

export const getAuditTrail = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await AuditTrailService.listEvents(page, limit, {
      entityType: req.query.entityType,
      action: req.query.action,
    });

    res.status(200).json({
      data: result.entries,
      currentPage: result.page,
      totalPages: Math.ceil(result.total / result.limit),
      totalEntries: result.total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
