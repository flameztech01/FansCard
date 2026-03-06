import React, { useEffect, useMemo, useState } from "react";
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

interface PaymentMethod {
  methodId: string;
  type: string;
  label: string;
  details: Record<string, any>;
}

const FALLBACK_PAYMENT_METHOD: PaymentMethod = {
  methodId: "fallback_btc_1",
  type: "bitcoin",
  label: "Bitcoin Payment",
  details: {
    walletAddress: "bc1qpz0zk8jv4jxkynpgmnmh3qwdf9gfpydzhzfx9h",
    network: "Bitcoin (BTC) Network",
  },
};

const VerifyPayment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const packageData = location.state?.package as PackageInfo | undefined;
  const amount = location.state?.amount as number | undefined;
  const transactionHash = location.state?.transactionHash as string | undefined;

  const passedPaymentMethod =
    (location.state?.paymentMethod as PaymentMethod | undefined) ||
    FALLBACK_PAYMENT_METHOD;

  const passedPaymentType =
    (location.state?.paymentType as string | undefined) ||
    passedPaymentMethod.type ||
    "bitcoin";

  const passedPaymentLabel =
    (location.state?.paymentLabel as string | undefined) ||
    passedPaymentMethod.label ||
    "Bitcoin Payment";

  const passedPaymentDetails =
    (location.state?.paymentDetails as Record<string, any> | undefined) ||
    passedPaymentMethod.details ||
    FALLBACK_PAYMENT_METHOD.details;

  const passedNetwork =
    (location.state?.network as string | undefined) ||
    passedPaymentDetails.network ||
    "Bitcoin (BTC) Network";

  const destinationValue =
    (location.state?.destinationValue as string | undefined) ||
    passedPaymentDetails.walletAddress ||
    passedPaymentDetails.accountNumber ||
    passedPaymentDetails["Account Number"] ||
    passedPaymentDetails.email ||
    "";

  const { data: userInfo, isLoading: userLoading, refetch } =
    useGetUserInfoQuery({});

  const [uploadReceipt, { isLoading: isUploading }] = useUploadReceiptMutation();

  useEffect(() => {
    if (!packageData || !amount) navigate("/packages");
  }, [packageData, amount, navigate]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const paymentType = String(passedPaymentType || "").toLowerCase();
  const paymentLabel = passedPaymentLabel;
  const paymentDetails = passedPaymentDetails;
  const networkLabel = passedNetwork;

  const paymentPrimaryLabel = useMemo(() => {
    if (
      paymentType.includes("btc") ||
      paymentType.includes("bitcoin") ||
      paymentDetails.walletAddress
    ) {
      return "Wallet Address";
    }

    if (paymentType.includes("bank")) {
      return "Account Number";
    }

    if (paymentType.includes("zelle")) {
      return "Zelle Account";
    }

    if (paymentType.includes("paypal")) {
      return "PayPal Account";
    }

    return "Payment Destination";
  }, [paymentType, paymentDetails]);

  const importantInstructions = useMemo(() => {
    if (paymentType.includes("bank")) {
      return [
        `Upload a clear screenshot/photo of your ${paymentLabel} transfer receipt`,
        `Make sure the amount is visible: $${amount?.toLocaleString()}`,
        "The transfer reference, session ID, or narration should be visible if possible",
        "After upload your status becomes Pending Verification",
      ];
    }

    if (paymentType.includes("zelle")) {
      return [
        `Upload a clear screenshot/photo of your ${paymentLabel} payment confirmation`,
        `Make sure the amount is visible: $${amount?.toLocaleString()}`,
        "The recipient details and payment reference should be visible if possible",
        "After upload your status becomes Pending Verification",
      ];
    }

    if (paymentType.includes("paypal")) {
      return [
        `Upload a clear screenshot/photo of your ${paymentLabel} payment confirmation`,
        `Make sure the amount is visible: $${amount?.toLocaleString()}`,
        "The PayPal recipient and transaction reference should be visible if possible",
        "After upload your status becomes Pending Verification",
      ];
    }

    return [
      `Upload a clear screenshot/photo of your ${paymentLabel} payment confirmation`,
      `Make sure the amount is visible: $${amount?.toLocaleString()}`,
      "The transaction reference or receipt details should be visible if possible",
      "After upload your status becomes Pending Verification",
    ];
  }, [paymentType, paymentLabel, amount]);

  const verificationLabel = useMemo(() => {
    if (paymentType.includes("btc") || paymentType.includes("bitcoin")) {
      return "Transaction Hash (TXID)";
    }

    if (paymentType.includes("bank")) {
      return "Transaction Reference";
    }

    if (paymentType.includes("paypal")) {
      return "PayPal Transaction ID";
    }

    if (paymentType.includes("zelle")) {
      return "Payment Reference";
    }

    return "Payment Reference";
  }, [paymentType]);

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

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

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

      if (transactionHash?.trim()) {
        formData.append("paymentReference", transactionHash.trim());
      }

      formData.append("paymentMethodId", passedPaymentMethod.methodId || "");
      formData.append("paymentMethodType", passedPaymentMethod.type || "");
      formData.append("paymentMethodLabel", passedPaymentMethod.label || "");
      formData.append("paymentNetwork", networkLabel || "");
      formData.append("paymentDestination", String(destinationValue || ""));
      formData.append("paymentDetails", JSON.stringify(paymentDetails || {}));

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
              Your payment receipt has been submitted for verification. We&apos;ll
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
                    <li>You&apos;ll see your cardId after approval</li>
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

  const extraDetails = Object.entries(paymentDetails || {}).filter(([key, value]) => {
    if (!value) return false;

    const normalized = key.toLowerCase().replace(/\s+/g, "");
    const hidden = [
      "walletaddress",
      "accountnumber",
      "email",
      "network",
    ];

    return !hidden.includes(normalized);
  });

  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() =>
            navigate("/payment", {
              state: {
                package: packageData,
                amount,
              },
            })
          }
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Payment
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className={`bg-gradient-to-r ${packageData.color} p-8 text-white`}>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Verify Payment</h1>
              <FileText className="h-8 w-8 opacity-75" />
            </div>
            <p className="text-lg opacity-90">
              Upload your payment receipt for {packageData.name} Card
            </p>
          </div>

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

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium text-gray-900">
                  {paymentLabel}
                </span>
              </div>

              {transactionHash && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{verificationLabel}:</span>
                  <span className="font-medium text-gray-900 font-mono text-xs">
                    {transactionHash.length > 20
                      ? `${transactionHash.slice(0, 10)}...${transactionHash.slice(-8)}`
                      : transactionHash}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Network / Channel:</span>
                <span className="font-medium text-gray-900">{networkLabel}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{paymentPrimaryLabel}:</span>
                <span className="font-medium text-gray-900 font-mono text-xs">
                  {String(destinationValue || "N/A").length > 24
                    ? `${String(destinationValue).slice(0, 10)}...${String(
                        destinationValue
                      ).slice(-8)}`
                    : String(destinationValue || "N/A")}
                </span>
              </div>

              {extraDetails.map(([key, value]) => (
                <div className="flex justify-between text-sm" key={key}>
                  <span className="text-gray-600">{formatKey(key)}:</span>
                  <span className="font-medium text-gray-900 text-right break-all">
                    {String(value)}
                  </span>
                </div>
              ))}

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

            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{uploadError}</p>
              </div>
            )}

            <div className="mt-6 bg-blue-50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Important Instructions
              </h4>

              <ul className="space-y-2 text-sm text-blue-700">
                {importantInstructions.map((instruction, index) => (
                  <li className="flex items-start" key={instruction}>
                    <span className="bg-blue-200 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>

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
              By submitting, you confirm that this payment was made using the selected payment method shown above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPayment;