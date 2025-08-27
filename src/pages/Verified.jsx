// src/pages/Verified.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth"; 

export default function Verified() {
  const { login } = useAuth();
  const { search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(search).get("token");
    if (token) {
      login(token, "Lawyer");
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [search]);

  return null;
}
