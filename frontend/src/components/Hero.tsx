import { ArrowRight, Star, Shield, Zap } from 'lucide-react';

const Hero = () => {
  const scrollToPackages = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('packages');
    if (element) {
      const offset = 80; // Height of navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="./background.jpg" 
          alt="Stadium background" 
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-600/80"></div>
      </div>

      {/* Abstract shapes for visual interest */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
          <Star className="h-4 w-4 text-yellow-400 mr-2" fill="currentColor" />
          <span className="text-white/90 text-sm font-medium">Premium Fan Cards Available Now</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Your Ultimate
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            Fan Card Experience
          </span>
        </h1>

        {/* Description */}
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
          Get exclusive access, premium perks, and unforgettable moments with your favorite teams. Choose the perfect Fan Card that matches your passion.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <a
            href="#packages"
            onClick={scrollToPackages}
            className="group inline-flex items-center px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 hover:from-yellow-500 hover:to-orange-500 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
          >
            View Packages
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-full bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/40 transform hover:scale-105 transition-all duration-300"
          >
            How It Works
          </a>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 text-white/80">
            <Shield className="h-6 w-6 text-yellow-400" />
            <span className="text-sm font-medium">Secure Payment</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-white/80">
            <Zap className="h-6 w-6 text-yellow-400" />
            <span className="text-sm font-medium">Instant Access</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-white/80">
            <Star className="h-6 w-6 text-yellow-400" />
            <span className="text-sm font-medium">Premium Benefits</span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block">
          <a
            href="#packages"
            onClick={scrollToPackages}
            className="flex flex-col items-center text-white/60 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="text-sm mb-2">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center group-hover:border-white/50 transition-colors">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce"></div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;