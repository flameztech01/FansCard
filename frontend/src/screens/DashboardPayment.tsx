import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Clock,
  Bitcoin,
  Wallet,
  Info,
} from "lucide-react";

interface PackageInfo {
  id: string;
  name: string;
  price: number;
  description: string;
  color: string; // tailwind gradient classes e.g. "from-blue-600 to-purple-600"
  features: string[];
}

const DashboardPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState("30:00");
  const [transactionHash, setTransactionHash] = useState("");

  // ✅ Bitcoin (SegWit bech32) address
  const walletAddress = "bc1qpz0zk8jv4jxkynpgmnmh3qwdf9gfpydzhzfx9h";
  const networkName = "Bitcoin (BTC) Network";

  // Get package data from navigation state
  const packageData = location.state?.package as PackageInfo | undefined;
  const amount = location.state?.amount as number | undefined;

  // Redirect if no package data
  useEffect(() => {
    if (!packageData || !amount) {
      navigate("/packages");
    }
  }, [packageData, amount, navigate]);

  // Countdown timer for payment window
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === "Expired") return prev;

        const [minsStr, secsStr] = prev.split(":");
        const mins = Number(minsStr);
        const secs = Number(secsStr);

        if (Number.isNaN(mins) || Number.isNaN(secs)) return "Expired";

        if (mins === 0 && secs === 0) {
          clearInterval(timer);
          return "Expired";
        }

        if (secs === 0) {
          return `${Math.max(mins - 1, 0)}:59`;
        }

        return `${mins}:${String(secs - 1).padStart(2, "0")}`;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleVerifyPayment = () => {
    if (!packageData || !amount) return;

    navigate("/verify-payment", {
      state: {
        package: packageData,
        amount,
        transactionHash,
        walletAddress,
        network: "bitcoin",
      },
    });
  };

  const btcEstimate = useMemo(() => {
    // ⚠️ This is just a placeholder conversion (needs live BTC price to be accurate)
    // Keep it optional so you don't mislead users.
    return null as null | string;
  }, []);

  if (!packageData || !amount) return null;

  const isExpired = timeLeft === "Expired";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/packages")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Packages
        </button>

        {/* Main Payment Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${packageData.color} p-8 text-white`}>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Complete Payment</h1>
              <Bitcoin className="h-8 w-8 opacity-75" />
            </div>
            <p className="text-lg opacity-90">
              Pay with Bitcoin to activate your {packageData.name} Card
            </p>
          </div>

          {/* Payment Details */}
          <div className="p-8">
            {/* Timer Alert */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Payment Window</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please complete your payment within{" "}
                    <span className="font-bold">{timeLeft}</span>. The wallet
                    address will expire after this time.
                  </p>
                  {isExpired && (
                    <p className="text-sm text-red-600 mt-2 font-medium">
                      Payment window expired. Please go back and restart payment.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Amount Summary */}
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

                {/* Optional BTC estimate (only show if you later plug real rate) */}
                {btcEstimate && (
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-gray-600">Estimated Amount (BTC):</span>
                    <span className="font-semibold text-gray-900">{btcEstimate} BTC</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-semibold text-gray-900">{networkName}</span>
                </div>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send Payment To (Bitcoin Address)
              </label>

              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={walletAddress}
                    readOnly
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-300 rounded-xl text-gray-600 font-mono text-sm"
                  />
                  <Wallet className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                </div>

                <button
                  onClick={handleCopyAddress}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2 min-w-[110px] justify-center"
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

              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                Send only BTC on the Bitcoin network to this address. Do not use
                other networks.
              </p>
            </div>

            {/* Transaction Hash Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Hash (TXID)
              </label>
              <input
                type="text"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="Paste your Bitcoin transaction hash here after payment"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                You can find this TXID in your Bitcoin wallet after sending the payment
              </p>
            </div>

            {/* Steps */}
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
                  Copy the Bitcoin address above
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                    2
                  </span>
                  Send <span className="font-bold mx-1">${amount.toLocaleString()}</span>
                  worth of BTC to the address (your wallet will show the BTC amount)
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                    3
                  </span>
                  Wait for confirmations on the Bitcoin network
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                    4
                  </span>
                  Paste the transaction hash (TXID) and click “Verify Payment”
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => navigate("/packages")}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleVerifyPayment}
                disabled={!transactionHash || isExpired}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  transactionHash && !isExpired
                    ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <span>Verify Payment</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>

            {/* Security Note */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Never share your private keys or seed phrase with anyone
              </p>
            </div>
          </div>
        </div>

        {/* Supported Networks */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-3">Supported Network</p>
          <div className="flex justify-center">
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
              Bitcoin (BTC)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPayment;