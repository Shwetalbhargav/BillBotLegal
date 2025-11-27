// src/store/profiles/associateProfileSlice.js
import { buildProfileSlice } from './profileSliceFactory';
import { associateProfiles } from '@/services/api';

export const {
  reducer: associateProfileReducer,
  actions: associateProfileActions,
  thunks: associateProfileThunks,
} = buildProfileSlice('associateProfile', associateProfiles);

export default associateProfileReducer;
