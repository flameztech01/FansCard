import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Zap, Crown, Bitcoin, Wallet } from 'lucide-react';

interface Package {
  id: string;
  name: 'Basic' | 'Standard' | 'Premium';
  price: number;
  currency: string;
  features: string[];
  popular: boolean;
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
    price: 700,
    currency: 'USD',
    features: [
      'Digital Fan Card',
      'Basic Stats Access',
      'Monthly Newsletter',
      'Fan Forum Access',
      '10% Merch Discount'
    ],
    popular: false,
    cryptoPrice: {
      btc: '0.0075',
      eth: '0.21',
      usdt: '700'
    }
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 1500,
    currency: 'USD',
    features: [
      'Digital Fan Card',
      'Premium Stats Access',
      'Exclusive Content',
      'Priority Support',
      '20% Merch Discount',
      'Early Ticket Access',
      'Fan Meet-up Invites'
    ],
    popular: true,
    cryptoPrice: {
      btc: '0.016',
      eth: '0.45',
      usdt: '1500'
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 3000,
    currency: 'USD',
    features: [
      'Digital Fan Card',
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
    cryptoPrice: {
      btc: '0.032',
      eth: '0.90',
      usdt: '3000'
    }
  }
];

const Packages = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [] = useState<'btc' | 'eth' | 'usdt'>('usdt');

  const handlePayWithUSDT = () => {
    // Navigate directly to dashboard
    navigate('/dashboard');
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

  const getButtonColor = (name: string) => {
    switch(name) {
      case 'Basic': return 'from-gray-600 to-gray-700';
      case 'Standard': return 'from-blue-600 to-blue-700';
      case 'Premium': return 'from-purple-600 to-pink-600';
      default: return 'from-blue-600 to-blue-700';
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
            <span className="text-blue-600 font-semibold text-sm">Digital Cards Only</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Digital 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Fan Card</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Instant digital delivery. No physical card, just pure fandom.
          </p>
        </div>

        {/* Crypto Toggle - Only USDT now */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex">
            <button
              className="px-8 py-3 rounded-lg font-semibold bg-blue-600 text-white shadow-lg flex items-center space-x-2"
            >
              <span>₮</span>
              <span>USDT</span>
            </button>
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

              {/* Header with color */}
              <div className={`h-32 bg-gradient-to-r ${getGradient(pkg.name)} p-6 flex items-center justify-between`}>
                <div className="flex items-center space-x-3">
                  {getIcon(pkg.name)}
                  <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>
                </div>
                <div className="text-white text-right">
                  <div className="text-3xl font-bold">${pkg.price}</div>
                  <div className="text-xs opacity-80">one-time</div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Crypto Price */}
                <div className="mb-6 text-center">
                  <div className="flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">
                      {pkg.cryptoPrice.usdt}
                    </span>
                    <span className="text-gray-600 ml-2 font-semibold">
                      USDT
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

                {/* Pay with USDT Button */}
                <button
                  onClick={handlePayWithUSDT}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 bg-gradient-to-r ${getButtonColor(pkg.name)} text-white hover:shadow-lg`}
                >
                  <Wallet className="h-5 w-5" />
                  <span>Pay with USDT</span>
                </button>

                {/* Instant Delivery Note */}
                <p className="text-xs text-green-600 text-center mt-4 flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Instant digital delivery
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Digital Card Info */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 text-white p-3 rounded-full">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">100% Digital Experience</h3>
            <p className="text-gray-600 mb-4">
              • Instant access • No physical card needed • Accessible anywhere • Eco-friendly
            </p>
            <div className="flex justify-center space-x-8">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">BTC</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">ETH</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
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