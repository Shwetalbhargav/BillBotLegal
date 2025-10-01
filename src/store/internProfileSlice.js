// src/store/profiles/internProfileSlice.js
import { buildProfileSlice } from './profileSliceFactory';
import { internProfiles } from '@/services/api';
export const { reducer: internProfileReducer, actions: internProfileActions, thunks: internProfileThunks } = buildProfileSlice('internProfile', internProfiles);
export default internProfileReducer;