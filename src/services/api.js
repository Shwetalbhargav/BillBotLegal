// src/services/api.js
import apiClient from './interceptors'

// ---------- helpers ----------
const qs = (params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.append(k, v);
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
};

// Generic CRUD helper for resource-relative routers mounted as /api/<resource>
const crudResource = (base) => ({
  create: (payload) => apiClient.post(base, payload),
  list: (params = {}) => apiClient.get(`${base}${qs(params)}`),
  getById: (id) => apiClient.get(`${base}/${id}`),
  update: (id, payload) => apiClient.put(`${base}/${id}`, payload),
  remove: (id) => apiClient.delete(`${base}/${id}`),
});

// ========== AUTH ==========
export const loginUser = (credentials) =>
  apiClient.post("/api/auth/login", credentials);

export const registerUser = (data) =>
  apiClient.post("/api/auth/register", data);

// ========== ADMIN AUTH / PROFILE ==========
export const loginAdmin = (credentials) =>
  apiClient.post("/api/admin/login", credentials); 

export const getAdminMe = () =>
  apiClient.get("/api/admin/me");

export const updateAdminMe = (payload) =>
  apiClient.patch("/api/admin/me", payload);

// Full CRUD over Admin profiles
export const createAdminApi = (payload) =>
  apiClient.post("/api/admin", payload);         

export const listAdminsApi = (params = {}) =>
  apiClient.get(`/api/admin${qs(params)}`);     

export const getAdminByIdApi = (id) =>
  apiClient.get(`/api/admin/${id}`);              

export const updateAdminByIdApi = (id, payload) =>
  apiClient.patch(`/api/admin/${id}`, payload);   

export const deleteAdminByIdApi = (id) =>
  apiClient.delete(`/api/admin/${id}`);          

export const getAdminDashboard = () =>
  apiClient.get("/api/admin/dashboard");

// ========== USERS ==========
export const createUser = (payload) =>
  apiClient.post("/api/users", payload);

export const updateUser = (id, payload) =>
  apiClient.put(`/api/users/${id}`, payload);

export const deleteUser = (id) =>
  apiClient.delete(`/api/users/${id}`);

export const listUsers = (params = {}) =>
  apiClient.get(`/api/users${qs(params)}`);

export const getMe = () =>
  apiClient.get("/api/users/me");

// GET /api/users/:id
export const getUserById = (id) =>
  apiClient.get(`/api/users/${id}`);

// GET /api/users/:id/profile
export const getUserProfileApi = (id) =>
  apiClient.get(`/api/users/${id}/profile`);

// PUT /api/users/:id/profile
export const upsertUserProfileApi = (id, payload) =>
  apiClient.put(`/api/users/${id}/profile`, payload);

// GET /api/users/:id/default-rate
export const getUserDefaultRateApi = (id) =>
  apiClient.get(`/api/users/${id}/default-rate`);

// GET /api/users/me/self
export const getMyScopesApi = () =>
  apiClient.get("/api/users/me/self");

// (No PUT /api/users/me in backend; removed)

// ========== CLIENTS ==========

// Basic CRUD
export const listClients = (params = {}) =>
  apiClient.get(`/api/clients${qs(params)}`); 

export const getClientById = (clientId) =>
  apiClient.get(`/api/clients/${clientId}`); 

export const createClient = (payload) =>
  apiClient.post("/api/clients", payload); 

export const updateClient = (clientId, payload) =>
  apiClient.put(`/api/clients/${clientId}`, payload); 

export const deleteClient = (clientId) =>
  apiClient.delete(`/api/clients/${clientId}`); 

// Owner mapping + payment terms
export const assignClientOwner = (clientId, payload) =>
  apiClient.patch(`/api/clients/${clientId}/assign-owner`, payload);

// Related lists
export const listClientCases = (clientId, params = {}) =>
  apiClient.get(`/api/clients/${clientId}/cases${qs(params)}`);

export const listClientInvoices = (clientId, params = {}) =>
  apiClient.get(`/api/clients/${clientId}/invoices${qs(params)}`);

export const listClientPayments = (clientId, params = {}) =>
  apiClient.get(`/api/clients/${clientId}/payments${qs(params)}`);

// Financial summary (WIP/Billed/AR)
export const getClientSummary = (clientId, params = {}) =>
  apiClient.get(`/api/clients/${clientId}/summary${qs(params)}`);


// ========== CASES ==========

// CRUD
export const createCase = (payload) =>
  apiClient.post("/api/cases", payload); // POST /cases

export const getCases = (params = {}) =>
  apiClient.get(`/api/cases${qs(params)}`); // GET /cases

export const getCaseById = (caseId) =>
  apiClient.get(`/api/cases/${caseId}`); // GET /cases/:caseId

// NOTE: backend uses PUT /cases/:caseId (not PATCH)
export const updateCase = (caseId, payload) =>
  apiClient.put(`/api/cases/${caseId}`, payload); // PUT /cases/:caseId

export const deleteCase = (caseId) =>
  apiClient.delete(`/api/cases/${caseId}`); // DELETE /cases/:caseId

// Status transition
export const transitionCaseStatus = (caseId, payload) =>
  apiClient.patch(`/api/cases/${caseId}/status`, payload); // PATCH /cases/:caseId/status

// Related lists
export const listCaseTimeEntries = (caseId, params = {}) =>
  apiClient.get(`/api/cases/${caseId}/time-entries${qs(params)}`); // GET /cases/:caseId/time-entries

export const listCaseInvoices = (caseId, params = {}) =>
  apiClient.get(`/api/cases/${caseId}/invoices${qs(params)}`); // GET /cases/:caseId/invoices

export const listCasePayments = (caseId, params = {}) =>
  apiClient.get(`/api/cases/${caseId}/payments${qs(params)}`); // GET /cases/:caseId/payments

// Rollup (WIP/Billed/AR)
export const getCaseRollup = (caseId, params = {}) =>
  apiClient.get(`/api/cases/${caseId}/rollup${qs(params)}`); // GET /cases/:caseId/rollup

// Convenience: cases by client
export const getCasesByClient = (clientId, params = {}) =>
  apiClient.get(`/api/cases/by-client/${clientId}${qs(params)}`);

// Case types (separate router)
export const listCaseTypes = () =>
  apiClient.get("/api/case-types");


// ========== BILLABLES ==========
export const getBillables = (params = {}) =>
  apiClient.get(`/api/billables${qs(params)}`);

export const createBillable = (payload) =>
  apiClient.post("/api/billables", payload);

export const getBillableById = (id) =>
  apiClient.get(`/api/billables/${id}`);

export const updateBillable = (id, payload) =>
  apiClient.put(`/api/billables/${id}`, payload);

export const deleteBillable = (id) =>
  apiClient.delete(`/api/billables/${id}`);

export const createBillableFromEmail = (emailEntryId) =>
  apiClient.post(`/api/billables/from-email/${emailEntryId}`);

export const addBillable = createBillable;
export const fetchBillables = getBillables;
export const editBillable = updateBillable;
export const removeBillable = deleteBillable;
export const addBillableFromEmail = createBillableFromEmail;


// ========== INVOICES ==========

// Base CRUD-ish helpers
export const createInvoice = (payload) =>
  apiClient.post("/api/invoices", payload); 

export const getInvoices = (params = {}) =>
  apiClient.get(`/api/invoices${qs(params)}`); 

export const getInvoiceById = (id) =>
  apiClient.get(`/api/invoices/${id}`); 

// Generate an invoice from approved time entries
// POST /api/invoices/from-time
export const generateInvoiceFromTime = (payload) =>
  apiClient.post("/api/invoices/from-time", payload);

// Send an invoice (status -> 'sent')
// POST /api/invoices/:id/send
export const sendInvoiceApi = (id, payload = {}) =>
  apiClient.post(`/api/invoices/${id}/send`, payload);

// Void an invoice (status -> 'void')
// POST /api/invoices/:id/void
export const voidInvoiceApi = (id) =>
  apiClient.post(`/api/invoices/${id}/void`);

// Pipeline / kanban totals
// GET /api/invoices/__pipeline
export const getInvoicePipeline = (params = {}) =>
  apiClient.get(`/api/invoices/__pipeline${qs(params)}`);

// Existing helpers (keep as-is)
export const addInvoicePayment = (id, payload) =>
  apiClient.post(`/api/invoices/${id}/payments`, payload);

export const getPendingSummaryByClient = () =>
  apiClient.get("/api/invoices/__analytics/pending-by-client");

export const getInvoicesByUser = (userId) =>
  apiClient.get(`/api/invoices/user/${userId}`);



// ----- INVOICE LINES (nested: /api/invoices/:invoiceId/lines) -----
const invoiceLinesBase = (invoiceId) => `/api/invoices/${invoiceId}/lines`;

export const listInvoiceLines = (invoiceId, params = {}) =>
  apiClient.get(`${invoiceLinesBase(invoiceId)}${qs(params)}`);

export const createInvoiceLine = (invoiceId, payload) =>
  apiClient.post(invoiceLinesBase(invoiceId), payload);

export const updateInvoiceLine = (invoiceId, lineId, payload) =>
  apiClient.put(`/api/invoices/${invoiceId}/lines/${lineId}`, payload);

export const deleteInvoiceLine = (invoiceId, lineId) =>
  apiClient.delete(`/api/invoices/${invoiceId}/lines/${lineId}`);

// ========== EMAIL ENTRIES ==========

// Create a single email entry
export const createEmailEntry = (payload) =>
  apiClient.post("/api/email-entries", payload);

// List email entries (supports filters via querystring: userId, userEmail, clientId, caseId, recipient, limit, skip)
export const listEmailEntries = (params = {}) =>
  apiClient.get(`/api/email-entries${qs(params)}`);

export const getEmailEntries = listEmailEntries;



// Get one email entry by id
export const getEmailEntryById = (id) =>
  apiClient.get(`/api/email-entries/${id}`);

// Update an email entry ( PATCH /email-entries/:id )
export const updateEmailEntry = (id, payload) =>
  apiClient.patch(`/api/email-entries/${id}`, payload);

// Delete an email entry
export const deleteEmailEntry = (id) =>
  apiClient.delete(`/api/email-entries/${id}`);

// Map an email entry to client/case (POST /:id/map)
export const mapEmailEntryApi = (id, payload) =>
  apiClient.post(`/api/email-entries/${id}/map`, payload);

// Generate / regenerate GPT narrative (POST /:id/gpt-narrative)
export const generateEmailNarrativeApi = (id) =>
  apiClient.post(`/api/email-entries/${id}/gpt-narrative`);

// Create Activity from email (POST /:id/activity)
export const createActivityFromEmailApi = (id) =>
  apiClient.post(`/api/email-entries/${id}/activity`);

// Create TimeEntry from email (POST /:id/time-entry)
export const createTimeEntryFromEmailApi = (id, payload = {}) =>
  apiClient.post(`/api/email-entries/${id}/time-entry`, payload);

// Push email entry straight to Clio (POST /:id/push-clio)
export const pushEmailEntryToClio = (id) =>
  apiClient.post(`/api/email-entries/${id}/push-clio`);

// Bulk ingest from extension (POST /email-entries/bulk)
export const bulkIngestEmailEntries = (entries = []) =>
  apiClient.post("/api/email-entries/bulk", { entries });



// ========== ANALYTICS ==========
export const getBillableAnalytics = () =>
  apiClient.get("/api/analytics/billables");

export const getInvoiceAnalytics = () =>
  apiClient.get("/api/analytics/invoices");

export const getUnbilledAnalytics = () =>
  apiClient.get("/api/analytics/unbilled");

// billables grouped by case type
export const getBillablesByCaseTypeAnalytics = (params = {}) =>
  apiClient.get(`/api/analytics/billables-by-case-type${qs(params)}`);

// NEW: unbilled stats grouped by client
export const getUnbilledByClientAnalytics = (params = {}) =>
  apiClient.get(`/api/analytics/unbilled-by-client${qs(params)}`);

// NEW: unbilled stats grouped by user/lawyer
export const getUnbilledByUserAnalytics = (params = {}) =>
  apiClient.get(`/api/analytics/unbilled-by-user${qs(params)}`);

// NEW: billed stats grouped by client
export const getBilledByClientAnalytics = (params = {}) =>
  apiClient.get(`/api/analytics/billed-by-client${qs(params)}`);

// NEW: billed stats grouped by user/lawyer
export const getBilledByUserAnalytics = (params = {}) =>
  apiClient.get(`/api/analytics/billed-by-user${qs(params)}`);


