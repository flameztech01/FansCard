import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import store from "./store.ts";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Homepage from "./screens/Homepage.tsx";
import Login from "./screens/Login.tsx";
import Register from './screens/Register.tsx'

import Dashboard from "./screens/Dashboard.tsx";
import DashboardPackages from "./screens/DashboardPackages.tsx";
import DashboardPayment from "./screens/DashboardPayment.tsx";
import VerifyPayment from "./screens/VerifyPayment.tsx";

import AdminLogin from "./screens/AdminLogin.tsx";
import AdminDashboard from "./screens/AdminDashboard.tsx";

import PrivateRoute from "./components/PrivateRoute.tsx";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
console.log("GOOGLE CLIENT ID IN APP:", JSON.stringify(clientId));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Homepage /> },
      { path: "/login", element: <Login /> },
      {path: '/signin', element: <Register />},

      {
        element: <PrivateRoute />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "packages", element: <DashboardPackages /> },
          { path: "payment", element: <DashboardPayment /> },
          { path: "/verify-payment", element: <VerifyPayment /> },

          { path: "/admin/login", element: <AdminLogin /> },
          { path: "/admin/dashboard", element: <AdminDashboard /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={clientId}>
    <Provider store={store}>
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>
    </Provider>
  </GoogleOAuthProvider>,
);
