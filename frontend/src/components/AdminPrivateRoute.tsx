// src/routes/AdminPrivateRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

const AdminPrivateRoute = () => {
  const location = useLocation();
  const { adminInfo } = useSelector((state: RootState) => state.auth);

  // ✅ logged in if adminInfo exists (and has _id or token)
  const isAuthed = Boolean(adminInfo?._id);

  return isAuthed ? (
    <Outlet />
  ) : (
    <Navigate to="/admin/login" replace state={{ from: location }} />
  );
};

export default AdminPrivateRoute;