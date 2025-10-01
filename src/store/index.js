// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';

// Existing reducers
import authReducer from './authSlice';
import clientReducer from './clientSlice';
import caseReducer from './caseSlice';
import billableReducer from './billableSlice';
import invoiceReducer from './invoiceSlice';
import analyticsReducer from './analyticsSlice';
import emailReducer from './emailSlice';
import usersReducer from './usersSlice';

// New: registration slice
import registerReducer from './registerSlice';

// New: role profile slices
import partnerProfileReducer, { partnerProfileThunks } from './partnerProfileSlice';
import lawyerProfileReducer, { lawyerProfileThunks } from './lawyerProfileSlice';
import associateProfileReducer, { associateProfileThunks } from './associateProfileSlice';
import internProfileReducer, { internProfileThunks } from './internProfileSlice';

const store = configureStore({
  reducer: {
    // existing
    users: usersReducer,
    auth: authReducer,
    clients: clientReducer,
    cases: caseReducer,
    billables: billableReducer,
    invoices: invoiceReducer,
    analytics: analyticsReducer,
    emails: emailReducer,

    // new
    register: registerReducer,
    partnerProfile: partnerProfileReducer,
    lawyerProfile: lawyerProfileReducer,
    associateProfile: associateProfileReducer,
    internProfile: internProfileReducer,
  },
});

export default store;

// Optional: central re-exports of the most-used thunks
export const {
  fetchMine: fetchPartnerProfileMine,
  fetchByUser: fetchPartnerProfileByUser,
  createProfile: createPartnerProfile,
  updateProfile: updatePartnerProfile,
  removeProfile: removePartnerProfile,
} = partnerProfileThunks;

export const {
  fetchMine: fetchLawyerProfileMine,
  fetchByUser: fetchLawyerProfileByUser,
  createProfile: createLawyerProfile,
  updateProfile: updateLawyerProfile,
  removeProfile: removeLawyerProfile,
} = lawyerProfileThunks;

export const {
  fetchMine: fetchAssociateProfileMine,
  fetchByUser: fetchAssociateProfileByUser,
  createProfile: createAssociateProfile,
  updateProfile: updateAssociateProfile,
  removeProfile: removeAssociateProfile,
} = associateProfileThunks;

export const {
  fetchMine: fetchInternProfileMine,
  fetchByUser: fetchInternProfileByUser,
  createProfile: createInternProfile,
  updateProfile: updateInternProfile,
  removeProfile: removeInternProfile,
} = internProfileThunks;
