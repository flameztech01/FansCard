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
import GenerateLink from "./screens/GenerateLink.tsx";
import GeneratedLinks from "./screens/GeneratedLinks.tsx";

import PrivateRoute from "./components/PrivateRoute.tsx";
import AdminPrivateRoute from "./components/AdminPrivateRoute.tsx";

import NotFound from "./components/NotFound.tsx";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
console.log("GOOGLE CLIENT ID IN APP:", JSON.stringify(clientId));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Homepage /> },
      { path: "/login", element: <Login /> },
      {path: '/signup', element: <Register />},
      { path: "/fan/:slug/:token", element: <Register /> },
      { path: "/admin/login", element: <AdminLogin /> },
      {path: '*', element: <NotFound />},

      {
        element: <PrivateRoute />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "packages", element: <DashboardPackages /> },
          { path: "payment", element: <DashboardPayment /> },
          { path: "/verify-payment", element: <VerifyPayment /> },

          
       
        ],
      },
      {element: <AdminPrivateRoute />, 
        children: [
          { path: "/admin/dashboard", element: <AdminDashboard /> },
          {path: '/admin/generate-link', element: <GenerateLink />},
          {path: '/admin/generated-links', element: <GeneratedLinks />}
        ]
      }
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
