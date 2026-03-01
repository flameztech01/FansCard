import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Shield,
  Zap,
  Star,
  Crown,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import {
    useGetUserInfoQuery,
    useUpdatePackageMutation,
} from "../slices/userApiSlice";

interface Package {
  id: "basic" | "standard" | "premium";
  name: string;
  price: number;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  popular?: boolean;
}

interface SerializablePackage {
  id: "basic" | "standard" | "premium";
  name: string;
  price: number;
  description: string;
  color: string;
  features: string[];
  popular?: boolean;
}

const packages: Package[] = [
  {
    id: "basic",
    name: "Basic",
    price: 5000,
    description: "Perfect for casual fans",
    icon: <Star className="h-6 w-6" />,
    color: "from-gray-600 to-gray-700",
    features: [
      "Digital Fan Card",
      "Basic member benefits",
      "Access to public events",
      "Newsletter subscription",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 15000,
    description: "Most popular choice",
    icon: <Zap className="h-6 w-6" />,
    color: "from-blue-600 to-blue-700",
    popular: true,
    features: [
      "Everything in Basic",
      "Priority event access",
      "10% merchandise discount",
      "Exclusive content access",
      "Birthday rewards",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 30000,
    description: "Ultimate fan experience",
    icon: <Crown className="h-6 w-6" />,
    color: "from-purple-600 to-pink-600",
    features: [
      "Everything in Standard",
      "VIP event access",
      "25% merchandise discount",
      "Meet & greet opportunities",
      "Limited edition merch",
      "Personalized fan experiences",
    ],
  },
];

const DashboardPackages = () => {
  const navigate = useNavigate();

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ✅ controls whether user is viewing package list or payment summary
  const [showPackages, setShowPackages] = useState(false);

  const {
    data: userInfo,
    isLoading: userLoading,
  } = useGetUserInfoQuery({});

  const [updatePackage, { isLoading: isUpdating }] =
    useUpdatePackageMutation();

  // If user already has an approved card, redirect to dashboard
  if (userInfo?.status === "approved" && userInfo?.cardId) {
    navigate("/dashboard");
    return null;
  }

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowConfirmModal(true);
  };

  const handleConfirmPackage = async () => {
    if (!selectedPackage) return;

    try {
      await updatePackage({
        packageType: selectedPackage.id,
        amount: selectedPackage.price,
      }).unwrap();

      const serializablePackage: SerializablePackage = {
        id: selectedPackage.id,
        name: selectedPackage.name,
        price: selectedPackage.price,
        description: selectedPackage.description,
        color: selectedPackage.color,
        features: selectedPackage.features,
        popular: selectedPackage.popular,
      };

      // hide packages view after confirming
      setShowPackages(false);

      navigate("/payment", {
        state: {
          package: serializablePackage,
          amount: selectedPackage.price,
        },
      });
    } catch (error) {
      console.error("Failed to update package:", error);
    }
  };

  const handlePayNow = () => {
    if (userInfo?.packageType && userInfo?.amount) {
      const currentPackage = packages.find((p) => p.id === userInfo.packageType);

      if (currentPackage) {
        const serializablePackage: SerializablePackage = {
          id: currentPackage.id,
          name: currentPackage.name,
          price: currentPackage.price,
          description: currentPackage.description,
          color: currentPackage.color,
          features: currentPackage.features,
          popular: currentPackage.popular,
        };

        navigate("/payment", {
          state: {
            package: serializablePackage,
            amount: userInfo.amount,
          },
        });
      }
    }
  };

  // ✅ Change Package now actually shows the packages list again
  const handleChangePackage = () => {
    setShowPackages(true);
    setShowConfirmModal(false);
    setSelectedPackage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm p-8">
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-12 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ If pending payment AND user is NOT changing package, show payment summary screen
  if (
    !showPackages &&
    userInfo?.status === "pending_payment" &&
    userInfo?.packageType
  ) {
    const currentPackage = packages.find((p) => p.id === userInfo.packageType);

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6 mx-auto">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Complete Your Payment
            </h2>

            <p className="text-center text-gray-600 mb-8">
              You've selected the{" "}
              <span className="font-semibold">{currentPackage?.name}</span>{" "}
              package. Please complete your payment to activate your card.
            </p>

            {currentPackage && (
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-semibold text-gray-900">
                    {currentPackage.name}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-900">
                    ₦{userInfo.amount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-yellow-600 font-semibold">
                    Awaiting Payment
                  </span>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={handlePayNow}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold"
              >
                Pay Now
              </button>

              <button
                onClick={handleChangePackage}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Change Package
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Default: show packages list
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to summary button when changing package */}
        {userInfo?.status === "pending_payment" &&
          userInfo?.packageType &&
          showPackages && (
            <div className="mb-6">
              <button
                onClick={() => setShowPackages(false)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Payment Summary
              </button>
            </div>
          )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Fan Card Package
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect package for your fandom. Get exclusive access,
            discounts, and more!
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl shadow-sm border ${
                pkg.popular ? "border-blue-200 shadow-lg" : "border-gray-100"
              } overflow-hidden hover:shadow-xl transition-shadow`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <div className={`bg-gradient-to-r ${pkg.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">{pkg.icon}</div>
                  <Shield className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-2xl font-bold mb-1">{pkg.name}</h3>
                <p className="text-sm opacity-90">{pkg.description}</p>
              </div>

              <div className="p-6 border-b border-gray-100">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    ₦{pkg.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 ml-2">/one-time</span>
                </div>
              </div>

              <div className="p-6">
                <ul className="space-y-4">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => handlePackageSelect(pkg)}
                  disabled={userInfo?.status === "approved"}
                  className={`w-full px-6 py-3 rounded-xl font-semibold transition-colors ${
                    pkg.popular
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {userInfo?.status === "approved"
                    ? "Already Have Card"
                    : "Select Package"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-green-100 rounded-full mb-4">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            100% Satisfaction Guarantee
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Not happy with your card? We offer a 30-day money-back guarantee.
            Your fandom experience is our top priority.
          </p>
        </div>

        {/* FAQ Link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/support")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Have questions? Check our FAQ →
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Confirm Your Selection
            </h3>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Package:</span>
                <span className="font-semibold text-gray-900">
                  {selectedPackage.name}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold text-gray-900">
                  ₦{selectedPackage.price.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment:</span>
                <span className="text-yellow-600 font-semibold">
                  One-time payment
                </span>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              You'll be redirected to complete your payment. Your card will be
              activated once payment is confirmed.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPackage}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? "Processing..." : "Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPackages;