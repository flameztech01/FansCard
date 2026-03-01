// PrivateRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Adjust this type to match your authSlice shape.
 * The important part: userInfo?.isAdmin (or userInfo?.role === 'admin')
 */
type RootState = {
  auth: {
    userInfo?: {
      token?: string;
      isAdmin?: boolean;
      role?: "user" | "admin";
    } | null;
  };
};

export const PrivateRoute: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);

  return userInfo ? <Outlet /> : <Navigate to="/signup" replace />;
};

export const AdminRoute: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);

  // ✅ allow admin if either isAdmin === true OR role === "admin"
  const isAdmin = Boolean(userInfo?.isAdmin || userInfo?.role === "admin");

  if (!userInfo) return <Navigate to="/signup" replace />;
  if (!isAdmin) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

export default PrivateRoute;