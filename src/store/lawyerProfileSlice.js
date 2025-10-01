// src/store/profiles/lawyerProfileSlice.js
import { buildProfileSlice } from './profileSliceFactory';
import { lawyerProfiles } from '@/services/api';
export const { reducer: lawyerProfileReducer, actions: lawyerProfileActions, thunks: lawyerProfileThunks } = buildProfileSlice('lawyerProfile', lawyerProfiles);
export default lawyerProfileReducer;