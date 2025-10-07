
// src/features/profile/AssociateProfile.jsx
import React from "react";
import ProfileBase from "./ProfileBase";
import { thunks as associateThunks } from "@/store/profiles/associateProfileSlice";
export default function AssociateProfile() { return <ProfileBase title="Associate Profile" sliceThunks={associateThunks} />; }
