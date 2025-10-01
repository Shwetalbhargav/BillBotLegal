// src/store/profiles/partnerProfileSlice.js
import { buildProfileSlice } from './profileSliceFactory';
import { partnerProfiles } from '@/services/api';
export const { reducer: partnerProfileReducer, actions: partnerProfileActions, thunks: partnerProfileThunks } = buildProfileSlice('partnerProfile', partnerProfiles);
export default partnerProfileReducer;