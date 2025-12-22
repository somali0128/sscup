import { useState, useEffect } from 'react';

function RecentMatches({ matches, news }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (matches.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % matches.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [matches.length]);

  const currentMatch = matches[currentIndex];

  return (
    <section id="recent-matches" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          近期比赛
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* 近期比赛卡片 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-[#1E90FF] rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{currentMatch.title}</h3>
                <p className="text-gray-600">{currentMatch.date}</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">{currentMatch.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-[#FFA500] text-white rounded-full text-sm font-medium">
                {currentMatch.status}
              </span>
              <button className="px-6 py-2 bg-[#1E90FF] text-white rounded-lg font-medium hover:bg-[#1873CC] transition-colors duration-200 transform hover:scale-105">
                立即报名
              </button>
            </div>

            {/* 轮播指示器 */}
            {matches.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {matches.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex ? 'bg-[#1E90FF] w-6' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 最新新闻卡片 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-[#00CED1] rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">最新新闻</h3>
            </div>
            
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {news && news.map((item) => (
                <div key={item.id} className="border-l-4 border-[#00CED1] pl-4 py-2 hover:bg-gray-50 rounded transition-colors">
                  <p className="text-sm text-gray-500 mb-1">{item.date}</p>
                  <p className="text-gray-800 font-medium">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RecentMatches;
