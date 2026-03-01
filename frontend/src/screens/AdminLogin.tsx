import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { useAdminLoginMutation } from "../slices/adminApiSlice";
import { setAdminCredentials } from "../slices/authSlice";
import type { RootState } from "../store";

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { adminInfo } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [login, { isLoading }] = useAdminLoginMutation();

  // ✅ If already logged in as admin, go dashboard
  useEffect(() => {
    if (adminInfo?._id) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [adminInfo, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      /**
       * Expect backend to return either:
       *  A) { _id, name, email, role, token }
       *  B) { admin: { _id, name, email, role }, token }
       */
      const res: any = await login({ email, password }).unwrap();

      const adminPayload =
        res?.admin && res?.token
          ? { ...res.admin, token: res.token }
          : res;

      // ✅ store ONLY via redux -> authSlice will handle localStorage(adminInfo)
      dispatch(setAdminCredentials(adminPayload));

      navigate("/admin/dashboard", { replace: true });
    } catch (err: any) {
      setError(
        err?.data?.message || "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
          <div className="inline-flex p-3 bg-white/20 rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-blue-100 mt-2">
            Sign in to access the admin dashboard
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold transition-all transform hover:scale-[1.02] focus:scale-[0.98] ${
                isLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:from-blue-700 hover:to-purple-700"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center">
                <Shield className="h-3 w-3 mr-1" />
                Secure admin access only. Unauthorized access is prohibited.
              </p>
            </div>
          </form>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500">
            © {new Date().getFullYear()} FanCardStore. All rights reserved.
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 text-white hover:text-gray-200 flex items-center space-x-2 transition-colors"
      >
        <span>←</span>
        <span>Back to Main Site</span>
      </button>
    </div>
  );
};

export default AdminLogin;