// ========== ACTIVITY (activityRoutes) ==========
// NOTE: These helpers assume activityRoutes define routes under '/activity'.
// If your router uses '/activities' or different paths, adjust the base.

export const activityApi = {
  // Example: backend could expose GET /activity or /activity/feed
  list: (subPath = "", params = {}) =>
    apiClient.get(`/api/activity${subPath}${qs(params)}`),
  get: (subPath = "", params = {}) =>
    apiClient.get(`/api/activity${subPath}${qs(params)}`),
  post: (subPath = "", payload = {}) =>
    apiClient.post(`/api/activity${subPath}`, payload),
  create: (payload = {}) =>
    apiClient.post(`/api/activities`, payload),
};



// ========== AR (Accounts Receivable) (arRoutes) ==========
// NOTE: Assumes AR endpoints are under '/ar/...'

export const arApi = {
  get: (subPath = "", params = {}) =>
    apiClient.get(`/api/ar${subPath}${qs(params)}`),
  post: (subPath = "", payload = {}) =>
    apiClient.post(`/api/ar${subPath}`, payload),
};

// ========== PROFILES ==========

// ----- Partner profiles (special: has /me + query/body id endpoints) -----

// SELF (partner/admin as self)
export const createPartnerProfile = (payload) =>
  apiClient.post("/api/partner-profiles", payload);

export const getMyPartnerProfile = () =>
  apiClient.get("/api/partner-profiles/me");

export const updateMyPartnerProfile = (payload) =>
  apiClient.put("/api/partner-profiles/me", payload);

// Backend uses POST /me/delete (not DELETE /me)
export const deleteMyPartnerProfile = () =>
  apiClient.post("/api/partner-profiles/me/delete");

// ADMIN LISTS + LOOKUPS
export const listPartnerProfiles = (params = {}) =>
  apiClient.get(`/api/partner-profiles${qs(params)}`);

export const getPartnerProfileByUser = (userId) =>
  apiClient.get(`/api/partner-profiles/by-user${qs({ userId })}`);

export const getPartnerProfileById = (id) =>
  apiClient.get(`/api/partner-profiles/by-id${qs({ id })}`);

// ADMIN WRITES
// PUT /api/partner-profiles/update   body: { id, ...updates }
export const updatePartnerProfileById = (id, payload = {}) =>
  apiClient.put("/api/partner-profiles/update", { id, ...payload });

// POST /api/partner-profiles/remove body: { id }
export const deletePartnerProfileById = (id) =>
  apiClient.post("/api/partner-profiles/remove", { id });

// DASHBOARD
export const getPartnerDashboardApi = () =>
  apiClient.get("/api/partner-profiles/dashboard");

// Adapter for profileSliceFactory (unifies method names)
export const partnerProfiles = {
  // reads
  getMine: getMyPartnerProfile,
  getByUserId: getPartnerProfileByUser,
  getById: getPartnerProfileById,
  list: listPartnerProfiles,
  // writes
  create: createPartnerProfile,
  update: updatePartnerProfileById,
  remove: deletePartnerProfileById,
  // extra
  dashboard: getPartnerDashboardApi,
};

// ----- Lawyer / Associate / Intern profiles (list + ?id=, body.id on write) -----
const simpleProfile = (base) => ({
  create: (payload) => apiClient.post(base, payload),
  list: (params = {}) => apiClient.get(`${base}${qs(params)}`),
  getById: (id) => apiClient.get(`${base}${qs({ id })}`),
  update: (id, payload = {}) => apiClient.put(base, { id, ...payload }),
  remove: (id) => apiClient.delete(base, { data: { id } }),
});



export const lawyerProfiles = simpleProfile("/api/lawyer-profiles");
// ----- Associate profiles: full 10-endpoint API -----
export const createAssociateProfileApi = (payload) =>
  apiClient.post("/api/associate-profiles", payload);

export const listAssociateProfilesApi = (params = {}) =>
  apiClient.get(`/api/associate-profiles${qs(params)}`);

export const getAssociateProfileByIdApi = (id) =>
  apiClient.get(`/api/associate-profiles/by-id${qs({ id })}`);

export const updateAssociateProfileByIdApi = (id, payload = {}) =>
  apiClient.patch("/api/associate-profiles", { id, ...payload });

export const deleteAssociateProfileByIdApi = (id) =>
  apiClient.delete("/api/associate-profiles", { data: { id } });

export const getAssociateProfileByUserApi = (userId) =>
  apiClient.get(`/api/associate-profiles/by-user${qs({ userId })}`);

export const getMyAssociateProfileApi = () =>
  apiClient.get("/api/associate-profiles/me");

export const updateMyAssociateProfileApi = (payload = {}) =>
  apiClient.patch("/api/associate-profiles/me", payload);

export const deleteMyAssociateProfileApi = () =>
  apiClient.delete("/api/associate-profiles/me");

export const getAssociateDashboardApi = () =>
  apiClient.get("/api/associate-profiles/dashboard");

// Adapter object passed into buildProfileSlice
export const associateProfiles = {
  // reads
  getMine: getMyAssociateProfileApi,
  getByUserId: getAssociateProfileByUserApi,
  getById: getAssociateProfileByIdApi,
  list: listAssociateProfilesApi,
  // writes
  create: createAssociateProfileApi,
  update: updateAssociateProfileByIdApi,
  remove: deleteAssociateProfileByIdApi,
  // extra
  dashboard: getAssociateDashboardApi,
};


// ----- Intern profiles: full 10-endpoint API -----

// ADMIN / SYSTEM
export const createInternProfileApi = (payload) =>
  apiClient.post("/api/intern-profiles", payload);

export const listInternProfilesApi = (params = {}) =>
  apiClient.get(`/api/intern-profiles${qs(params)}`);

// GET /api/intern-profiles/view?id=...
export const getInternProfileByIdApi = (id) =>
  apiClient.get(`/api/intern-profiles/view${qs({ id })}`);

// PUT /api/intern-profiles/update  { id, ...payload }
export const updateInternProfileByIdApi = (id, payload = {}) =>
  apiClient.put("/api/intern-profiles/update", { id, ...payload });

// POST /api/intern-profiles/remove { id }
export const deleteInternProfileByIdApi = (id) =>
  apiClient.post("/api/intern-profiles/remove", { id });

// GET /api/intern-profiles/by-user?userId=...
export const getInternProfileByUserApi = (userId) =>
  apiClient.get(`/api/intern-profiles/by-user${qs({ userId })}`);

// SELF
export const getMyInternProfileApi = () =>
  apiClient.get("/api/intern-profiles/me");

export const updateMyInternProfileApi = (payload = {}) =>
  apiClient.patch("/api/intern-profiles/me", payload);

export const deleteMyInternProfileApi = () =>
  apiClient.delete("/api/intern-profiles/me");

// DASHBOARD
export const getInternDashboardApi = () =>
  apiClient.get("/api/intern-profiles/dashboard");

// Adapter object passed into buildProfileSlice
export const internProfiles = {
  // reads
  getMine: getMyInternProfileApi,
  getByUserId: getInternProfileByUserApi,
  getById: getInternProfileByIdApi,
  list: listInternProfilesApi,
  // writes
  create: createInternProfileApi,
  update: updateInternProfileByIdApi,
  remove: deleteInternProfileByIdApi,
  // extra
  dashboard: getInternDashboardApi,
};


/// ========== KPIs & KPI SNAPSHOTS ==========

// ---- Live KPIs (kpiRoutes) ----
// GET /api/kpi/summary
export const getKpiSummaryApi = (params = {}) =>
  apiClient.get(`/api/kpi/summary${qs(params)}`);

// GET /api/kpi/trend
export const getKpiTrendApi = (params = {}) =>
  apiClient.get(`/api/kpi/trend${qs(params)}`);


// ---- KPI Snapshots (kpiSnapshotRoutes) ----
// POST /api/kpi-snapshots/generate
export const generateKpiSnapshotsApi = (body) =>
  apiClient.post("/api/kpi-snapshots/generate", body);

// GET /api/kpi-snapshots
export const listKpiSnapshotsApi = (params = {}) =>
  apiClient.get(`/api/kpi-snapshots${qs(params)}`);

// GET /api/kpi-snapshots/:id
export const getKpiSnapshotByIdApi = (id) =>
  apiClient.get(`/api/kpi-snapshots/${id}`);


