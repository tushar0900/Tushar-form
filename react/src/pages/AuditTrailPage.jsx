import { useEffect, useState } from "react";
import api from "../lib/api";
import { formatDateTime } from "../lib/formatters";

const ACTION_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "login", label: "Login" },
  { value: "change_password", label: "Change Password" },
  { value: "bootstrap", label: "Bootstrap" },
];

const ENTITY_OPTIONS = [
  { value: "", label: "All Areas" },
  { value: "employee", label: "Employee" },
  { value: "salary", label: "Salary" },
  { value: "user", label: "User" },
  { value: "auth", label: "Auth" },
];

const formatLabel = (value = "") =>
  value
    .split("_")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const formatAuditValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return formatDateTime(value);
  }

  if (Array.isArray(value) || typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

async function fetchAuditTrail(page, action, entityType) {
  const response = await api.get("/audit-trail", {
    params: {
      page,
      limit: 10,
      action: action || undefined,
      entityType: entityType || undefined,
    },
  });

  return response.data;
}

function AuditTrailPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setSelectedEntry(null);

    const run = async () => {
      try {
        const result = await fetchAuditTrail(page, actionFilter, entityFilter);

        if (!isMounted) {
          return;
        }

        setEntries(result.data || []);
        setTotalPages(result.totalPages || 1);
        setTotalEntries(result.totalEntries || 0);
        setError("");
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.message || "Failed to load audit trail"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [page, actionFilter, entityFilter]);

  const handleActionChange = (event) => {
    setActionFilter(event.target.value);
    setPage(1);
  };

  const handleEntityChange = (event) => {
    setEntityFilter(event.target.value);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="screen-state">
        <p>Loading audit trail...</p>
      </div>
    );
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Super Admin</span>
          <h1>Audit Trail</h1>
          <p>Review security and data-change events across the Employee Payroll System workspace.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="two-column-layout">
        <section className="page-panel">
          <div className="panel-heading">
            <div>
              <h2>Event Feed</h2>
              <p>Filter by action or area to narrow the trail.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="actionFilter">Action</label>
              <select
                id="actionFilter"
                value={actionFilter}
                onChange={handleActionChange}
              >
                {ACTION_OPTIONS.map((option) => (
                  <option key={option.value || "all-actions"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="entityFilter">Area</label>
              <select
                id="entityFilter"
                value={entityFilter}
                onChange={handleEntityChange}
              >
                {ENTITY_OPTIONS.map((option) => (
                  <option key={option.value || "all-entities"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Summary</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {entries.length > 0 ? (
                  entries.map((entry) => (
                    <tr key={entry._id}>
                      <td data-label="When">{formatDateTime(entry.createdAt)}</td>
                      <td data-label="Actor">
                        <strong>{entry.actor?.name || "System"}</strong>
                        <span className="table-meta">
                          {entry.actor?.email || entry.actor?.role || "-"}
                        </span>
                      </td>
                      <td data-label="Action">
                        <strong>{formatLabel(entry.action)}</strong>
                        <span className="table-meta">{formatLabel(entry.entityType)}</span>
                      </td>
                      <td data-label="Target">{entry.entityLabel || "-"}</td>
                      <td data-label="Summary">
                        <strong>{entry.summary}</strong>
                        <span className="table-meta">
                          {entry.changes?.length
                            ? `${entry.changes.length} field changes`
                            : "No field diff"}
                        </span>
                      </td>
                      <td data-label="Details">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      No audit events found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-bar">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setPage((currentPage) => currentPage - 1)}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </section>

        <aside className="page-panel page-panel-accent">
          <div className="panel-heading">
            <div>
              <h2>Coverage</h2>
              <p>What this trail captures right now.</p>
            </div>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <span>Total Events</span>
              <strong>{totalEntries}</strong>
              <p>Filtered result count across all pages.</p>
            </div>
            <div className="stat-card">
              <span>Filters</span>
              <strong>
                {formatLabel(entityFilter || "all")} / {formatLabel(actionFilter || "all")}
              </strong>
              <p>Current view of the event stream.</p>
            </div>
          </div>

          <ul className="bullet-list">
            <li>Employee, salary, and user create, update, and delete events are logged.</li>
            <li>Successful sign-ins and password changes are logged as security events.</li>
            <li>Password values are never stored in the audit trail.</li>
            <li>Each event keeps actor, target, summary, IP address, and user agent metadata.</li>
          </ul>
        </aside>
      </div>

      {selectedEntry ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="panel-heading">
              <div>
                <h2>Audit Event Details</h2>
                <p>{selectedEntry.summary}</p>
              </div>
            </div>

            <div className="details-grid">
              <div>
                <span>Actor</span>
                <strong>{selectedEntry.actor?.name || "System"}</strong>
              </div>
              <div>
                <span>Actor Role</span>
                <strong>{formatLabel(selectedEntry.actor?.role || "system")}</strong>
              </div>
              <div>
                <span>Action</span>
                <strong>{formatLabel(selectedEntry.action)}</strong>
              </div>
              <div>
                <span>Area</span>
                <strong>{formatLabel(selectedEntry.entityType)}</strong>
              </div>
              <div>
                <span>Target</span>
                <strong>{selectedEntry.entityLabel || "-"}</strong>
              </div>
              <div>
                <span>Recorded At</span>
                <strong>{formatDateTime(selectedEntry.createdAt)}</strong>
              </div>
              <div>
                <span>IP Address</span>
                <strong>{selectedEntry.metadata?.ipAddress || "-"}</strong>
              </div>
              <div>
                <span>User Agent</span>
                <strong>{selectedEntry.metadata?.userAgent || "-"}</strong>
              </div>
            </div>

            {selectedEntry.changes?.length ? (
              <>
                <div className="panel-heading">
                  <div>
                    <h2>Changed Fields</h2>
                    <p>Safe field-level audit diff for this event.</p>
                  </div>
                </div>

                <div className="table-shell">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Before</th>
                        <th>After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEntry.changes.map((change) => (
                        <tr key={`${selectedEntry._id}-${change.field}`}>
                          <td data-label="Field">{change.field}</td>
                          <td data-label="Before">{formatAuditValue(change.from)}</td>
                          <td data-label="After">{formatAuditValue(change.to)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="empty-state-card">
                <p>No field-level diff was stored for this event.</p>
              </div>
            )}

            <div className="button-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSelectedEntry(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AuditTrailPage;
