// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';

import auth from './authSlice';
import users from './usersSlice';
import register from './registerSlice';
import clients from './clientSlice';
import cases from './caseSlice';
import billables from './billableSlice';
import invoices from './invoiceSlice';
import analytics from './analyticsSlice';
import emails from './emailSlice';

// Role profile slices (exact filenames)
import partnerProfile from './partnerProfileSlice';
import lawyerProfile from './lawyerProfileSlice';
import associateProfile from './associateProfileSlice';
import internProfile from './internProfileSlice';

export default configureStore({
  reducer: {
    auth,
    users,
    register,
    clients,
    cases,
    billables,
    invoices,
    analytics,
    emails,
    partnerProfile,
    lawyerProfile,
    associateProfile,
    internProfile,
  },
});
