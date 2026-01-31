function RecentMatches({ matches, news }) {
  const getActionConfig = (status) => {
    switch (status) {
      case '筹备中':
        return { label: '暂未开启', active: false };
      case '征集中':
        return { label: '立刻报名', active: true };
      case '已完赛':
        return { label: '赛况回看', active: true };
      default:
        return { label: '暂未开启', active: false };
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case '已完赛':
        return 'bg-gray-200 text-gray-700';
      case '征集中':
        return 'bg-[#1E90FF] text-white';
      case '筹备中':
        return 'bg-[#FFA500] text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <section id="recent-matches" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          近期比赛
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* 近期比赛卡片 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-[#1E90FF] rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">近期比赛</h3>
            </div>

            <div className="space-y-4">
              {matches.map((match) => {
                const action = getActionConfig(match.status);
                return (
                  <div
                    key={match.id}
                    className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">{match.title}</h4>
                        <p className="text-sm text-gray-600">{match.date}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(match.status)}`}
                      >
                        {match.status}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4">{match.description}</p>

                    <div className="flex items-center justify-end">
                      {action.active ? (
                        <a
                          href="/mahjong-cup-registration"
                          className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 transform hover:scale-105 inline-block text-center ${
                            match.status === '已完赛'
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-[#1E90FF] text-white hover:bg-[#1873CC]'
                          }`}
                        >
                          {action.label}
                        </a>
                      ) : (
                        <button
                          disabled
                          className="px-6 py-2 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed opacity-60"
                        >
                          {action.label}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
