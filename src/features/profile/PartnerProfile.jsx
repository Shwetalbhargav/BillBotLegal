
// src/features/profile/PartnerProfile.jsx
import React from "react";
import ProfileBase from "./ProfileBase";
import { thunks as partnerThunks } from "@/store/profiles/partnerProfileSlice";
export default function PartnerProfile() { return <ProfileBase title="Partner Profile" sliceThunks={partnerThunks} />; }
