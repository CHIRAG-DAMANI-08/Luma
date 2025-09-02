import React from 'react';
import { Shield, Heart, Star } from 'lucide-react';

const BenefitsSection = () => {
  const benefits = [
    {
      icon: <Star className="w-8 h-8 text-pink-500" />,
      title: "AI-Powered Guidance",
      description: "Receive instant, personalized support from Luma’s advanced AI companion. Get actionable advice, coping strategies, and wellness tips tailored to your unique needs—anytime, anywhere."
    },
    {
      icon: <Shield className="w-8 h-8 text-pink-500" />,
      title: "Secure & Confidential",
      description: "Luma uses the highest standards of security and privacy to protect your personal data and ensure your mental health journey remains completely confidential."
    },
    {
      icon: <Heart className="w-8 h-8 text-pink-500" />,
      title: "Curated Resources",
      description: "Access a rich library of mental wellness resources, including articles, exercises, and guided meditations, all designed to help you grow and thrive."
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center space-y-8 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Going beyond mental health
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Luma is much more than a mental health app; our AI companion and curated resources provide comprehensive support for your personal wellness journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center">
                  {benefit.icon}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BenefitsSection;