import { EyeOff, FileEdit, CreditCard, History, TrendingUp, MapPin, HelpCircle } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* Left Side: Graphic */}
      <div className="hidden md:block md:w-1/2 relative bg-[#f8f9fa]">
        <img 
          src="/images/login1.png" 
          alt="BDO Login Graphic" 
          className="w-full h-full object-cover absolute inset-0"
        />
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12">
        
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <a href="/">
              <img src="/images/login2.png" alt="BDO Online" className="h-10" />
            </a>
          </div>

          {/* Welcome Text */}
          <h2 className="text-[22px] font-bold text-[#333] mb-8 text-center">
            Welcome to BDO Online!
          </h2>

          {/* Form Fields */}
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="block text-[13px] text-[#333]">Username</label>
              <input 
                type="text" 
                className="w-full border border-blue-200 rounded-md px-4 py-2.5 outline-none focus:border-[#0070d2] focus:ring-1 focus:ring-[#0070d2] transition-all"
              />
            </div>
            
            <div className="space-y-2 relative">
              <label className="block text-[13px] text-[#333]">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  className="w-full border border-blue-200 rounded-md px-4 py-2.5 outline-none focus:border-[#0070d2] focus:ring-1 focus:ring-[#0070d2] transition-all pr-10"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="bg-[#0070d2] hover:bg-[#0054a6] text-white font-bold py-2.5 px-6 rounded-md text-[14px] transition-colors mt-2"
            >
              Log in
            </button>
          </form>

          <hr className="my-8 border-gray-200" />

          {/* Helper Links */}
          <div className="space-y-6 text-[13px] text-[#333]">
            <p>
              Don't have Online Banking yet? <a href="#" className="text-[#0070d2] font-bold hover:underline">Sign up</a>
            </p>

            <div>
              <p className="mb-2">Need help logging in?</p>
              <a href="#" className="block text-[#0070d2] hover:underline mb-1">I'd like to get my username</a>
              <a href="#" className="block text-[#0070d2] hover:underline">I'd like to reset my password</a>
            </div>

            <p>
              Need more information? Go <a href="#" className="text-[#0070d2] font-bold hover:underline">here</a>
            </p>
          </div>

          <hr className="my-8 border-gray-200" />

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-4 gap-y-6 gap-x-2">
             <a href="#" className="flex flex-col items-center text-center group">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0070d2] mb-2 group-hover:bg-[#0070d2] group-hover:text-white transition-colors">
                   <FileEdit className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-[#0070d2] leading-tight">Apply Now</span>
             </a>
             <a href="#" className="flex flex-col items-center text-center group">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0070d2] mb-2 group-hover:bg-[#0070d2] group-hover:text-white transition-colors">
                   <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-[#0070d2] leading-tight">Activate Credit<br/>Card</span>
             </a>
             <a href="#" className="flex flex-col items-center text-center group">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0070d2] mb-2 group-hover:bg-[#0070d2] group-hover:text-white transition-colors">
                   <History className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-[#0070d2] leading-tight">Remit Status<br/>Inquiry</span>
             </a>
             <a href="#" className="flex flex-col items-center text-center group">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0070d2] mb-2 group-hover:bg-[#0070d2] group-hover:text-white transition-colors">
                   <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-[#0070d2] leading-tight">My Trust<br/>Investments</span>
             </a>
             <a href="#" className="flex flex-col items-center text-center group">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0070d2] mb-2 group-hover:bg-[#0070d2] group-hover:text-white transition-colors">
                   <MapPin className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-[#0070d2] leading-tight">Branch<br/>Appointment</span>
             </a>
             <a href="#" className="flex flex-col items-center text-center group">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0070d2] mb-2 group-hover:bg-[#0070d2] group-hover:text-white transition-colors">
                   <HelpCircle className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-[#0070d2] leading-tight">FAQs</span>
             </a>
          </div>

        </div>
      </div>
    </div>
  );
}
