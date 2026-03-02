import React from 'react';
import { MessageCircle } from 'lucide-react';
import ThaisPromotion from '../components/ThaisPromotion';

const CCC_WHATSAPP_URL = 'https://chat.whatsapp.com/FVLJK8eqKzUKY7oUfnymD5?mode=gi_t';

const ThaisPromoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-white pt-28 pb-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Quick intro */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Tye&apos;s Barraca Promotion</h1>
          <p className="text-gray-600 mb-5">
            You&apos;re moments away from unlocking a supporter discount at Thais&apos; barraca in Ipanema.
            Already part of the community?
          </p>
          <a
            href={CCC_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-semibold text-white hover:bg-green-600 transition-colors shadow-md"
          >
            <MessageCircle className="h-5 w-5" />
            Join the WhatsApp community
          </a>
        </div>

        {/* Promotion — reused from the home page */}
        <ThaisPromotion promoSource="tye_promo_page" />
      </div>
    </div>
  );
};

export default ThaisPromoPage;
