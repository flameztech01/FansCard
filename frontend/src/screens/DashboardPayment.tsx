import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Clock, 
  Bitcoin,
  Wallet,
  Info
} from 'lucide-react';

interface PackageInfo {
  id: string;
  name: string;
  price: number;
  description: string;
  color: string;
  features: string[];
}

const DashboardPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('30:00');
  
  // Get package data from navigation state
  const packageData = location.state?.package as PackageInfo;
  const amount = location.state?.amount as number;

  // Mock wallet address - in production, this would come from your backend
  const walletAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
  
  // Mock transaction hash - user would input this after payment
  const [transactionHash, setTransactionHash] = useState('');

  // Redirect if no package data
  useEffect(() => {
    if (!packageData || !amount) {
      navigate('/packages');
    }
  }, [packageData, amount, navigate]);

  // Countdown timer for payment window
  useEffect(() => {
    const timer = setInterval(() => {
      // This is just a mock timer - implement actual countdown logic
      setTimeLeft(prev => {
        const [mins, secs] = prev.split(':').map(Number);
        if (mins === 0 && secs === 0) {
          clearInterval(timer);
          return 'Expired';
        }
        if (secs === 0) {
          return `${mins - 1}:59`;
        }
        return `${mins}:${(secs - 1).toString().padStart(2, '0')}`;
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
      console.error('Failed to copy:', err);
    }
  };

  const handleVerifyPayment = () => {
    // Navigate to verification page with transaction hash
    navigate('/verify-payment', {
      state: {
        package: packageData,
        amount: amount,
        transactionHash: transactionHash,
        walletAddress: walletAddress
      }
    });
  };

  if (!packageData || !amount) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/packages')}
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
              Pay with Cryptocurrency to activate your {packageData.name} Card
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
                    Please complete your payment within <span className="font-bold">{timeLeft}</span>. 
                    The wallet address will expire after this time.
                  </p>
                </div>
              </div>
            </div>

            {/* Amount Summary */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-semibold text-gray-900">{packageData.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount (NGN):</span>
                  <span className="font-semibold text-gray-900">₦{amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-gray-600">Amount (BTC):</span>
                  <span className="font-semibold text-gray-900">
                    {(amount / 50000000).toFixed(8)} BTC
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-semibold text-gray-900">Ethereum (ERC-20)</span>
                </div>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send Payment To (Wallet Address)
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
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2 min-w-[100px] justify-center"
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
                Send only ERC-20 USDT or ETH to this address. Other networks will result in loss of funds.
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
                placeholder="Paste your transaction hash here after payment"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                You can find this in your wallet after sending the payment
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
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">1</span>
                  Copy the wallet address above
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">2</span>
                  Send exactly <span className="font-bold mx-1">₦{amount.toLocaleString()}</span> worth of USDT/ETH to this address
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">3</span>
                  Wait for 1-3 confirmations on the blockchain
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-0.5">4</span>
                  Paste the transaction hash above and click "Verify Payment"
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/packages')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPayment}
                disabled={!transactionHash}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  transactionHash
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
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
          <p className="text-sm text-gray-500 mb-3">Supported Networks</p>
          <div className="flex justify-center space-x-4">
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">Ethereum (ERC-20)</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">Binance Smart Chain (BEP-20)</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">Polygon</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPayment;