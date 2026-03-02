import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Instagram } from 'lucide-react';

const THAIS_PROMO_CLAIM_URL = '/projects/carioca-coastal-club?promo=thais-follow';

const ThaisPromoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-white pt-28 pb-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-amber-200 bg-white p-8 shadow-lg">
          <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            <Gift className="mr-1.5 h-3.5 w-3.5" />
            Thai82 Promotion
          </div>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">Thais&apos; Barraca Discount Pass</h1>
          <p className="mt-3 text-gray-700">
            Follow <span className="font-semibold">@thai.82ipanema</span> and claim your reusable supporter badge.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://instagram.com/thai.82ipanema"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-3 font-semibold text-white transition-all hover:from-pink-600 hover:to-purple-700"
            >
              <Instagram className="mr-2 h-4 w-4" />
              Follow on Instagram
            </a>
            <Link
              to={THAIS_PROMO_CLAIM_URL}
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Open Claim Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThaisPromoPage;
