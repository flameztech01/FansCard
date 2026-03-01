import { useState } from 'react';
import { Check, Star, Zap, Crown, Bitcoin, Wallet } from 'lucide-react';

interface Package {
  id: string;
  name: 'Basic' | 'Standard' | 'Premium';
  price: number;
  currency: string;
  features: string[];
  popular: boolean;
  image: string;
  cryptoPrice: {
    btc: string;
    eth: string;
    usdt: string;
  };
}

const packagesData: Package[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29.99,
    currency: 'USD',
    features: [
      'Digital Fan Card',
      'Basic Stats Access',
      'Monthly Newsletter',
      'Fan Forum Access',
      '10% Merch Discount'
    ],
    popular: false,
    image: 'https://images.unsplash.com/photo-1566576912328-1099d3b1ed7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    cryptoPrice: {
      btc: '0.00045',
      eth: '0.0085',
      usdt: '29.99'
    }
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 49.99,
    currency: 'USD',
    features: [
      'Physical Fan Card + Digital',
      'Premium Stats Access',
      'Exclusive Content',
      'Priority Support',
      '20% Merch Discount',
      'Early Ticket Access',
      'Fan Meet-up Invites'
    ],
    popular: true,
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    cryptoPrice: {
      btc: '0.00075',
      eth: '0.0142',
      usdt: '49.99'
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99.99,
    currency: 'USD',
    features: [
      'Premium Physical Card',
      'All Stats Access',
      'Behind-the-Scenes Content',
      'VIP Support',
      '30% Merch Discount',
      'Guaranteed Ticket Access',
      'VIP Event Invitations',
      'Player Meet & Greet Chances',
      'Exclusive Merch Drops'
    ],
    popular: false,
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    cryptoPrice: {
      btc: '0.0015',
      eth: '0.0285',
      usdt: '99.99'
    }
  }
];

const Packages = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<'btc' | 'eth' | 'usdt'>('usdt');

  const handleBuy = (pkg: Package) => {
    // Here you would integrate with your crypto payment processor
    const paymentData = {
      package: pkg.name,
      amount: pkg.cryptoPrice[selectedCrypto],
      currency: selectedCrypto.toUpperCase(),
      address: generateWalletAddress(pkg.id, selectedCrypto) // You'll implement this
    };
    
    console.log('Crypto payment initiated:', paymentData);
    alert(`Please send ${paymentData.amount} ${paymentData.currency} to the provided wallet address`);
  };

  const generateWalletAddress = (packageId: string, crypto: string) => {
    // This would be replaced with actual wallet address generation
    const addresses = {
      btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      eth: '0x742d35Cc6634C0532925a3b844Bc5e76f9f1b5b9',
      usdt: '0x742d35Cc6634C0532925a3b844Bc5e76f9f1b5b9'
    };
    return addresses[crypto as keyof typeof addresses];
  };

  const getCardStyles = (pkg: Package) => {
    const baseStyles = "relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300";
    const hoverStyles = hoveredCard === pkg.id ? "transform -translate-y-2 shadow-2xl" : "";
    const borderStyles = pkg.popular ? "border-2 border-yellow-400" : "border border-gray-100";
    
    return `${baseStyles} ${hoverStyles} ${borderStyles}`;
  };

  const getIcon = (name: string) => {
    switch(name) {
      case 'Basic': return <Star className="h-6 w-6 text-gray-400" />;
      case 'Standard': return <Zap className="h-6 w-6 text-yellow-500" />;
      case 'Premium': return <Crown className="h-6 w-6 text-purple-500" />;
      default: return null;
    }
  };

  const getGradient = (name: string) => {
    switch(name) {
      case 'Basic': return 'from-gray-500 to-gray-600';
      case 'Standard': return 'from-blue-500 to-blue-600';
      case 'Premium': return 'from-purple-500 to-pink-500';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  return (
    <section id="packages" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-100 rounded-full px-4 py-2 mb-4">
            <Bitcoin className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-blue-600 font-semibold text-sm">Crypto Payments Only</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Fan Cards for Every
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Passion Level</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Secure, anonymous, and instant. Pay with Bitcoin, Ethereum, or USDT.
          </p>
        </div>

        {/* Crypto Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex">
            {[
              { id: 'btc', label: 'BTC', icon: '₿' },
              { id: 'eth', label: 'ETH', icon: 'Ξ' },
              { id: 'usdt', label: 'USDT', icon: '₮' }
            ].map((crypto) => (
              <button
                key={crypto.id}
                onClick={() => setSelectedCrypto(crypto.id as 'btc' | 'eth' | 'usdt')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  selectedCrypto === crypto.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{crypto.icon}</span>
                <span>{crypto.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packagesData.map((pkg) => (
            <div
              key={pkg.id}
              className={getCardStyles(pkg)}
              onMouseEnter={() => setHoveredCard(pkg.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1 rounded-full text-sm font-semibold z-10">
                  Most Popular
                </div>
              )}

              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={pkg.image} 
                  alt={pkg.name}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${getGradient(pkg.name)} opacity-60`}></div>
                <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                  {getIcon(pkg.name)}
                  <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Crypto Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      {pkg.cryptoPrice[selectedCrypto]}
                    </span>
                    <span className="text-gray-600 ml-2">
                      {selectedCrypto.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    ≈ ${pkg.price} USD
                  </p>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Buy Button */}
                <button
                  onClick={() => handleBuy(pkg)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2
                    ${pkg.popular 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 hover:from-yellow-500 hover:to-orange-500 shadow-lg' 
                      : `bg-gradient-to-r ${getGradient(pkg.name)} text-white hover:shadow-lg`
                    }`}
                >
                  <Wallet className="h-5 w-5" />
                  <span>Pay with {selectedCrypto.toUpperCase()}</span>
                </button>

                {/* Wallet Address Preview (simplified) */}
                <p className="text-xs text-gray-400 text-center mt-4">
                  Instant crypto payment • 0 fees
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Crypto Info */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-3xl mx-auto">
            <Bitcoin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Why Crypto?</h3>
            <p className="text-gray-600 mb-4">
              • Instant transactions • Lower fees • Global access • Maximum privacy
            </p>
            <div className="flex justify-center space-x-8">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">BTC</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">ETH</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">USDT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Packages;