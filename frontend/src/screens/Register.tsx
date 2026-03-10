import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useLoginMutation } from "../slices/userApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../slices/authSlice";

type RootState = {
  auth: {
    userInfo: any;
  };
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { slug, token } = useParams<{ slug: string; token: string }>();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("+1 ");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const hasFanLink = useMemo(() => {
    return Boolean(token && token.trim());
  }, [token]);

  useEffect(() => {
    if (userInfo) {
      navigate("/dashboard", { replace: true });
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    if (!profilePicture) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(profilePicture);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [profilePicture]);

  const normalizePhone = (value: string) => {
    return value.replace(/\s+/g, " ").trim();
  };

  const isPhoneValid = (value: string) => {
    const cleaned = normalizePhone(value);
    if (!cleaned) return false;
    if (!cleaned.startsWith("+")) return false;

    const digits = cleaned.replace(/\D/g, "");
    return digits.length >= 7;
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setError(null);

      if (!credentialResponse?.credential) {
        setError("Google registration failed. Try again.");
        return;
      }

      const cleanPhone = normalizePhone(phone);
      if (!isPhoneValid(cleanPhone)) {
        setError("Please enter a valid phone number with country code");
        return;
      }

      if (!profilePicture) {
        setError("Please upload your profile picture");
        return;
      }

      const decoded: any = jwtDecode(credentialResponse.credential);

      const formData = new FormData();
      formData.append("token", credentialResponse.credential);
      formData.append("phone", cleanPhone);
      formData.append("image", profilePicture);

      if (hasFanLink) {
        formData.append("celebToken", token || "");
        formData.append("celebSlug", slug || "");
      }

      const response = await login(formData).unwrap();

      const userInfoToStore = {
        ...response,
        picture: decoded?.picture ?? response?.picture,
        sub: decoded?.sub,
      };

      dispatch(setCredentials(userInfoToStore));
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Register error:", err);
      setError(err?.data?.message || "Failed to register. Please try again.");
    }
  };

  const handleGoogleError = () => {
    setError("Google registration failed. Please try again.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <div className="flex items-center text-gray-600">
                <FcGoogle className="h-6 w-6 mr-2" />
                <span>Creating your account...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link
            to="/"
            className="inline-block text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6"
          >
            FanCardStore
          </Link>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Create Account
          </h2>

          <p className="text-gray-600">
            Sign up with Google to get your fan card
          </p>

          {hasFanLink && (
            <p className="mt-2 text-xs text-gray-500">
              Fan signup link detected
              {slug ? ` • ${slug}` : ""}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>

            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />

            <p className="text-xs text-gray-500">
              Start with <span className="font-semibold">+1</span> or use your
              own country code, like <span className="font-semibold">+44</span>.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="profilePicture"
              className="block text-sm font-medium text-gray-700"
            >
              Profile Picture <span className="text-red-500">*</span>
            </label>

            <input
              type="file"
              id="profilePicture"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setProfilePicture(file);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-500"
            />

            <p className="text-xs text-gray-500">
              Upload your picture for your fan card.
            </p>

            {previewUrl && (
              <div className="pt-2">
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="h-24 w-24 rounded-full object-cover border border-gray-200 shadow-sm"
                />
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Quick setup:</span> Sign up once,
              then choose your package and make payment to activate your digital
              card.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              size="large"
              text="signup_with"
              shape="rectangular"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Secure registration
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="h-5 w-5 text-green-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              No password to remember
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="h-5 w-5 text-green-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Secure Google authentication
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="h-5 w-5 text-green-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Choose your package after signup
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="h-5 w-5 text-green-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Flexible payment methods supported
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in here
            </Link>
          </p>

          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;