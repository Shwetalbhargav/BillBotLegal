import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import clientReducer from './clientSlice';
import caseReducer from './caseSlice';
import billableReducer from './billableSlice';
import invoiceReducer from './invoiceSlice';
import analyticsReducer from './analyticsSlice';
import emailReducer from './emailSlice';
import usersReducer from './usersSlice';

const store = configureStore({
  reducer: {
    users: usersReducer,
    auth: authReducer,
    clients: clientReducer,
    cases: caseReducer,
    billables: billableReducer,
    invoices: invoiceReducer,
    analytics: analyticsReducer,
    emails: emailReducer,
    
  },
});

export default store;
