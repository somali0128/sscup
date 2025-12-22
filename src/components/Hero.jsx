function Hero() {
  return (
    <section id="home" className="relative bg-gradient-to-br from-[#1E90FF] via-[#00CED1] to-[#7FFFD4] py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-8 animate-bounce-slow">
            <img 
              src="/sscup.png" 
              alt="S&S Cup Logo" 
              className="mx-auto h-32 md:h-48 w-auto drop-shadow-2xl"
            />
          </div>
          
          {/* Slogan */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            臭鱼烂虾杯
          </h1>
          <p className="text-xl md:text-3xl text-white/90 font-medium drop-shadow-md">
            相信自己，创造奇迹
          </p>

          {/* Decorative elements */}
          <div className="mt-12 flex justify-center space-x-4">
            <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-[#FFA500] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
