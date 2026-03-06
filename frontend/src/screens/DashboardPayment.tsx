import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Bitcoin,
  Wallet,
  Info,
  Landmark,
  CreditCard,
  Coins,
} from "lucide-react";

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

type RootState = {
  auth: {
    userInfo?: {
      paymentMethods?: PaymentMethod[];
      selectedPaymentMethod?: PaymentMethod | null;
    };
  };
};

const FALLBACK_PAYMENT_METHOD: PaymentMethod = {
  methodId: "fallback_btc_1",
  type: "bitcoin",
  label: "Bitcoin Payment",
  details: {
    walletAddress: "bc1qpz0zk8jv4jxkynpgmnmh3qwdf9gfpydzhzfx9h",
    network: "Bitcoin (BTC) Network",
  },
};

const DashboardPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  const [copied, setCopied] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState("");

  const packageData = location.state?.package as PackageInfo | undefined;
  const amount = location.state?.amount as number | undefined;

  const userPaymentMethods = useMemo(() => {
    return Array.isArray(userInfo?.paymentMethods) ? userInfo.paymentMethods : [];
  }, [userInfo]);

  const availablePaymentMethods = useMemo(() => {
    return userPaymentMethods.length > 0
      ? userPaymentMethods
      : [FALLBACK_PAYMENT_METHOD];
  }, [userPaymentMethods]);

  useEffect(() => {
    if (!packageData || !amount) {
      navigate("/packages");
    }
  }, [packageData, amount, navigate]);

  useEffect(() => {
    const defaultMethod = userInfo?.selectedPaymentMethod?.methodId
      ? availablePaymentMethods.find(
          (method) => method.methodId === userInfo.selectedPaymentMethod?.methodId
        )
      : null;

    if (defaultMethod?.methodId) {
      setSelectedMethodId(defaultMethod.methodId);
      return;
    }

    if (availablePaymentMethods[0]?.methodId) {
      setSelectedMethodId(availablePaymentMethods[0].methodId);
    }
  }, [availablePaymentMethods, userInfo]);

  const selectedPaymentMethod = useMemo(() => {
    return (
      availablePaymentMethods.find(
        (method) => method.methodId === selectedMethodId
      ) || availablePaymentMethods[0]
    );
  }, [availablePaymentMethods, selectedMethodId]);

  const paymentType = String(selectedPaymentMethod?.type || "").toLowerCase();
  const paymentLabel = selectedPaymentMethod?.label || "Payment Method";
  const paymentDetails = selectedPaymentMethod?.details || {};

  const normalizeKey = (key: string) =>
    key.toLowerCase().replace(/[\s_-]/g, "");

  const getDetailValue = (
    obj: Record<string, any>,
    possibleKeys: string[]
  ): string => {
    const entries = Object.entries(obj || {});
    for (const wantedKey of possibleKeys) {
      const normalizedWanted = normalizeKey(wantedKey);
      const found = entries.find(
        ([key]) => normalizeKey(key) === normalizedWanted
      );
      if (
        found &&
        found[1] !== undefined &&
        found[1] !== null &&
        String(found[1]).trim() !== ""
      ) {
        return String(found[1]);
      }
    }
    return "";
  };

  const paymentDestination = useMemo(() => {
    if (!selectedPaymentMethod) {
      return {
        title: "Payment Details",
        value: "",
        hint: "",
        network: "",
      };
    }

    const lowerType = String(selectedPaymentMethod.type || "").toLowerCase();

    const walletAddress = getDetailValue(paymentDetails, [
      "walletAddress",
      "wallet address",
      "address",
      "cryptoAddress",
      "crypto address",
    ]);

    const accountNumber = getDetailValue(paymentDetails, [
      "accountNumber",
      "account number",
      "acctNumber",
      "acct number",
    ]);

    const bankName = getDetailValue(paymentDetails, [
      "bankName",
      "bank name",
    ]);

    const email = getDetailValue(paymentDetails, [
      "email",
      "paypalEmail",
      "paypal email",
      "zelleEmail",
      "zelle email",
    ]);

    const phone = getDetailValue(paymentDetails, [
      "phone",
      "phoneNumber",
      "phone number",
    ]);

    const network = getDetailValue(paymentDetails, [
      "network",
      "chain",
      "blockchain",
    ]);

    if (
      lowerType.includes("btc") ||
      lowerType.includes("bitcoin") ||
      lowerType.includes("crypto") ||
      walletAddress
    ) {
      return {
        title: "Wallet Address",
        value: walletAddress,
        hint: "Send only to this wallet address using the correct network shown below.",
        network: network || selectedPaymentMethod.label || "Crypto",
      };
    }

    if (lowerType.includes("bank")) {
      return {
        title: "Bank Account Number",
        value: accountNumber,
        hint: "Transfer only to this bank account and keep your proof of payment.",
        network: bankName || "Bank Transfer",
      };
    }

    if (lowerType.includes("zelle")) {
      return {
        title: "Zelle Account",
        value: email || phone,
        hint: "Send payment using the Zelle details shown below.",
        network: "Zelle",
      };
    }

    if (lowerType.includes("paypal")) {
      return {
        title: "PayPal Account",
        value: email,
        hint: "Send payment to this PayPal account.",
        network: "PayPal",
      };
    }

    return {
      title: "Payment Details",
      value: walletAddress || accountNumber || email || phone,
      hint: "Use the payment details below to complete your payment.",
      network: network || selectedPaymentMethod.label || "Custom Payment",
    };
  }, [paymentDetails, selectedPaymentMethod]);

  const handleCopyAddress = async () => {
    if (!paymentDestination.value) return;

    try {
      await navigator.clipboard.writeText(String(paymentDestination.value));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleVerifyPayment = () => {
    if (!packageData || !amount || !selectedPaymentMethod) return;

    navigate("/verify-payment", {
      state: {
        package: packageData,
        amount,
        transactionHash,
        paymentMethod: selectedPaymentMethod,
        paymentType: selectedPaymentMethod.type,
        paymentLabel: selectedPaymentMethod.label,
        paymentDetails: selectedPaymentMethod.details,
        destinationValue: paymentDestination.value,
        network: paymentDestination.network,
      },
    });
  };

  const formatLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getMethodIcon = (type?: string) => {
    const lower = String(type || "").toLowerCase();

    if (lower.includes("btc") || lower.includes("bitcoin")) {
      return <Bitcoin className="h-5 w-5" />;
    }

    if (lower.includes("crypto")) {
      return <Coins className="h-5 w-5" />;
    }

    if (lower.includes("bank")) {
      return <Landmark className="h-5 w-5" />;
    }

    return <CreditCard className="h-5 w-5" />;
  };

  const headerIcon = useMemo(() => {
    return getMethodIcon(paymentType);
  }, [paymentType]);

  const verificationFieldLabel = useMemo(() => {
    if (
      paymentType.includes("btc") ||
      paymentType.includes("bitcoin") ||
      paymentType.includes("crypto")
    ) {
      return "Transaction Hash / Payment Reference";
    }

    if (paymentType.includes("bank")) {
      return "Transaction Reference / Narration";
    }

    if (paymentType.includes("paypal")) {
      return "PayPal Transaction ID";
    }

    return "Payment Reference";
  }, [paymentType]);

  const verificationPlaceholder = useMemo(() => {
    if (
      paymentType.includes("btc") ||
      paymentType.includes("bitcoin") ||
      paymentType.includes("crypto")
    ) {
      return "Enter your wallet transaction hash or payment reference";
    }

    if (paymentType.includes("bank")) {
      return "Enter your bank transfer reference, session ID, or narration";
    }

    if (paymentType.includes("paypal")) {
      return "Enter your PayPal transaction ID";
    }

    return "Enter your payment reference here";
  }, [paymentType]);

  if (!packageData || !amount) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/packages")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Packages
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className={`bg-gradient-to-r ${packageData.color} p-8 text-white`}>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Complete Payment</h1>
              <div className="opacity-90">{headerIcon}</div>
            </div>
            <p className="text-lg opacity-90">
              Pay with {paymentLabel} to activate your {packageData.name} Card
            </p>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Methods
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availablePaymentMethods.map((method) => {
                  const active = method.methodId === selectedMethodId;

                  return (
                    <button
                      key={method.methodId}
                      type="button"
                      onClick={() => {
                        setSelectedMethodId(method.methodId);
                        setCopied(false);
                        setTransactionHash("");
                      }}
                      className={`text-left rounded-2xl border p-4 transition-all ${
                        active
                          ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`rounded-full p-2 ${
                              active
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {getMethodIcon(method.type)}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {method.label || method.type || "Payment Method"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {method.type || "custom"}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`mt-1 h-4 w-4 rounded-full border-2 ${
                            active
                              ? "border-blue-600 bg-blue-600"
                              : "border-gray-300"
                          }`}
                        >
                          {active && (
                            <div className="flex h-full w-full items-center justify-center text-white text-[10px]">
                              •
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-semibold text-gray-900">
                    {packageData.name}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount (USD):</span>
                  <span className="font-semibold text-gray-900">
                    ${amount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold text-gray-900">{paymentLabel}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Network / Channel:</span>
                  <span className="font-semibold text-gray-900">
                    {paymentDestination.network || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Details
              </h3>

              {paymentDestination.value ? (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {paymentDestination.title}
                  </label>

                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={String(paymentDestination.value || "")}
                        readOnly
                        className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-300 rounded-xl text-gray-600 font-mono text-sm"
                      />
                      <Wallet className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    </div>

                    <button
                      onClick={handleCopyAddress}
                      disabled={!paymentDestination.value}
                      className={`px-4 py-3 rounded-xl transition-colors flex items-center space-x-2 min-w-[110px] justify-center ${
                        paymentDestination.value
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {paymentDestination.hint && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                      <Info className="h-3 w-3 mr-1" />
                      {paymentDestination.hint}
                    </p>
                  )}
                </>
              ) : null}

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(paymentDetails).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      {formatLabel(key)}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 break-all">
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {verificationFieldLabel}
              </label>
              <input
                type="text"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder={verificationPlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter the payment reference you got after making the payment.
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                How to Complete Payment
              </h3>

              <ol className="space-y-3 text-sm text-blue-700">
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                    1
                  </span>
                  Select one payment method above
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                    2
                  </span>
                  Copy the payment detail shown below it
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                    3
                  </span>
                  Pay <span className="font-bold mx-1">${amount.toLocaleString()}</span>
                  using {paymentLabel}
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                    4
                  </span>
                  Enter the reference and click “Verify Payment”
                </li>
              </ol>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => navigate("/packages")}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleVerifyPayment}
                disabled={!transactionHash.trim()}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  transactionHash.trim()
                    ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <span>Verify Payment</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Always confirm payment details carefully before sending money
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPayment;