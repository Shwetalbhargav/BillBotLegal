// src/services/api.js
// Assumes you have an axios instance exported as `apiClient`

// ---------- helpers ----------
const qs = (params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.append(k, v);
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
};

// ========== AUTH ==========
export const loginUser = (credentials) =>
  apiClient.post("/api/auth/login", credentials);

export const registerUser = (data) =>
  apiClient.post("/api/auth/register", data);

// (No /auth/refresh in backend; removed)


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

// (No PUT /api/users/me in backend; removed)


// ========== CLIENTS ==========
export const getClients = () =>
  apiClient.get("/api/clients");

export const createClient = (payload) =>
  apiClient.post("/api/clients/create", payload);

export const updateClient = (clientId, payload) =>
  apiClient.put(`/api/clients/${clientId}/update`, payload);

export const deleteClient = (clientId) =>
  apiClient.delete(`/api/clients/${clientId}/delete`);

export const getClientDashboard = (clientId) =>
  apiClient.get(`/api/clients/${clientId}/dashboard`);


// ========== CASES ==========
export const createCase = (payload) =>
  apiClient.post("/api/cases", payload); // backend expects POST /cases

export const getCases = () =>
  apiClient.get("/api/cases");

export const getCaseById = (caseId) =>
  apiClient.get(`/api/cases/${caseId}`);

export const updateCase = (caseId, payload) =>
  apiClient.patch(`/api/cases/${caseId}`, payload); // backend uses PATCH

export const deleteCase = (caseId) =>
  apiClient.delete(`/api/cases/${caseId}`);

export const listCaseTypes = () =>
  apiClient.get("/api/case-types"); // backend: GET /case-types

export const getCasesByClient = (clientId) =>
  apiClient.get(`/api/clients/${clientId}/cases`); // backend path


// ========== BILLABLES ==========
export const getBillables = (params = {}) =>
  apiClient.get(`/api/billables${qs(params)}`);

export const createBillable = (payload) =>
  apiClient.post("/api/billables", payload);

export const getBillableById = (id) =>
  apiClient.get(`/api/billables/${id}`);

export const updateBillable = (id, payload) =>
  apiClient.patch(`/api/billables/${id}`, payload); // backend uses PATCH

export const deleteBillable = (id) =>
  apiClient.delete(`/api/billables/${id}`);

export const createBillableFromEmail = (emailEntryId) =>
  apiClient.post(`/api/billables/from-email/${emailEntryId}`);


// ========== INVOICES ==========
export const createInvoice = (payload) =>
  apiClient.post("/api/invoices", payload);

export const getInvoices = (params = {}) =>
  apiClient.get(`/api/invoices${qs(params)}`);

export const getInvoiceById = (id) =>
  apiClient.get(`/api/invoices/${id}`);

export const addInvoicePayment = (id, payload) =>
  apiClient.post(`/api/invoices/${id}/payments`, payload);

export const getPendingSummaryByClient = () =>
  apiClient.get("/api/invoices/__analytics/pending-by-client");

export const getInvoicesByUser = (userId) =>
  apiClient.get(`/api/invoices/user/${userId}`);


// ========== EMAIL ENTRIES ==========
export const createEmailEntry = (payload) =>
  apiClient.post("/api/email-entries", payload);

export const listEmailEntries = (params = {}) =>
  apiClient.get(`/api/email-entries${qs(params)}`);

export const getEmailEntryById = (id) =>
  apiClient.get(`/api/email-entries/${id}`);

export const pushEmailEntryToClio = (id) =>
  apiClient.post(`/api/email-entries/${id}/push`);


// ========== ANALYTICS ==========
export const getBillableAnalytics = () =>
  apiClient.get("/api/analytics/billables");

export const getInvoiceAnalytics = () =>
  apiClient.get("/api/analytics/invoices");

export const getUnbilledAnalytics = () =>
  apiClient.get("/api/analytics/unbilled");

export const getBillablesByCaseTypeAnalytics = (params = {}) =>
  apiClient.get(`/api/analytics/billables-by-case-type${qs(params)}`);


// ========== PROFILES ==========
// ----- Partner profiles (special: has /me + query/body id endpoints) -----
export const createPartnerProfile = (payload) =>
  apiClient.post("/api/partner-profiles", payload);

export const getMyPartnerProfile = () =>
  apiClient.get("/api/partner-profiles/me");

export const updateMyPartnerProfile = (payload) =>
  apiClient.put("/api/partner-profiles/me", payload);

export const deleteMyPartnerProfile = () =>
  apiClient.delete("/api/partner-profiles/me");

export const listPartnerProfiles = (params = {}) =>
  apiClient.get(`/api/partner-profiles${qs(params)}`);

export const getPartnerProfileByUser = (userId) =>
  apiClient.get(`/api/partner-profiles/by-user${qs({ userId })}`);

export const getPartnerProfileById = (id) =>
  apiClient.get(`/api/partner-profiles/by-id${qs({ id })}`);

export const updatePartnerProfileById = (id, payload = {}) =>
  apiClient.put("/api/partner-profiles", { id, ...payload });

export const deletePartnerProfileById = (id) =>
  apiClient.delete("/api/partner-profiles", { data: { id } }); // axios delete body

// ----- Lawyer / Associate / Intern profiles (list + ?id=, body.id on write) -----
const simpleProfile = (base) => ({
  create: (payload) => apiClient.post(base, payload),
  list: (params = {}) => apiClient.get(`${base}${qs(params)}`),
  getById: (id) => apiClient.get(`${base}${qs({ id })}`),
  update: (id, payload = {}) => apiClient.put(base, { id, ...payload }),
  remove: (id) => apiClient.delete(base, { data: { id } }),
});

export const lawyerProfiles = simpleProfile("/api/lawyer-profiles");
export const associateProfiles = simpleProfile("/api/associate-profiles");
export const internProfiles = simpleProfile("/api/intern-profiles");


