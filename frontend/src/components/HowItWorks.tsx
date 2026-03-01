import { UserPlus, CreditCard, Smartphone, Ticket, Gift, Shield, ArrowRight, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <UserPlus className="h-8 w-8 text-white" />,
      title: "Create Account",
      description: "Sign up in seconds with your email or social media account. It's free and easy!",
      color: "from-blue-400 to-blue-500",
      details: [
        "Free registration",
        "Email or social sign-up",
        "No commitment required"
      ]
    },
    {
      icon: <CreditCard className="h-8 w-8 text-white" />,
      title: "Choose Package",
      description: "Select the Fan Card package that matches your passion - Basic, Standard, or Premium.",
      color: "from-purple-400 to-purple-500",
      details: [
        "Compare features",
        "Flexible pricing",
        "Instant upgrade options"
      ]
    },
    {
      icon: <Smartphone className="h-8 w-8 text-white" />,
      title: "Get Digital Card",
      description: "Receive your instant digital Fan Card via email and the app. Ready to use immediately!",
      color: "from-pink-400 to-pink-500",
      details: [
        "Instant delivery",
        "Apple Wallet & Google Pay",
        "Always in your phone"
      ]
    },
    {
      icon: <Ticket className="h-8 w-8 text-white" />,
      title: "Start Enjoying",
      description: "Access exclusive perks, discounts, and special events right away.",
      color: "from-orange-400 to-orange-500",
      details: [
        "Exclusive content",
        "Merch discounts",
        "Priority access"
      ]
    }
  ];

  const benefits = [
    {
      icon: <Shield className="h-6 w-6 text-blue-500" />,
      text: "Secure digital wallet"
    },
    {
      icon: <Gift className="h-6 w-6 text-purple-500" />,
      text: "Exclusive member perks"
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      text: "Instant activation"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-40 right-0 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-40 left-0 w-96 h-96 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-50 rounded-full px-4 py-2 mb-4">
            <span className="text-blue-600 font-semibold text-sm">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get your Fan Card in four simple steps and start enjoying exclusive benefits immediately.
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="relative mb-20">
          {/* Connection Line (hidden on mobile) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 transform -translate-y-1/2"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm border-4 border-white">
                  {index + 1}
                </div>
                
                {/* Icon Circle */}
                <div className={`relative z-10 mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-r ${step.color} shadow-lg transform hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 mb-4">{step.description}</p>
                
                {/* Details */}
                <ul className="space-y-2">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-500">
                      <ArrowRight className="h-3 w-3 text-blue-500 mr-2" />
                      {detail}
                    </li>
                  ))}
                </ul>

                {/* Arrow for desktop (except last) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <ArrowRight className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Video/Image Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="p-8 md:p-12 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to become a superfan?
              </h3>
              <p className="text-blue-100 mb-6 text-lg">
                Join thousands of fans who are already enjoying exclusive perks and unforgettable experiences.
              </p>
              
              {/* Benefits */}
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <div className="bg-white/20 p-2 rounded-lg mr-3">
                      {benefit.icon}
                    </div>
                    <span className="text-white">{benefit.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <a
                href="#packages"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-300 transform hover:scale-105"
              >
                View Packages
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>

            {/* Right Image */}
            <div className="relative h-64 md:h-96">
              <img 
                src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Happy fans using Fan Card"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* FAQ Teaser */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help!
          </p>
          <a 
            href="#support"
            className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            Visit our Support Center
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;