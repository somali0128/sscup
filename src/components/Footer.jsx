function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo 和介绍 */}
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="/sscup.png" 
                alt="S&S Cup Logo" 
                className="h-10 w-auto mr-2"
              />
              <span className="text-xl font-bold">臭鱼烂虾杯</span>
            </div>
            <p className="text-gray-400 text-sm">
              相信自己，创造奇迹
            </p>
          </div>

          {/* 社群链接 */}
          <div>
            <h3 className="text-lg font-bold mb-4">社群链接</h3>
            <div className="space-y-2">
              <a
                href="#"
                className="flex items-center text-gray-400 hover:text-[#FFA500] transition-colors"
              >
                Oopz
              </a>
              <a
                href="#"
                className="flex items-center text-gray-400 hover:text-[#FFD700] transition-colors"
              >
                QQ群: 994272699
              </a>
            </div>
          </div>

          {/* 联系方式 */}
          <div>
            <h3 className="text-lg font-bold mb-4">联系方式</h3>
            <div className="space-y-2">
              <a
                href="mailto:contact@sscup.com"
                className="flex items-center text-gray-400 hover:text-[#00CED1] transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                2215440306@qq.com
              </a>
            </div>
            <div className="mt-6">
              <img 
                src="/sscup.png" 
                alt="S&S Cup Mascot" 
                className="h-16 w-auto opacity-50"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>&copy; 2025 S&S Cup. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
