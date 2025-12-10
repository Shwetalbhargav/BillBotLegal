// src/features/profile/AdminProfile.jsx
import React from "react";
import ProfileBase from "./ProfileBase";
import {
  fetchAdminMe as fetchMine,
  updateAdminMeThunk as updateMine,
} from "@/store/AdminSlice"; // keep your existing slice import :contentReference[oaicite:1]{index=1}

export default function AdminProfile() {
  const thunks = { fetchMine, updateMine };
  return <ProfileBase title="Admin Profile" sliceThunks={thunks} />;
}
