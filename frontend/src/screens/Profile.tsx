import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Heart,
  Award,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { useGetUserInfoQuery } from '../slices/userApiSlice';

const Profile = () => {
  const navigate = useNavigate();
  const { data: userInfo, isLoading, error } = useGetUserInfoQuery({});

  const googlePicture = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "null")?.picture as string | undefined;
    } catch {
      return undefined;
    }
  }, []);

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 h-16 w-16"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Not Signed In</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const celebName = (userInfo?.celebName || "").trim();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center h-14">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="flex-1 text-center font-semibold text-gray-900">Profile</h1>
            <div className="w-5"></div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            {googlePicture ? (
              <img
                src={googlePicture}
                alt={userInfo.name}
                className="h-16 w-16 rounded-full border-2 border-blue-100"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                {getInitials(userInfo.name)}
              </div>
            )}

            {/* Basic Info */}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{userInfo.name}</h2>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <Mail className="h-3 w-3 mr-1" /> {userInfo.email}
              </p>
              {userInfo.phone && (
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <Phone className="h-3 w-3 mr-1" /> {userInfo.phone}
                </p>
              )}
            </div>
          </div>

          {/* Fan of */}
          {celebName && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 flex items-center">
                <Heart className="h-4 w-4 text-red-500 mr-2" />
                Fan of: <span className="font-semibold ml-1">{celebName}</span>
              </p>
            </div>
          )}
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Account Info</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Member since</span>
              <span className="text-gray-900">
                {new Date(userInfo.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                userInfo.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {userInfo.status?.replace('_', ' ')}
              </span>
            </div>
            {userInfo.packageType && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Package</span>
                <span className="flex items-center text-purple-600 font-medium">
                  <Award className="h-4 w-4 mr-1" />
                  {userInfo.packageType.charAt(0).toUpperCase() + userInfo.packageType.slice(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;