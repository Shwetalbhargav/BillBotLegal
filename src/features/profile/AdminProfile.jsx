
// src/features/profile/AdminProfile.jsx
import React from "react";
import ProfileBase from "./ProfileBase";
// Admin uses its own slice; pass explicit thunks so base uses admin API for save/fetch if desired
import { fetchAdminMe as fetchMine, updateAdminMeThunk as updateMine } from "@/store/AdminSlice";

export default function AdminProfile() {
  const thunks = { fetchMine, updateMine };
  return <ProfileBase title="Admin Profile" sliceThunks={thunks} />;
}
