import { useState } from 'react';

function SearchFunction() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // 示例数据
  const mockData = [
    { id: 1, username: '玩家A', matches: 15, wins: 10, score: 2500 },
    { id: 2, username: '玩家B', matches: 12, wins: 8, score: 2200 },
    { id: 3, username: '玩家C', matches: 20, wins: 15, score: 3000 },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    // 模拟搜索延迟
    setTimeout(() => {
      const result = mockData.find(
        (user) => user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(result || null);
      setIsSearching(false);
    }, 500);
  };

  return (
    <section id="search" className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          查询功能
        </h2>
        
        <div className="bg-gradient-to-br from-[#1E90FF] to-[#00CED1] rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="输入用户名或ID查询参与记录..."
                className="flex-1 px-6 py-4 rounded-xl border-0 focus:ring-4 focus:ring-[#FFD700] focus:outline-none text-gray-800 text-lg"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-8 py-4 bg-[#FFA500] hover:bg-[#FF8C00] text-white rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? '查询中...' : '查询'}
              </button>
            </div>
          </form>

          {searchResults && (
            <div className="bg-white rounded-xl p-6 shadow-lg animate-fadeIn">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">查询结果</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm mb-1">用户名</p>
                  <p className="text-xl font-bold text-gray-800">{searchResults.username}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm mb-1">参与比赛</p>
                  <p className="text-xl font-bold text-[#1E90FF]">{searchResults.matches} 场</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm mb-1">获胜次数</p>
                  <p className="text-xl font-bold text-[#FFA500]">{searchResults.wins} 次</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-600 text-sm mb-1">总积分</p>
                <p className="text-3xl font-bold text-[#00CED1]">{searchResults.score.toLocaleString()}</p>
              </div>
            </div>
          )}

          {searchResults === null && !isSearching && searchQuery && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <p className="text-gray-600 text-center">别搜了，这个功能还没写完QAQ</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default SearchFunction;
