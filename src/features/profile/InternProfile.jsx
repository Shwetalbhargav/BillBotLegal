
// src/features/profile/InternProfile.jsx
import React from "react";
import ProfileBase from "./ProfileBase";
import { thunks as internThunks } from "@/store/profiles/internProfileSlice";
export default function InternProfile() { return <ProfileBase title="Intern Profile" sliceThunks={internThunks} />; }
