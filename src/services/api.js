// src/services/api.js
import apiClient from './interceptors';

// === AUTH APIs ===
export const loginUser = (credentials) =>
  apiClient.post('/auth/login', credentials);

export const registerUser = (data) =>
  apiClient.post('/auth/register', data);

// === CLIENT APIs ===
export const getClients = () => apiClient.get('/clients');
export const addClient = (client) => apiClient.post('/clients/create', client);
export const updateClient = (id, client) => apiClient.put(`/clients/${id}/update`, client);
export const deleteClient = (id) => apiClient.delete(`/clients/${id}/delete`);
export const getClientDashboard = (id) => apiClient.get(`/clients/${id}/dashboard`);

// === CASE APIs ===
export const getCases = () => apiClient.get('/cases');
export const addCase = (caseData) => apiClient.post('/cases/create', caseData);
export const updateCase = (id, caseData) => apiClient.put(`/cases/${id}/update`, caseData);
export const deleteCase = (id) => apiClient.delete(`/cases/${id}/delete`);
export const getCaseById = (id) => apiClient.get(`/cases/${id}`);

// === BILLABLE APIs ===
export const getBillables = () => apiClient.get('/billables');
export const addBillable = (billable) => apiClient.post('/billables', billable);
export const updateBillable = (id, billable) => apiClient.put(`/billables/${id}`, billable);
export const deleteBillable = (id) => apiClient.delete(`/billables/${id}`);
export const getBillableById = (id) => apiClient.get(`/billables/${id}`);
export const createBillableFromEmail = (emailEntryId) =>
  apiClient.post(`/billables/from-email/${emailEntryId}`);


// === INVOICE APIs ===
export const createInvoice = (invoice) => apiClient.post('/invoices', invoice);
export const getInvoiceById = (id) => apiClient.get(`/invoices/${id}`);
export const getAllInvoices = () => apiClient.get('/invoices');
export const getInvoicesByUser = (userId) => apiClient.get(`/invoices/user/${userId}`);

// === ANALYTICS APIs ===
export const getBillableStats = () => apiClient.get('/analytics/billables');
export const getInvoiceStats = () => apiClient.get('/analytics/invoices');
export const getUnbilledBillables = () => apiClient.get('/analytics/unbilled');

// === EMAIL ENTRY APIs ===
export const createEmailEntry = (entry) => apiClient.post('/email-entry', entry);
export const getEmailEntries = () => apiClient.get('/email-entry');

// === CLIO AUTH (OAuth Redirect Only) ===
export const clioAuthCallback = (code) =>
  apiClient.get(`/callback?code=${code}`);

// === TEAM ASSIGNMENT APIs ===
export const assignUserToCase = (assignment) =>
  apiClient.post('/team-assignments/assign', assignment);

export const getCaseTeam = (caseId) =>
  apiClient.get(`/team-assignments/${caseId}`);

export const removeUserFromCase = (caseId, userId) =>
  apiClient.delete('/team-assignments/remove', {
    data: { caseId, userId },
  });

  // services/api.js
export async function pushEmailToClio(id) {
  const { data } = await axios.post(`/api/email-entry/${id}/push-clio`);
  return data; // { success, entry }
}

// add at the bottom
export const generateEmail = (prompt) =>
  apiClient.post('/generate-email', { prompt });