// ========== PAYMENTS (/api/payments) ==========

export const listPaymentsApi = (params = {}) =>
  apiClient.get(`/api/payments${qs(params)}`);

export const createPaymentApi = (payload) =>
  apiClient.post(`/api/payments`, payload);

export const deletePaymentApi = (id) =>
  apiClient.delete(`/api/payments/${id}`);

// Reconcile a payment (e.g., mark as cleared / matched to bank)
export const reconcilePaymentApi = (id, payload = {}) =>
  apiClient.post(`/api/payments/${id}/reconcile`, payload);

// Keep a small adapter object so existing slice code using `payments.list/create/remove` still works
export const payments = {
  list: listPaymentsApi,
  create: createPaymentApi,
  remove: deletePaymentApi,
};




/// ========== RATE CARDS (/api/rate-cards) ==========

export const listRateCardsApi = (params = {}) =>
  apiClient.get(`/api/rate-cards${qs(params)}`);

export const createRateCardApi = (payload) =>
  apiClient.post("/api/rate-cards", payload);

export const updateRateCardApi = (id, payload) =>
  apiClient.put(`/api/rate-cards/${id}`, payload);

export const deleteRateCardApi = (id) =>
  apiClient.delete(`/api/rate-cards/${id}`);

export const resolveRateApi = (params = {}) =>
  apiClient.get(`/api/rate-cards/resolve${qs(params)}`);

// Backwards-compatible adapter (so old code using rateCards.* still works)
export const rateCards = {
  list: listRateCardsApi,
  create: createRateCardApi,
  update: updateRateCardApi,
  remove: deleteRateCardApi,
};

// Also keep the old name for resolve so existing imports still work
export const resolveRate = resolveRateApi;



// ========== REPORTS (/api/reports) ==========
// CSV + PDF export helpers (binary responses)

export const exportTimeEntriesCsvApi = (params = {}) =>
  apiClient.get(`/api/reports/time-entries.csv${qs(params)}`, {
    responseType: "blob",
  });

export const exportInvoicesCsvApi = (params = {}) =>
  apiClient.get(`/api/reports/invoices.csv${qs(params)}`, {
    responseType: "blob",
  });

export const exportUtilizationCsvApi = (params = {}) =>
  apiClient.get(`/api/reports/utilization.csv${qs(params)}`, {
    responseType: "blob",
  });

export const exportReportsPdfApi = (params = {}) =>
  apiClient.get(`/api/reports/pdf${qs(params)}`, {
    responseType: "blob",
  });

// Optional grouped helper if you like a namespace-style API
export const reports = {
  exportTimeEntriesCsv: exportTimeEntriesCsvApi,
  exportInvoicesCsv: exportInvoicesCsvApi,
  exportUtilizationCsv: exportUtilizationCsvApi,
  exportPdf: exportReportsPdfApi,
};

// ========== REVENUE (/api/revenue) ==========

export const getRevenueBreakdownApi = (params = {}) =>
  apiClient.get(`/api/revenue/breakdown${qs(params)}`);

export const getMonthlyRevenueApi = (params = {}) =>
  apiClient.get(`/api/revenue/monthly${qs(params)}`);

// Optional grouped helper for convenience
export const revenue = {
  breakdown: getRevenueBreakdownApi,
  monthly: getMonthlyRevenueApi,
};

// ========== TIME ENTRIES (/api/time-entries) ==========
// Backend routes:
//  POST  /api/time-entries
//  POST  /api/time-entries/from-activity/:activityId
//  GET   /api/time-entries?userId=&status=&from=&to=
//  PATCH /api/time-entries/:id
//  POST  /api/time-entries/:id/submit
//  POST  /api/time-entries/:id/approve
//  POST  /api/time-entries/:id/reject

export const listTimeEntriesApi = (params = {}) =>
  apiClient.get(`/api/time-entries${qs(params)}`);

export const createTimeEntryApi = (payload) =>
  apiClient.post("/api/time-entries", payload);

export const createTimeEntryFromActivityApi = (activityId, payload = {}) =>
  apiClient.post(`/api/time-entries/from-activity/${activityId}`, payload);

