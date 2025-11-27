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
import ai from './aiSlice';
import { formatCurrency } from './formatCurrency';
import { formatDate } from './formatDate';
import rateCard from './rateCardSlice';
import firm from './firmSlice';
import timeEntries from './timeEntrySlice';
import payments from './paymentSlice';
import caseAssignments from './caseAssignmentSlice';
import revenue from './revenueSlice';
import kpiSnapshots from './kpiSnapshotSlice';
import ar from './arSlice';
import activity from './activitySlice';
import clio from './clioSlice';
import integrationLogs from './integrationLogSlice';
import kpi from './kpiSlice';


// Role profile slices (exact filenames)
import partnerProfile from './partnerProfileSlice';
import lawyerProfile from './lawyerProfileSlice';
import associateProfile from './associateProfileSlice';
import internProfile from './internProfileSlice';
import AdminProfile from './AdminSlice';


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
    ai,
    AdminProfile,
    rateCard,
    firm,
    timeEntries,
    payments,
    caseAssignments,
    revenue,
    kpi,
    kpiSnapshots,
    ar,
    activity,
    clio,
    integrationLogs,
  },
});
