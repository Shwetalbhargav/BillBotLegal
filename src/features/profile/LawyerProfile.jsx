
// src/features/profile/LawyerProfile.jsx
import React from "react";
import ProfileBase from "./ProfileBase";
import { thunks as lawyerThunks } from "@/store/profiles/lawyerProfileSlice";
export default function LawyerProfile() { return <ProfileBase title="Lawyer Profile" sliceThunks={lawyerThunks} />; }
