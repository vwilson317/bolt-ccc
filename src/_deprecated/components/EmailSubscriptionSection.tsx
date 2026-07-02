import React from 'react';
import { useTranslation } from 'react-i18next';
import EmailSubscription from './EmailSubscription';

interface EmailSubscriptionSectionProps {
  title: string;
  description: string;
  backgroundImages?: {
    desktop: string;
    mobile: string;
  };
  className?: string;
  id?: string;
  animationRef?: React.RefObject<HTMLElement>;
  animationClasses?: string;
}

const EmailSubscriptionSection: React.FC<EmailSubscriptionSectionProps> = ({
  title,
  description,
  backgroundImages = {
    desktop: "https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/editsV1/80-group-2.jpg?width=1600&quality=80&fit=cover",
    mobile: "https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/group-v-1.jpg?width=900&quality=80&fit=cover"
  },
  className = "",
  id,
  animationRef,
  animationClasses = ""
}) => {
  return (
    <section 
      id={id}
      ref={animationRef} 
      className={`relative aspect-[8.5/11] md:aspect-[3/2] ${animationClasses} ${className}`}
    > 
      {/* Mobile background */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center md:hidden"
        style={{ backgroundImage: `url('${backgroundImages.mobile}')` }}
      />
      {/* Desktop/Tablet background */}
      <div
        className="hidden md:block absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url('${backgroundImages.desktop}')` }}
      />
      <div className="absolute inset-0 w-full h-full bg-black/50" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center h-full flex flex-col justify-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
          {title}
        </h2>
        <p className="text-xl text-white mb-8 max-w-2xl mx-auto drop-shadow">
          {description}
        </p>
        <div className="bg-transparent md:bg-white/40 backdrop-blur-none md:backdrop-blur-sm rounded-2xl p-8 shadow-none md:shadow-lg inline-block w-full max-w-xl mx-auto opacity-100 pointer-events-auto transition-all duration-200">
          <EmailSubscription />
        </div>
      </div>
    </section>
  );
};

export default EmailSubscriptionSection;
