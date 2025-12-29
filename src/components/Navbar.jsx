import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isRegistrationPage = location.pathname === '/mahjong-cup-registration';

  const navItems = [
    { name: '首页', href: '#home' },
    { name: '近期比赛', href: '#recent-matches' },
    { name: '往期比赛', href: '#past-matches' },
    { name: '排行榜', href: '#leaderboard' },
    // { name: '查询功能', href: '#search' },
    { name: '关于', href: '#about' },
  ];

  // 处理导航点击，如果在报名页，需要跳转到首页并滚动
  const handleNavClick = (e, href) => {
    if (isRegistrationPage) {
      e.preventDefault();
      navigate(`/${href}`);
      // 等待页面跳转后滚动到对应section
      setTimeout(() => {
        const hash = href.slice(1); // 移除 # 号
        const element = document.getElementById(hash);
        if (element) {
          const navbarHeight = 64; // h-16 = 64px
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - navbarHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
    // 如果在首页，让默认行为处理（锚点跳转）
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <img 
              src="/sscup.png" 
              alt="S&S Cup Logo" 
              className="h-10 w-auto"
            />
            <span className="ml-2 text-xl font-bold text-[#1E90FF]">臭鱼烂虾杯</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={isRegistrationPage ? `/${item.href}` : item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-gray-700 hover:text-[#1E90FF] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#1E90FF] hover:bg-gray-100 focus:outline-none transition-colors"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={isRegistrationPage ? `/${item.href}` : item.href}
                onClick={(e) => {
                  handleNavClick(e, item.href);
                  setIsOpen(false);
                }}
                className="text-gray-700 hover:text-[#1E90FF] block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