// NOTE: backend uses PATCH, not PUT
export const updateTimeEntryApi = (id, payload) =>
  apiClient.patch(`/api/time-entries/${id}`, payload);

// submit / approve / reject
export const submitTimeEntryApi = (id) =>
  apiClient.post(`/api/time-entries/${id}/submit`);

export const approveTimeEntryApi = (id) =>
  apiClient.post(`/api/time-entries/${id}/approve`);

export const rejectTimeEntryApi = (id) =>
  apiClient.post(`/api/time-entries/${id}/reject`);



// ========== CASE ASSIGNMENTS (caseAssignmentRoutes) ==========
// NOTE: Assumes routes are under '/case-assignments'. Adjust if router uses
// a different base path.

export const caseAssignments = crudResource("/api/case-assignments");

// ========== FIRMS (firmRoutes) ==========
// ========== FIRMS (firmRoutes) ==========
// CRUD for firms (create/list/getById/update/remove)
export const firms = crudResource("/api/firms");

// Settings (currency, tax, billing prefs)
export const getFirmSettingsApi = (firmId) =>
  apiClient.get(`/api/firms/${firmId}/settings`);

export const updateFirmCurrencyApi = (firmId, payload) =>
  apiClient.patch(`/api/firms/${firmId}/currency`, payload);

export const updateFirmTaxSettingsApi = (firmId, payload) =>
  apiClient.patch(`/api/firms/${firmId}/tax-settings`, payload);

export const updateFirmBillingPreferencesApi = (firmId, payload) =>
  apiClient.patch(`/api/firms/${firmId}/billing-preferences`, payload);


// ========== INTEGRATION LOGS (integrationLogRoutes) ==========

// Generic CRUD wrapper (create/list/getById/update/remove)
export const integrationLogs = crudResource("/api/integration-logs");

// Explicit helpers (match routes exactly)

// Create log (for diagnostics/tests, or manual logging UI)
export const createIntegrationLogApi = (payload) =>
  apiClient.post("/api/integration-logs", payload);

// List logs with filters: platform, status, billableId, invoiceId, from, to, limit, skip
export const listIntegrationLogsApi = (params = {}) =>
  apiClient.get(`/api/integration-logs${qs(params)}`);

// Get single log by ID
export const getIntegrationLogByIdApi = (id) =>
  apiClient.get(`/api/integration-logs/${id}`);

// Logs by billable
export const listLogsByBillableApi = (billableId) =>
  apiClient.get(`/api/integration-logs/by-billable/${billableId}`);

// Logs by invoice
export const listLogsByInvoiceApi = (invoiceId) =>
  apiClient.get(`/api/integration-logs/by-invoice/${invoiceId}`);

// Aggregated stats
// query: from, to, groupBy = 'platform' | 'status'
export const getIntegrationLogStatsApi = (params = {}) =>
  apiClient.get(`/api/integration-logs/stats${qs(params)}`);

// Delete single log
export const deleteIntegrationLogApi = (id) =>
  apiClient.delete(`/api/integration-logs/${id}`);

// Purge logs by filter (platform, status, before)
export const purgeIntegrationLogsApi = (payload = {}) =>
  apiClient.delete("/api/integration-logs", { data: payload });




// POST /api/ai/generate-email
export const generateEmail = (prompt) =>
  apiClient.post("/api/ai/generate-email", { prompt });

// POST /api/ai/email-to-billable
export const emailToBillable = (payload) =>
  apiClient.post("/api/ai/email-to-billable", payload);

export const aiApi = {
  get: (endpoint = "", params = {}) =>
    apiClient.get(`/api/ai/${endpoint}${qs(params)}`),
  post: (endpoint = "", payload = {}) =>
    apiClient.post(`/api/ai/${endpoint}`, payload),
};

// ========== CLIO AUTH & STATUS ==========

export const getClioStatus = () =>
  apiClient.get("/api/clio/status");

export const getClioConnectUrl = () => "/api/clio/connect-clio";

// ========== CLIO SYNC (clioSyncRoutes) ==========

export const syncClioBillables = (userId) =>
  apiClient.post("/api/clio-sync/sync-billables", userId ? { userId } : {});

export const syncClioInvoices = (userId) =>
  apiClient.post("/api/clio-sync/sync-invoices", userId ? { userId } : {});
