import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Users, MapPin, Smartphone, MessageCircle, Instagram, Calendar, Gift } from 'lucide-react';
import EmailSubscription from '../components/EmailSubscription';

const About: React.FC = () => {
  const { t } = useTranslation();

  const values = [
    {
      icon: Heart,
      title: 'Passion for Rio',
      description: 'We love Rio de Janeiro and want to connect barraca lovers with their favorite spots.'
    },
    {
      icon: Users,
      title: 'Community First', 
      description: 'Building loyalty between customers and barracas through better communication and service.'
    },
    {
      icon: Calendar,
      title: 'Convenience',
      description: 'Reserve chairs, get updates, and enjoy exclusive perks at participating barracas.'
    },
    {
      icon: Gift,
      title: 'Member Benefits',
      description: 'Exclusive offers, priority service, and special events for loyal customers.'
    }
  ];

  const stats = [
    { number: '50+', label: 'Partner Barracas' },
    { number: '5K+', label: 'Active Members' },
    { number: '24/7', label: 'Status Updates' },
    { number: '12', label: 'Neighborhoods' }
  ];

  const team = [
    {
      name: 'Vincent Wilson',
      role: 'Founder & CEO',
      bio: 'Born and raised in the United States, Vincent brings over 5 years of experience in international business development and relationship building across diverse markets.',
      image: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/editsV1/about%20edits/IMG_0385.jpg'
    },
    {
      name: 'Hans Yadav', 
      role: 'CTO',
      bio: 'Experienced technology leader with expertise in customer service systems and digital platform development.',
      image: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/editsV1/PHOTO-2025-07-02-15-28-36-2.jpg'
    },
    {
      name: 'Simon Paul',
      role: 'Director of Operations',
      bio: 'Tech enthusiast focused on creating seamless user experiences and optimizing operational processes.',
      image: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/editsV1/about%20edits/simon.jpg'
    },
    {
      name: 'Jordi De Avila',
      role: 'Business Operations Manager',
      bio: 'Dedicated professional with expertise in business process optimization and customer relationship management.',
      image: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/D276EFFE-BA05-4E40-9B3F-4F647DCD9FE9-2.jpg'
    },
    {
      name: 'Brandon Hodge',
      role: 'Head of Sales',
      bio: 'Sales professional with a proven track record in building client relationships and driving business growth.',
      image: 'https://images.pexels.com/photos/1181319/pexels-photo-1181319.jpeg'
    },
    {
      name: 'Chris Finn',
      role: 'Quality Control Specialist',
      bio: 'Detail-oriented professional focused on maintaining high standards and ensuring exceptional service quality.',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    },
    {
      name: 'Ricardo Del Razo',
      role: 'Head of Special Partnerships',
      bio: 'Strategic partnership expert with experience in developing and maintaining key business relationships.',
      image: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/editsV1/about%20edits/80-group-e-1.jpg'
    }

  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-600 pt-16 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6" data-lingo-skip>
            About Carioca Coastal Club
          </h1>
          <p className="text-xl text-orange-100 max-w-3xl mx-auto leading-relaxed" data-lingo-skip>
            We're the loyalty platform connecting Rio's barraca lovers with their favorite spots. 
            Check if your barraca is open, reserve chairs, and enjoy exclusive member benefits.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8" data-lingo-skip>
            Our Mission
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8" data-lingo-skip>
            To strengthen the bond between Rio's barraca community and their favorite spots. 
            We believe loyal customers deserve better service, and barraca owners deserve loyal customers 
            who keep coming back.
          </p>
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100">
            <p className="text-xl font-semibold text-gray-900 mb-4" data-lingo-skip>
              "Every barraca has its regulars - we help strengthen those relationships."
            </p>
            <p className="text-gray-600" data-lingo-skip>
              Through chair reservations, real-time updates, and exclusive member perks, 
              we make it easier for you to enjoy your favorite barraca spots while helping 
              barracas build stronger customer loyalty.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2" data-lingo-skip>
                  {stat.number}
                </div>
                <div className="text-orange-100 font-medium" data-lingo-skip>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-lingo-skip>
              What We Stand For
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-lingo-skip>
              The values that drive our loyalty platform and community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3" data-lingo-skip>
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed" data-lingo-skip>
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-lingo-skip>
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-lingo-skip>
              Barraca enthusiasts and tech experts working to strengthen Rio's barraca community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1" data-lingo-skip>
                  {member.name}
                </h3>
                <p className="text-orange-600 font-medium mb-3" data-lingo-skip>
                  {member.role}
                </p>
                <p className="text-gray-600 leading-relaxed" data-lingo-skip>
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-lingo-skip>
              Get in Touch
            </h2>
            <p className="text-lg text-gray-600" data-lingo-skip>
              Questions about membership? Want to partner with us? We'd love to hear from you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" data-lingo-skip>WhatsApp</h3>
                  <p className="text-gray-600" data-lingo-skip>Quick responses via WhatsApp</p>
                </div>
              </div>
              <a 
                href="https://wa.me/5521999990000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 font-medium hover:text-green-700"
                data-lingo-skip
              >
                +55 21 99999-0000
              </a>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-pink-100 p-3 rounded-lg mr-4">
                  <Instagram className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" data-lingo-skip>Instagram</h3>
                  <p className="text-gray-600" data-lingo-skip>Follow us for daily updates</p>
                </div>
              </div>
              <a 
                href="https://instagram.com/cariocacoastal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-pink-600 font-medium hover:text-pink-700"
                data-lingo-skip
              >
                @cariocacoastal
              </a>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4" data-lingo-skip>
              Join Our Community
            </h3>
            <p className="text-orange-100 mb-6" data-lingo-skip>
              Get member updates, chair reservation alerts, and exclusive offers from partner barracas
            </p>
            <EmailSubscription />
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;