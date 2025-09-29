// src/components/UserPicker.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsersThunk, selectUsers, selectUsersLoading, selectUsersError
} from '@/store/usersSlice';
import { selectRole } from '@/store/authSlice';

export default function UserPicker() {
  const dispatch = useDispatch();
  const [role, setRole] = useState('associate');
  const items = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);
  const myRole = useSelector(selectRole); // use to conditionally render

  useEffect(() => {
    dispatch(fetchUsersThunk({ role, limit: 50, sort: 'name' }));
  }, [role, dispatch]);

  if (!myRole) return <div>Sign in to view users</div>;

  return (
    <div>
      <label>Role</label>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        {['admin','partner','lawyer','associate','intern'].map(r =>
          <option key={r} value={r}>{r}</option>
        )}
      </select>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {items.map(u => (
          <li key={u._id}>{u.name} — {u.email}</li>
        ))}
      </ul>
    </div>
  );
}
