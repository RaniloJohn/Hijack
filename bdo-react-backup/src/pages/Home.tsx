/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, ChevronDown, User, SquarePen, Menu, X, ArrowLeft, Mic, ChevronRight, CreditCard, Landmark, Smartphone, Wallet, PiggyBank, HandCoins, ShieldCheck, TrendingUp, Building2, Phone, Mail, Facebook, Youtube, Linkedin, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

// BDO Colors
const COLORS = {
  blue: '#0054a6',
  yellow: '#ffd200',
  lightBlue: '#0070d2',
  grayBg: '#f8f9fa',
  textHeader: '#333333',
  textMuted: '#666666',
};

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [activeMainTab, setActiveMainTab] = useState('Personal');
  const [hoveredMainTab, setHoveredMainTab] = useState<string | null>(null);

  const secondaryNavItems = [
    'Accounts', 'Digital', 'Cards', 'Deals', 'Loans', 'Insurance', 'Investments', 'Remittance', 'Assets for Sale'
  ];

  const accountSubItems = [
    'Savings Accounts',
    'Checking Accounts',
    'Time Deposit Accounts',
    'FOREX Services'
  ];

  const topNavItems = [
    { 
      label: 'About BDO', 
      hasDropdown: true,
      subItems: ['Company Profile', 'Corporate Governance', 'Investor Relations', 'Sustainability', 'BDO Foundation', 'Careers']
    },
    { 
      label: 'Subsidiaries', 
      hasDropdown: true,
      subItems: ['BDO Network Bank', 'BDO Life', 'BDO Leasing', 'BDO Finance']
    },
    { 
      label: 'Branches', 
      hasDropdown: true,
      subItems: ['Branch Locator', 'Saturdays / Sunday Banking', 'Branch Advisory']
    },
  ];

  const [activeTopDropdown, setActiveTopDropdown] = useState<string | null>(null);

  const heroContent: Record<string, { title: string, desc: string, badge: string }> = {
    'Personal': {
      badge: 'Personal',
      title: 'Experience digital\ninnovations in the\nbranch',
      desc: 'All your banking needs, all done in one visit. Let Alden show you how BDO finds ways to make banking easy, simple and secure.'
    },
    'Business': {
      badge: 'Business',
      title: 'Grow your business with BDO Solutions',
      desc: 'Access flexible financing and cash management tools designed to help your enterprise thrive.'
    },
    'Wealth': {
      badge: 'Wealth',
      title: 'Preserve and grow your legacy',
      desc: 'Expert wealth management and investment strategies tailored to your unique financial goals.'
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#333] overflow-x-hidden">
      {/* Sticky Header Group */}
      <div className="sticky top-0 z-50">
        {/* Top Header (White) */}
        <nav className="bg-white border-b border-gray-100 hidden md:block relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end h-10 items-center space-x-6 text-[13px] text-[#666]">
              {topNavItems.map((item) => (
                <div 
                  key={item.label} 
                  className="relative h-full flex items-center group cursor-pointer"
                  onMouseEnter={() => setActiveTopDropdown(item.label)}
                  onMouseLeave={() => setActiveTopDropdown(null)}
                >
                  <a href="#" className="flex items-center hover:text-[#0054a6] transition-colors font-medium h-full px-2">
                    {item.label} 
                    {item.hasDropdown && <ChevronDown className="ml-1 w-3 h-3 text-[#0054a6]" />}
                  </a>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {activeTopDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full right-0 w-56 bg-white border border-gray-100 shadow-xl py-2 z-[60] rounded-b-md"
                      >
                        {item.subItems.map((sub) => (
                          <a 
                            key={sub} 
                            href="#" 
                            className="block px-6 py-2.5 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-[#0054a6] transition-colors"
                          >
                            {sub}
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Header (Blue) */}
        <header className="bg-[#0054a6] text-white shadow-sm h-[72px] flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex justify-between items-center">
              {/* Logo & Main Nav */}
              <div className="flex items-center space-x-8 lg:space-x-12">
                <div className="flex items-center cursor-pointer group">
                  <div className="relative flex items-center">
                    <img src="/images/headerlogo.png" alt="BDO 50 Years" className="h-[40px] w-auto object-contain transform scale-[2.5] lg:scale-[3.5] origin-left drop-shadow-sm" />
                  </div>
                </div>
                
                <nav className="hidden md:flex items-center space-x-6 lg:space-x-10 text-[15px] font-bold tracking-wide h-full min-h-[72px]">
                  {['Personal', 'Business', 'Wealth'].map((tab) => (
                    <div 
                      key={tab}
                      className="relative h-full flex items-center cursor-pointer group"
                      onClick={() => setActiveMainTab(tab)}
                      onMouseEnter={() => setHoveredMainTab(tab)}
                      onMouseLeave={() => setHoveredMainTab(null)}
                    >
                      <span className={`transition-colors ${activeMainTab === tab || hoveredMainTab === tab ? 'text-[#ffd200]' : 'text-white'}`}>
                        {tab}
                      </span>
                      {(activeMainTab === tab) && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ffd200]"></div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 lg:space-x-6">
                <button className="hidden sm:flex items-center space-x-2 text-[14px] font-medium group cursor-pointer hover:opacity-80 transition-all">
                  <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20">
                    <Search className="w-5 h-5" />
                  </div>
                  <span className="hidden lg:inline">Search</span>
                </button>
                <button className="hidden sm:flex items-center space-x-2 text-[14px] font-medium group cursor-pointer hover:opacity-80 transition-all">
                  <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20">
                    <SquarePen className="w-5 h-5" />
                  </div>
                  <span className="hidden lg:inline">Apply</span>
                </button>
                <div className="relative group">
                  <a href="/login" className="flex items-center space-x-2 hover:opacity-80 rounded-lg ml-4 px-2 py-2 transition-all text-[14px] font-medium cursor-pointer">
                    <Lock className="w-4 h-4" />
                    <span>Login</span>
                    <ChevronDown className="w-4 h-4 opacity-70" />
                  </a>
                </div>
                
                {/* Mobile menu button */}
                <button 
                  className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Secondary Nav (White) */}
        <nav 
          className="bg-white border-b border-gray-100 hidden md:block shadow-sm"
          onMouseLeave={() => setHoveredNav(null)}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 relative">
            <div className="flex space-x-6 lg:space-x-10 h-full items-center text-[14px] text-[#0054a6] font-bold">
              {secondaryNavItems.map((item) => (
                <div 
                  key={item}
                  className="h-full flex items-center relative group cursor-pointer"
                  onMouseEnter={() => setHoveredNav(item)}
                >
                  <span className={`transition-colors whitespace-nowrap ${hoveredNav === item ? 'text-[#0054a6]' : 'text-[#0054a6]/90 hover:text-[#0054a6]'}`}>
                    {item}
                  </span>
                  {(hoveredNav === item) && (
                    <div className="absolute bottom-0 left-[-8px] right-[-8px] h-1.5 bg-[#ffd200]"></div>
                  )}
                </div>
              ))}
            </div>


            {/* Mega Menu Overlay - Positioned relative to the viewport but anchored to this nav */}
            <AnimatePresence>
              {hoveredNav === 'Accounts' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="fixed left-0 right-0 top-[122px] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.15)] border-t border-gray-100 overflow-hidden z-50 pointer-events-auto"
                  style={{ minHeight: '400px' }}
                >
                  <div className="max-w-7xl mx-auto flex h-full min-h-[400px]">
                    {/* Gray Sidebar */}
                    <div className="w-[320px] bg-[#f8f9fa] border-r border-gray-100 flex flex-col pt-4">
                      {accountSubItems.map((item, i) => (
                        <div 
                          key={item} 
                          className={`px-10 py-6 flex justify-between items-center cursor-pointer transition-all duration-300 ${i === 0 ? 'bg-white font-bold text-[#333] shadow-sm z-10' : 'hover:bg-white/60 text-gray-500 hover:text-[#333]'}`}
                        >
                          <span className="text-[15px]">{item}</span>
                          <ChevronRight className={`w-4 h-4 transition-colors ${i === 0 ? 'text-[#ffd200]' : 'text-gray-300'}`} />
                        </div>
                      ))}
                    </div>
                    
                    {/* Content Area */}
                    <div className="flex-1 p-16 bg-white flex items-center">
                      <div className="max-w-lg">
                        <p className="text-[13px] font-bold text-[#0054a6] uppercase tracking-wider mb-4">BDO Accounts</p>
                        <h2 className="text-[40px] font-bold text-[#333] mb-6 leading-tight">Savings Accounts</h2>
                        <p className="text-gray-500 text-[17px] leading-relaxed mb-10">
                          The easiest way to start your journey towards your financial goals. 
                          Choose from our wide range of savings products designed to grow your wealth with security and convenience.
                        </p>
                        <button className="bg-[#0070d2] text-white px-10 py-4 rounded-lg font-bold text-[16px] hover:bg-[#0054a6] transition-all flex items-center group shadow-md">
                          View Savings Accounts
                          <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                      <div className="ml-auto opacity-5 select-none pointer-events-none">
                         <Landmark size={240} className="text-[#0054a6]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-[#0054a6] z-[100] flex flex-col p-8 md:hidden"
          >
            <div className="flex justify-between items-center mb-12">
               <div className="flex items-center">
                  <span className="text-white font-black text-2xl tracking-tighter mr-1">BDO</span>
                  <div className="relative flex items-center justify-center w-8 h-8 border-2 border-[#ffd200] rounded-full ml-1 scale-75">
                    <span className="text-[#ffd200] text-[12px] font-black leading-none">50</span>
                    <span className="absolute -bottom-1 text-[6px] text-[#ffd200] font-bold uppercase tracking-tighter bg-[#0054a6] px-0.5">Years</span>
                  </div>
               </div>
               <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white hover:bg-white/10 rounded-full">
                  <X size={32} />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-8">
               <div className="space-y-4">
                  {['Personal', 'Business', 'Wealth'].map(item => (
                    <a key={item} href="#" className="block text-2xl font-bold text-white hover:text-[#ffd200] transition-colors">{item}</a>
                  ))}
               </div>
               <div className="h-px bg-white/20 w-full"></div>
               <div className="space-y-4">
                  {secondaryNavItems.map(item => (
                    <a key={item} href="#" className="block text-lg font-medium text-white/80 hover:text-white transition-colors">{item}</a>
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Hero Section */}
      <main className="relative bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <motion.div
              key={activeMainTab}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="z-10"
            >
              <div className="mb-6">
                <span className="text-[14px] font-medium text-[#333] mb-4 block">{heroContent[activeMainTab].badge}</span>
                <h1 className="text-4xl md:text-5xl lg:text-[54px] font-[300] text-[#333] leading-[1.1] max-w-lg mb-6 whitespace-pre-line">
                  {heroContent[activeMainTab].title}
                </h1>
                <p className="text-[#666] text-[14px] max-w-sm mb-8 leading-relaxed">
                  {heroContent[activeMainTab].desc}
                </p>
                
                <div className="flex items-center space-x-4">
                  <button className="bg-[#0070d2] text-white px-8 py-3 rounded-md font-bold text-[15px] hover:bg-[#0054a6] transition-all shadow-md">
                    Watch Now
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Hero Image / Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center lg:justify-end h-[500px] items-center"
            >
              <div className="relative w-full max-w-[600px] h-full flex items-center justify-center">
                <img 
                  src="/images/section1.png" 
                  alt="Experience digital innovations"
                  className="w-full h-auto object-contain z-10 relative drop-shadow-xl"
                />
                
                {/* Arrow Button */}
                <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-8 h-8 bg-[#eef7fc] rounded-md flex items-center justify-center cursor-pointer shadow-sm text-[#00a3e0] z-20">
                   <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-12 space-x-2">
            {[1, 2, 3, 4, 5, 6, 7].map((dot, i) => (
              <div 
                key={dot} 
                className={`h-1.5 transition-all duration-300 rounded-full ${i === 6 ? 'w-8 bg-[#ffd200]' : 'w-2 bg-gray-300'}`}
              />
            ))}
          </div>
        </div>

        {/* Floating Search Bar */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 flex justify-center px-4">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl py-4 sm:py-6 px-4 sm:px-10 flex items-center border border-gray-100">
            <Search className="w-5 h-5 text-gray-400 mr-4" />
            <input 
              type="text" 
              placeholder="What do you need today?" 
              className="flex-1 text-[16px] sm:text-[18px] text-[#333] outline-none placeholder:text-gray-400 font-medium"
            />
            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors ml-4">
              <Mic className="w-5 h-5 text-[#0054a6]" />
            </button>
          </div>
        </div>
      </main>

      {/* Spacer for floating search bar */}
      <div className="h-32"></div>

      {/* Let's get you started */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-[32px] font-bold text-[#333] mb-12">Let’s get you started</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <SquarePen className="w-6 h-6 text-[#0070d2]" />, title: 'Products', desc: 'Browse and apply for the BDO product best suited for your needs.' },
            { icon: <TrendingUp className="w-6 h-6 text-[#0070d2]" />, title: 'Deals', desc: 'Check out exclusive deals, rebates, and more with your BDO Cards.' },
            { icon: <CreditCard className="w-6 h-6 text-[#0070d2]" />, title: 'Cards', desc: 'Get the best deals and features that cater to your needs.' },
            { icon: <Smartphone className="w-6 h-6 text-[#0070d2]" />, title: 'Digital Banking', desc: 'Bank online anytime, anywhere with your smartphone or laptop.' },
            { icon: <PiggyBank className="w-6 h-6 text-[#0070d2]" />, title: 'Savings', desc: 'Choose from a wide range of deposit products that best fit your goals.' },
            { icon: <HandCoins className="w-6 h-6 text-[#0070d2]" />, title: 'Loans', desc: 'Get your dream car or home with low interest rates.' },
            { icon: <ShieldCheck className="w-6 h-6 text-[#0070d2]" />, title: 'Insurance', desc: 'Protect your family\'s future and secure your success.' },
            { icon: <Building2 className="w-6 h-6 text-[#0070d2]" />, title: 'Properties', desc: 'Purchase the properties of your dreams.' },
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-start cursor-pointer transition-shadow hover:shadow-md h-full"
            >
              <div className="p-3 bg-blue-50 rounded-lg mb-6">
                {item.icon}
              </div>
              <h3 className="text-[18px] font-bold text-[#333] mb-3">{item.title}</h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why partner with BDO (Wide Banner) */}
      <section className="bg-[#eef7fc] pb-24 relative">
        {/* Full width image banner */}
        <div className="w-full h-[500px] relative overflow-hidden">
          <img 
            src="/images/section3.png" 
            alt="Colleagues working" 
            className="w-full h-full object-cover object-center" 
          />
          {/* Card Overlaid on the banner */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
               <div className="bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl max-w-[480px]">
                  <h2 className="text-[28px] font-bold text-[#333] mb-4">We find ways for you</h2>
                  <p className="text-gray-600 leading-relaxed text-[14px]">
                    At BDO, we are inspired to provide each and every customer with the best banking experience. 
                    We are focused on delivering excellence and providing access and convenience across all our products and services.
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Text and Icons below the banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-bold text-[#333]">Why partner with BDO</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
             {[
               { title: 'Full-Service Universal Bank', desc: 'Complete array of industry-leading products and services for your personal finance needs.', img: '/images/section4.png' },
               { title: 'Extensive Distribution Network', desc: 'Over 1,800 branches and 6,000 ATMs nationwide, plus 16 international offices to serve you.', img: '/images/section4(2).png' },
               { title: 'Professional, Customer-Focused', desc: 'Highly experienced and trained workforce committed to quality service.', img: '/images/section4(3).png' },
             ].map((item, i) => (
               <div key={i} className="flex flex-col items-center">
                 <div className="w-32 h-32 mb-6 flex items-center justify-center overflow-hidden">
                    <img src={item.img} alt={item.title} className="w-full h-full object-contain" />
                 </div>
                 <h4 className="text-[18px] font-bold text-[#333] mb-4">{item.title}</h4>
                 <p className="text-gray-500 text-[14px] leading-relaxed max-w-xs">{item.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Stay Updated */}
      <section className="bg-[#0070d2] py-24 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-[36px] font-bold">Stay Updated</h2>
            <div className="flex space-x-2">
               <button className="p-2 border border-white/20 rounded-full hover:bg-white/10 transition-colors">
                  <ChevronRight className="w-6 h-6 rotate-180" />
               </button>
               <button className="p-2 bg-white text-[#0070d2] rounded-full shadow-lg hover:scale-110 transition-transform">
                  <ChevronRight className="w-6 h-6" />
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
             {[
               { img: '/images/section5.png', title: 'System downtime advisory | May 11, 2026', desc: 'We\'re working on restoring BDO Pay App, BDO Online App and BDO Online Website services as soon as possible. You may continue using BDO ATMs or go to your preferred BDO branch for your banking needs.' },
               { img: '/images/section5(2).png', title: 'The 10-piso ASEAN Coin', desc: 'The Bangko Sentral ng Pilipinas (BSP) issued the 10-piso ASEAN Commemorative Coin nationwide in January 2026 to celebrate the Philippines\' role as ASEAN Chair in 2026.' },
               { img: '/images/section5(3).png', title: 'Update on Debit Card Terms and Conditions', desc: 'Effective July 1, 2026, there will be changes on the BDO Debit Card Terms and Conditions.' }
             ].map((news, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md group flex flex-col p-6 relative h-full">
                   <div className="w-full h-32 mb-6 flex items-center justify-center overflow-hidden">
                      <img src={news.img} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                   </div>
                   <div className="flex-1 flex flex-col text-left">
                      <h4 className="text-[#333] font-bold text-[16px] mb-4 leading-snug">{news.title}</h4>
                      <p className="text-gray-500 text-[13px] leading-relaxed mb-6 flex-1">{news.desc}</p>
                      <button className="self-start bg-[#0070d2] text-white font-bold text-[13px] px-6 py-2 rounded-md hover:bg-[#0054a6] transition-colors mt-auto">
                         Learn More
                      </button>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Products and services */}
      <section className="py-24 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-[28px] font-bold text-[#333] mb-8">Products and services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white rounded-xl p-8 flex items-center justify-between border border-blue-100/60 shadow-sm group cursor-pointer hover:shadow-md transition-all">
                <div className="flex-1 pr-6">
                   <h3 className="text-[20px] font-bold text-[#333] mb-3">Enjoy Deals and Rewards</h3>
                   <p className="text-gray-500 text-[13px] mb-6 leading-relaxed max-w-sm">Enter a whole world of perks and privileges with BDO Rewards.</p>
                   <button className="bg-[#0070d2] text-white px-6 py-2.5 rounded-md font-bold text-[14px] hover:bg-[#0054a6] transition-colors">
                      Learn More
                   </button>
                </div>
                <div className="w-[140px] h-[140px] flex-shrink-0 flex items-center justify-center">
                   <img src="/images/section6.png" alt="Enjoy Deals and Rewards" className="w-full h-full object-contain" />
                </div>
             </div>
             <div className="bg-white rounded-xl p-8 flex items-center justify-between border border-blue-100/60 shadow-sm group cursor-pointer hover:shadow-md transition-all">
                <div className="flex-1 pr-6">
                   <h3 className="text-[20px] font-bold text-[#333] mb-3">Trade Stocks Online</h3>
                   <p className="text-gray-500 text-[13px] mb-6 leading-relaxed max-w-sm">Quick onboarding, real-time funding, and access to stock tips.</p>
                   <button className="bg-[#0070d2] text-white px-6 py-2.5 rounded-md font-bold text-[14px] hover:bg-[#0054a6] transition-colors">
                      Learn More
                   </button>
                </div>
                <div className="w-[140px] h-[140px] flex-shrink-0 flex items-center justify-center">
                   <img src="/images/section6(2).png" alt="Trade Stocks Online" className="w-full h-full object-contain" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Loan Online Tools */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <h2 className="text-[28px] font-bold text-[#333] mb-8">Loan Online Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-8 text-left hover:shadow-md transition-shadow">
                <div className="flex-1 pr-4">
                   <h3 className="text-[18px] font-bold text-[#333] mb-3">Compute for Loan Package</h3>
                   <p className="text-gray-500 text-[13px] mb-6 leading-relaxed">Discover low interest rates and easy payment terms for your Home, Auto, and Multipurpose financing needs.</p>
                   <button className="bg-[#0070d2] text-white px-6 py-2.5 rounded-md font-bold text-[14px]">
                      Calculate Now
                   </button>
                </div>
                <div className="w-[140px] h-[140px] flex-shrink-0 flex items-center justify-center">
                   <img src="/images/section7.png" alt="Compute for Loan Package" className="w-full h-full object-contain" />
                </div>
             </div>
             <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-8 text-left hover:shadow-md transition-shadow">
                <div className="flex-1 pr-4">
                   <h3 className="text-[18px] font-bold text-[#333] mb-3">Get Pre-Qualified for a Loan</h3>
                   <p className="text-gray-500 text-[13px] mb-6 leading-relaxed">Get an estimate of how much you can borrow for your Home or Auto Loan.</p>
                   <button className="bg-[#0070d2] text-white px-6 py-2.5 rounded-md font-bold text-[14px]">
                      Get Pre-Qualified
                   </button>
                </div>
                <div className="w-[140px] h-[140px] flex-shrink-0 flex items-center justify-center">
                   <img src="/images/section7(2).png" alt="Get Pre-Qualified for a Loan" className="w-full h-full object-contain" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Stay on top of your finances */}
      <section className="bg-[#0070d2] py-24 text-white overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
               <div>
                  <div className="flex items-center space-x-4 mb-8">
                     <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                        <img src="https://placehold.co/100x100/0070d2/white?text=BDO" alt="BDO icon" className="w-10 h-10" />
                     </div>
                     <h2 className="text-[36px] font-bold leading-tight">Stay on top of your finances</h2>
                  </div>
                  <div className="space-y-6 mb-12">
                     <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                           <ShieldCheck className="w-5 h-5 text-[#ffd200]" />
                        </div>
                        <span className="text-[18px] font-medium">View and manage all your accounts</span>
                     </div>
                     <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                           <Smartphone className="w-5 h-5 text-[#ffd200]" />
                        </div>
                        <span className="text-[18px] font-medium">Schedule your transactions</span>
                     </div>
                     <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                           <CreditCard className="w-5 h-5 text-[#ffd200]" />
                        </div>
                        <span className="text-[18px] font-medium">Secure your BDO cards</span>
                     </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                     <button className="bg-black text-white px-6 py-2 rounded-lg flex items-center space-x-3 hover:bg-gray-900 transition-colors border border-white/20">
                        <div className="text-left">
                           <div className="text-[10px] uppercase opacity-70">Download on the</div>
                           <div className="text-sm font-bold">App Store</div>
                        </div>
                     </button>
                     <button className="bg-black text-white px-6 py-2 rounded-lg flex items-center space-x-3 hover:bg-gray-900 transition-colors border border-white/20">
                        <div className="text-left">
                           <div className="text-[10px] uppercase opacity-70">Get it on</div>
                           <div className="text-sm font-bold">Google Play</div>
                        </div>
                     </button>
                  </div>
               </div>
               <div className="relative flex items-center justify-center lg:justify-end">
                   <img src="/images/section8.png" alt="Stay on top of your finances app mockups" className="w-full max-w-[500px] h-auto object-contain relative z-10 drop-shadow-2xl" />
               </div>
            </div>
         </div>
      </section>

      {/* Contact us */}
      <section className="py-24 bg-white border-b border-gray-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-[32px] font-bold text-[#333] mb-12">Contact us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
               <div className="flex space-x-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                     <Building2 className="w-6 h-6 text-[#0054a6]" />
                  </div>
                  <div>
                     <h4 className="font-bold text-[18px] text-[#333] mb-4">BDO Corporate Center:</h4>
                     <p className="text-gray-500 text-[14px] leading-relaxed">
                        7899 Makati Avenue Makati City 0726, <br />
                        Philippines Trunkline: <span className="text-[#0054a6] hover:underline cursor-pointer">(+632) 8840-7000</span>
                     </p>
                  </div>
               </div>
               <div className="flex space-x-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                     <Phone className="w-6 h-6 text-[#0054a6]" />
                  </div>
                  <div>
                     <h4 className="font-bold text-[18px] text-[#333] mb-4">BDO Contact Center:</h4>
                     <div className="text-[14px] text-gray-500 space-y-2">
                        <p>Hotline: <span className="text-[#0054a6] font-bold hover:underline cursor-pointer">(+632) 8888-0000</span></p>
                        <p>Outside Metro Manila <br /> (PLDT/Globelines): <span className="text-[#0054a6] font-bold hover:underline cursor-pointer">#8888-0000</span></p>
                        <p>(For landline only, press # followed by 8888-0000)</p>
                        <p className="pt-4 font-bold text-[#333]">International Toll-Free:</p>
                        <p className="text-[#0054a6] hover:underline cursor-pointer">(IAC)+800-8-CALLBDO (2255-236)</p>
                        <p className="text-[#0070d2] text-xs hover:underline cursor-pointer">(See list of IAC here)</p>
                     </div>
                  </div>
               </div>
               <div className="flex space-x-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                     <Mail className="w-6 h-6 text-[#0054a6]" />
                  </div>
                  <div>
                     <h4 className="font-bold text-[18px] text-[#333] mb-4">Email Us</h4>
                     <p className="text-[#0054a6] text-[14px] mb-4 hover:underline cursor-pointer">callcenter@bdo.com.ph</p>
                     <p className="text-gray-500 text-[14px] leading-relaxed mb-6">Send a message to this channel for account-related concerns.</p>
                     <p className="text-gray-500 text-[13px] leading-relaxed">
                        For scams, fraud, or lost/stolen cards, call the BDO Customer Contact Center at (02) 8888-0000. To report phishing attempts, email us at <span className="text-[#0054a6] hover:underline cursor-pointer">reportphish@bdo.com.ph</span>.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <footer className="bg-[#0070d2] text-white pt-16 pb-10 border-t-8 border-[#0054a6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="space-y-6">
                 <img src="/images/headerlogo.png" alt="BDO Logo" className="h-8 w-auto brightness-0 invert" />
                 <p className="text-white/80 text-[12px] leading-relaxed">
                    BDO Unibank is regulated by the Bangko Sentral ng Pilipinas. <br />
                    <a href="#" className="text-white font-bold hover:underline">https://www.bsp.gov.ph</a>
                 </p>
                 <p className="text-white/80 text-[12px] leading-relaxed">
                    For concerns, please reach us through any of the channels listed in the <br />
                    <a href="#" className="text-white font-bold hover:underline">Consumer Assistance page</a>
                 </p>
              </div>
              <div>
                 <h5 className="font-bold text-[14px] text-white mb-6">Ways to Bank</h5>
                 <ul className="text-white/80 text-[13px] space-y-4">
                    <li><a href="#" className="hover:text-white">Locate Branches</a></li>
                    <li><a href="#" className="hover:text-white">ATM</a></li>
                    <li><a href="#" className="hover:text-white">Call</a></li>
                    <li><a href="#" className="hover:text-white">Chat</a></li>
                    <li><a href="#" className="hover:text-white">BDO Apps</a></li>
                 </ul>
              </div>
              <div>
                 <h5 className="font-bold text-[14px] text-white mb-6">More about BDO</h5>
                 <ul className="text-white/80 text-[13px] space-y-4">
                    <li><a href="#" className="hover:text-white">Company Disclosure</a></li>
                    <li><a href="#" className="hover:text-white">News and Features</a></li>
                    <li><a href="#" className="hover:text-white">Careers</a></li>
                    <li><a href="#" className="hover:text-white">FAQs</a></li>
                 </ul>
              </div>
              <div>
                 <h5 className="font-bold text-[14px] text-white mb-6">Follow us</h5>
                 <div className="flex space-x-4">
                    <a href="#" className="w-8 h-8 rounded flex items-center justify-center text-white border border-white/30 hover:bg-white hover:text-[#0070d2] transition-all">
                       <Facebook className="w-4 h-4" />
                    </a>
                    <a href="#" className="w-8 h-8 rounded flex items-center justify-center text-white border border-white/30 hover:bg-white hover:text-[#0070d2] transition-all">
                       <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="#" className="w-8 h-8 rounded flex items-center justify-center text-white border border-white/30 hover:bg-white hover:text-[#0070d2] transition-all">
                       <Youtube className="w-4 h-4" />
                    </a>
                 </div>
              </div>
           </div>

           <div className="flex flex-wrap justify-center border-t border-white/20 pt-8 text-[12px] text-white/90 space-x-6 font-bold">
              <a href="#" className="hover:underline">Terms and Conditions</a>
              <a href="#" className="hover:underline">Privacy Statement</a>
              <a href="#" className="hover:underline">Site Map</a>
           </div>
           
          <div className="mt-4 text-center text-white/70 text-[10px]">
            <p>The BDO, BDO Unibank and other BDO-related trademarks are owned by BDO Unibank, Inc. © 2012. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

