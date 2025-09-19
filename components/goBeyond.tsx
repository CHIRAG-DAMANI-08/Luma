import { HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white rounded-2xl p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.05)] flex flex-col items-center">
    <div className="w-16 h-16 flex items-center justify-center">
      {icon}
    </div>
    <h3 className="mt-6 text-xl font-medium font-sans text-black">
      {title}
    </h3>
    <p className="mt-2 text-base text-gray-600">
      {description}
    </p>
  </div>
);

const GoingBeyondSection: React.FC = () => {
  const features: FeatureCardProps[] = [
    {
      icon: <HeartHandshake className="h-12 w-12 text-[#8B5CF6]" strokeWidth={1.5} />,
      title: 'Winning Partnerships',
      description: 'Access trusted partners in teletherapy, mobility, meal boxes, and more—making your wellness journey more supportive and affordable.',
    },
    {
      icon: <ShieldCheck className="h-12 w-12 text-[#8B5CF6]" strokeWidth={1.5} />,
      title: 'Secure & Confidential',
      description: 'Luma follows the highest security standards to protect your data and keep your activity on the platform private.',
    },
    {
      icon: <Sparkles className="h-12 w-12 text-[#8B5CF6]" strokeWidth={1.5} />,
      title: '5-Star Support',
      description: 'Fast, compassionate, and helpful support. We\'re here to help you get the most out of Luma—at your pace.',
    },
  ];

  return (
    <section className="bg-[#F4F1FF] py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center">
          <h2 className="font-serif text-4xl md:text-[40px] font-normal text-gray-800 leading-tight">
            Going beyond benefits
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
            Luma is more than benefits; it's a suite of supportive tools in one intuitive place—so you can focus on feeling better, not figuring things out.
          </p>
        </div>
        <div className="mt-16 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoingBeyondSection;