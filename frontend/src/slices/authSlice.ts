// src/slices/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";

export interface UserInfo {
  _id: string;
  name: string;
  email: string;
  token?: string;
  picture?: string;
  isAdmin?: boolean;
}

export interface AdminInfo {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "super_admin";
  token?: string;
}

interface AuthState {
  userInfo: UserInfo | null;
  adminInfo: AdminInfo | null;
}

// Safe JSON parse
const safeParse = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  userInfo: safeParse<UserInfo>(localStorage.getItem("userInfo")),
  adminInfo: safeParse<AdminInfo>(localStorage.getItem("adminInfo")),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // USER
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));

      state.adminInfo = null;
      localStorage.removeItem("adminInfo");
    },

    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem("userInfo");
    },

    // ADMIN
    setAdminCredentials: (state, action) => {
      state.adminInfo = action.payload;
      localStorage.setItem("adminInfo", JSON.stringify(action.payload));

      state.userInfo = null;
      localStorage.removeItem("userInfo");
    },

    adminLogout: (state) => {
      state.adminInfo = null;
      localStorage.removeItem("adminInfo");
    },

    universalLogout: (state) => {
      state.userInfo = null;
      state.adminInfo = null;
      localStorage.removeItem("userInfo");
      localStorage.removeItem("adminInfo");
    },
  },
});

export const {
  setCredentials,
  logout,
  setAdminCredentials,
  adminLogout,
  universalLogout,
} = authSlice.actions;

export default authSlice.reducer;