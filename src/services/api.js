// src/services/api.js
import apiClient from './interceptors';

// === AUTH APIs ===
export const loginUser = (credentials) =>
  apiClient.post('/api/auth/login', credentials);

export const registerUser = (data) =>
  apiClient.post('/api/auth/register', data);

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

// === ANALYTICS APIs ===
export const getBillableStats = () => apiClient.get('/api/analytics/billables');
export const getInvoiceStats = () => apiClient.get('/api/analytics/invoices');
export const getUnbilledBillables = () => apiClient.get('/api/analytics/unbilled');

// === EMAIL ENTRY APIs ===
export const createEmailEntry = (entry) => apiClient.post('/api/email-entry', entry);
export const getEmailEntries = () => apiClient.get('/api/email-entry');

// === CLIO AUTH (OAuth Redirect Only) ===
export const clioAuthCallback = (code) =>
  apiClient.get(`/api/callback?code=${encodeURIComponent(code)}`);

// === TEAM ASSIGNMENT APIs ===
export const assignUserToCase = (assignment) =>
  apiClient.post('/api/team-assignments/assign', assignment);

export const getCaseTeam = (caseId) =>
  apiClient.get(`/api/team-assignments/${caseId}`);

export const removeUserFromCase = (caseId, userId) =>
  apiClient.delete('/api/team-assignments/remove', { data: { caseId, userId } });

// === EMAIL → CLIO PUSH ===
export async function pushEmailToClio(id) {
  const { data } = await apiClient.post(`/api/email-entry/${id}/push-clio`);
  return data; // { success, entry }
}

// === AI Email Generation ===
export const generateEmail = (prompt) =>
  apiClient.post('/generate-email', { prompt });
