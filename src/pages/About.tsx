import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Users, MapPin, Smartphone, MessageCircle, Instagram, Calendar, Gift } from 'lucide-react';
import EmailSubscriptionSection from '../components/EmailSubscriptionSection';
import SEOHead from '../components/SEOHead';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const About: React.FC = () => {
  const { t } = useTranslation();

  // Scroll animations
  const heroAnimation = useScrollAnimation('slideUp');
  const missionAnimation = useScrollAnimation('fadeInScale');
  const statsAnimation = useScrollAnimation('slideUp', { delay: 200 });
  const valuesAnimation = useScrollAnimation('slideUpStagger');
  const teamAnimation = useScrollAnimation('rotateIn');
  const contactAnimation = useScrollAnimation('zoomIn');

  const values = [
    {
      icon: Heart,
      title: t('about.values.passion.title'),
      description: t('about.values.passion.description')
    },
    {
      icon: Users,
      title: t('about.values.community.title'), 
      description: t('about.values.community.description')
    },
    {
      icon: Calendar,
      title: t('about.values.convenience.title'),
      description: t('about.values.convenience.description')
    },
    {
      icon: Gift,
      title: t('about.values.benefits.title'),
      description: t('about.values.benefits.description')
    }
  ];

  const stats = [
    { number: '50+', label: t('about.stats.partnerBarracas') },
    { number: '5K+', label: t('about.stats.activeMembers') },
    { number: '24/7', label: t('about.stats.statusUpdates') },
    { number: '12', label: t('about.stats.neighborhoods') }
  ];

  const team = [
    {
      name: t('about.team.vincent.name'),
      role: t('about.team.vincent.role'),
      bio: t('about.team.vincent.bio'),
      image: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/editsV1/about%20edits/IMG_0385.jpg',
      flag: '🇺🇸'
    },
    {
      name: t('about.team.hans.name'), 
      role: t('about.team.hans.role'),
      bio: t('about.team.hans.bio'),
      image: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/editsV1/PHOTO-2025-07-02-15-28-36-2.jpg',
      flag: '🇺🇸'
    },
    {
      name: t('about.team.janeese.name'),
      role: t('about.team.janeese.role'),
      bio: t('about.team.janeese.bio'),
      image: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/editsV1/about%20edits/jan-headshot.JPG',
      flag: '🇺🇸'
    },
    {
      name: t('about.team.leticia.name'),
      role: t('about.team.leticia.role'),
      bio: t('about.team.leticia.bio'),
      image: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/editsV1/about%20edits/leticia-headshot.PNG',
      flag: '🇧🇷'
    },
    {
      name: t('about.team.simon.name'),
      role: t('about.team.simon.role'),
      bio: t('about.team.simon.bio'),
      image: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/editsV1/about%20edits/simon.jpg',
      flag: '🇨🇦'
    },
    {
      name: t('about.team.jordi.name'),
      role: t('about.team.jordi.role'),
      bio: t('about.team.jordi.bio'),
      image: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/D276EFFE-BA05-4E40-9B3F-4F647DCD9FE9-2.jpg',
      flag: '🇺🇾'
    },
    // {
    //   name: 'Brandon Hodge',
    //   role: 'Head of Sales',
    //   bio: 'Sales professional with a proven track record in building client relationships and driving business growth.',
    //   image: 'https://images.pexels.com/photos/1181319/pexels-photo-1181319.jpeg'
    // },
    // {
    //   name: 'Chris Finn',
    //   role: 'Quality Control Specialist',
    //   bio: 'Detail-oriented professional focused on maintaining high standards and ensuring exceptional service quality.',
    {
      name: t('about.team.ricardo.name'),
      role: t('about.team.ricardo.role'),
      bio: t('about.team.ricardo.bio'),
      image: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/editsV1/about%20edits/80-group-e-1.jpg',
      flag: '🇲🇽'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Head for About page */}
      <SEOHead
        title="About Us - Carioca Coastal Club"
        description="Meet the team behind Carioca Coastal Club. We're passionate about connecting beach lovers with Rio's best barracas and creating an amazing beach experience for everyone."
        image="/logo_320x320.png"
        type="website"
        url={window.location.href}
      />

      {/* Hero Section */}
      <section ref={heroAnimation.ref} className={`relative pt-20 pb-12 ${heroAnimation.animationClasses}`}>
        <div className="absolute inset-0 w-full h-full bg-[url('https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/editsV1/about%20edits/about-banner-sm.jpg?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 w-full h-full bg-black/60" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 drop-shadow-lg">
            {t('about.title')}
          </h1>
          <p className="text-lg md:text-xl text-white max-w-2xl md:max-w-3xl mx-auto leading-relaxed drop-shadow">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section ref={missionAnimation.ref} className={`py-16 bg-white ${missionAnimation.animationClasses}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {t('about.mission')}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            {t('about.missionDescription')}
          </p>
          <div className="bg-gradient-to-r from-beach-50 to-beach-100 rounded-2xl p-8 border border-beach-100">
            <p className="text-xl font-semibold text-gray-900 mb-4">
              "{t('about.missionQuote')}"
            </p>
            <p className="text-gray-600">
              {t('about.missionDetails')}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsAnimation.ref} className={`py-16 bg-gradient-to-r from-beach-500 to-beach-600 ${statsAnimation.animationClasses}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className={`stagger-${index + 1}`}>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-beach-100 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section ref={valuesAnimation.ref} className={`py-16 bg-gray-50 ${valuesAnimation.animationClasses}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('about.whatWeStandFor')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('about.valuesDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 stagger-${index + 1}`}>
                  <div className="bg-gradient-to-r from-beach-500 to-beach-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section ref={teamAnimation.ref} className={`py-16 bg-white ${teamAnimation.animationClasses}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('about.meetTeam')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('about.teamDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className={`text-center stagger-${index + 1}`}>
                <div className="mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1 flex items-center justify-center gap-2">
                  <span>{member.name}</span>
                  <span className="text-lg">{member.flag}</span>
                </h3>
                <p className="text-beach-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email Subscription */}
      <EmailSubscriptionSection
        title={t('about.joinCommunity')}
        description={t('about.joinCommunityDescription')}
        animationRef={contactAnimation.ref}
        animationClasses={contactAnimation.animationClasses}
      />
    </div>
  );
};

export default About;