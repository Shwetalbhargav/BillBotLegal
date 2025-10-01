// src/services/api.js


// === AUTH APIs ===
export const loginUser = (credentials) =>
apiClient.post('/api/auth/login', credentials);


export const registerUser = (data) =>
apiClient.post('/api/auth/register', data);


export const refreshSession = () => apiClient.get('/api/auth/refresh');


// === USER APIs ===
export const getMe = () => apiClient.get('/api/users/me');
export const updateMe = (payload) => apiClient.put('/api/users/me', payload);


/**
* fetchUsers({ role, q, firmId, page=1, limit=20, sort='name' })
*/
export const fetchUsers = (params = {}) => {
const qp = new URLSearchParams();
Object.entries(params).forEach(([k, v]) => {
if (v !== undefined && v !== null && v !== '') qp.append(k, v);
});
const qs = qp.toString();
return apiClient.get(`/api/users${qs ? `?${qs}` : ''}`);
};


// (optional) roles list for a dropdown
export const listRoles = async () => ({
data: { roles: ['admin', 'partner', 'lawyer', 'associate', 'intern'] },
});

// === ROLE PROFILE APIs ===
// Generic helpers
const resource = (base) => ({
getMine: () => apiClient.get(`${base}/me`),
getByUserId: (userId) => apiClient.get(`${base}/user/${userId}`),
create: (payload) => apiClient.post(base, payload),
update: (id, payload) => apiClient.put(`${base}/${id}`, payload),
remove: (id) => apiClient.delete(`${base}/${id}`),
search: (params = {}) => {
const qp = new URLSearchParams();
Object.entries(params).forEach(([k, v]) => {
if (v !== undefined && v !== null && v !== '') qp.append(k, v);
});
const qs = qp.toString();
return apiClient.get(`${base}${qs ? `?${qs}` : ''}`);
},
});

export const partnerProfiles = resource('/api/partner-profiles');
export const lawyerProfiles = resource('/api/lawyer-profiles');
export const associateProfiles = resource('/api/associate-profiles');
export const internProfiles = resource('/api/intern-profiles');;


// === CLIENT APIs ===
export const getClients = () => apiClient.get('/api/clients');
export const addClient = (client) => apiClient.post('/api/clients/create', client);
export const updateClient = (id, client) => apiClient.put(`/api/clients/${id}/update`, client);
export const deleteClient = (id) => apiClient.delete(`/api/clients/${id}/delete`);
export const getClientDashboard = (id) => apiClient.get(`/api/clients/${id}/dashboard`);


// === CASE APIs ===
export const getCases = () => apiClient.get('/api/cases');
export const addCase = (caseData) => apiClient.post('/api/cases/create', caseData);
export const updateCase = (id, caseData) => apiClient.put(`/api/cases/${id}/update`, caseData);
export const deleteCase = (id) => apiClient.delete(`/api/cases/${id}/delete`);
export const getCaseById = (id) => apiClient.get(`/api/cases/${id}`);
export const getCasesByClient = (clientId) => apiClient.get(`/api/cases/client/${clientId}`);
export const listCaseTypes = () => apiClient.get('/api/cases/__meta/case-types');


// === BILLABLE APIs ===
export const getBillables = () => apiClient.get('/api/billables');
export const addBillable = (billable) => apiClient.post('/api/billables', billable);
export const updateBillable = (id, billable) => apiClient.put(`/api/billables/${id}`, billable);
export const deleteBillable = (id) => apiClient.delete(`/api/billables/${id}`);
export const getBillableById = (id) => apiClient.get(`/api/billables/${id}`);
export const createBillableFromEmail = (emailEntryId) =>
apiClient.post(`/api/billables/from-email/${emailEntryId}`);


// === INVOICE APIs ===
export const createInvoice = (invoice) => apiClient.post('/api/invoices', invoice);
export const getInvoiceById = (id) => apiClient.get(`/api/invoices/${id}`);
export const getAllInvoices = () => apiClient.get('/api/invoices');
export const getInvoicesByUser = (userId) => apiClient.get(`/api/invoices/user/${userId}`);
export const addInvoicePayment = (id, payload) => apiClient.post(`/api/invoices/${id}/payments`, payload);
export const getPendingSummaryByClient = () => apiClient.get('/api/invoices/__analytics/pending-by-client');


// === ANALYTICS APIs ===
export const getBillableStats = () => apiClient.get('/api/analytics/billables');
export const getInvoiceStats = () => apiClient.get('/api/analytics/invoices');
export const getBilledBillables = () => apiClient.get('/api/analytics/unbilled');
export const getUnbilledBillables = getBilledBillables; // alias
export const getBillableStatsByCaseType = () => apiClient.get('/api/analytics/billables-by-case-type');


// === EMAIL ENTRY APIs ===
export const createEmailEntry = (entry) => apiClient.post('/api/email-entry', entry);
export const getEmailEntries = () => apiClient.get('/api/email-entry');


// === CLIO AUTH (OAuth Redirect Only) ===
export const clioAuthCallback = (code) =>
apiClient.get(`/api/callback?code=${encodeURIComponent(code)}`);


// === EMAIL → CLIO PUSH ===
export async function pushEmailToClio(id) {
const { data } = await apiClient.post(`/api/email-entry/${id}/push-clio`);
return data; // { success, entry }
}


// === AI Email Generation ===
export const generateEmail = (prompt) =>
apiClient.post('/generate-email', { prompt });


export const emailToBillable = (payload) =>
apiClient.post('/api/ai/email-to-billable', payload);