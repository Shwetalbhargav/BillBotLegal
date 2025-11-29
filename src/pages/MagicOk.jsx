import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setAuth } from '@/store/authSlice';
import { useDispatch } from 'react-redux';

export default function MagicOk() { 
    
  const { search } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = new URLSearchParams(search).get("token");
    if (token) {

      dispatch(setAuth({ 
        token,
        user: { role: "User" }
      }));

      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [search]);

  return null;
}
