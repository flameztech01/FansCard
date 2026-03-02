import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Check,
  AlertCircle,
  X,
  Loader,
  FileText,
  Info,
} from "lucide-react";
import {
  useGetUserInfoQuery,
  useUploadReceiptMutation,
} from "../slices/userApiSlice";

interface PackageInfo {
  id: string;
  name: string;
  price: number;
  description: string;
  color: string;
  features: string[];
}

const VerifyPayment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // from navigation state
  const packageData = location.state?.package as PackageInfo | undefined;
  const amount = location.state?.amount as number | undefined;
  const transactionHash = location.state?.transactionHash as string | undefined;

  // ✅ NEW: wallet + network passed from payment page (optional but nice)
  const walletAddress =
    (location.state?.walletAddress as string | undefined) ||
    "bc1qpz0zk8jv4jxkynpgmnmh3qwdf9gfpydzhzfx9h";
  const networkLabel = "Bitcoin (BTC) Network";

  // user info (optional for extra checks)
  const { data: userInfo, isLoading: userLoading, refetch } =
    useGetUserInfoQuery({});

  // ✅ Upload receipt mutation (FormData)
  const [uploadReceipt, { isLoading: isUploading }] = useUploadReceiptMutation();

  // redirect if page opened directly
  useEffect(() => {
    if (!packageData || !amount) navigate("/packages");
  }, [packageData, amount, navigate]);

  // cleanup preview url
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please upload an image (JPEG, PNG, WEBP) file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setUploadError(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setUploadError("Please select a receipt file to upload");
      return;
    }

    try {
      setUploadError(null);

      const formData = new FormData();
      formData.append("receipt", selectedFile);

      // ✅ store TXID if you want
      if (transactionHash) formData.append("paymentReference", transactionHash);

      // ✅ store network & wallet used (if your backend accepts these fields)
      formData.append("paymentNetwork", "bitcoin");
      formData.append("walletAddress", walletAddress);

      await uploadReceipt(formData).unwrap();

      setUploadSuccess(true);
      await refetch();
    } catch (err: any) {
      console.error("Failed to upload receipt:", err);
      const msg =
        err?.data?.message ||
        err?.error ||
        "Failed to upload receipt. Please try again.";
      setUploadError(msg);
    }
  };

  if (!packageData || !amount) return null;

  // block if already approved
  if (userInfo?.status === "approved" && userInfo?.cardId) {
    navigate("/dashboard");
    return null;
  }

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Receipt Uploaded Successfully!
            </h2>

            <p className="text-gray-600 mb-8">
              Your payment receipt has been submitted for verification. We'll
              review it and update your status once confirmed.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm text-yellow-700">
                    <span className="font-semibold">Current Status:</span>{" "}
                    Pending Verification
                  </p>
                  <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                    <li>Admin will verify your payment</li>
                    <li>Once approved, your card will be issued</li>
                    <li>You'll see your cardId after approval</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() =>
            navigate("/payment", { state: { package: packageData, amount } })
          }
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Payment
        </button>

        {/* Main Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${packageData.color} p-8 text-white`}>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Verify Payment</h1>
              <FileText className="h-8 w-8 opacity-75" />
            </div>
            <p className="text-lg opacity-90">
              Upload your payment receipt for {packageData.name} Card
            </p>
          </div>

          {/* Payment Summary */}
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Details
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Package:</span>
                <span className="font-medium text-gray-900">
                  {packageData.name}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-gray-900">
                  ${amount.toLocaleString()}
                </span>
              </div>

              {transactionHash && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transaction Hash (TXID):</span>
                  <span className="font-medium text-gray-900 font-mono text-xs">
                    {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Network:</span>
                <span className="font-medium text-gray-900">{networkLabel}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Wallet Address:</span>
                <span className="font-medium text-gray-900 font-mono text-xs">
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status After Upload:</span>
                <span className="font-medium text-yellow-600">
                  Pending Verification
                </span>
              </div>
            </div>

            {userLoading ? null : userInfo?.status === "pending_verification" ? (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
                <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  You already submitted a receipt. Your payment is currently{" "}
                  <span className="font-semibold">Pending Verification</span>.
                </p>
              </div>
            ) : null}
          </div>

          {/* Upload Area */}
          <div className="p-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Payment Receipt
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : selectedFile
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-blue-400"
              }`}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Receipt preview"
                        className="max-h-48 rounded-lg shadow-md"
                      />
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your receipt here, or{" "}
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={handleFileChange}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-400">
                    Supported formats: JPEG, PNG, WEBP (Max 5MB)
                  </p>
                </>
              )}
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{uploadError}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-6 bg-blue-50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Important Instructions
              </h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                    1
                  </span>
                  Upload a clear screenshot/photo of your <b>Bitcoin (BTC)</b>{" "}
                  payment confirmation
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                    2
                  </span>
                  Make sure the amount is visible: ${amount.toLocaleString()}
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                    3
                  </span>
                  The transaction hash (TXID) should be clearly visible in the receipt
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                    4
                  </span>
                  After upload your status becomes{" "}
                  <span className="font-semibold">Pending Verification</span>
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || isUploading}
              className={`w-full mt-8 px-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 ${
                selectedFile && !isUploading
                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isUploading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Submit Receipt for Verification</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              By submitting, you confirm that this payment was made to the
              provided Bitcoin (BTC) wallet address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPayment;