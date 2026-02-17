function PastMatches({ pastMatches }) {
  const groupedMatches = pastMatches.reduce((acc, match) => {
    const quarter = match.quarter;
    if (!acc[quarter]) {
      acc[quarter] = [];
    }
    acc[quarter].push(match);
    return acc;
  }, {});

  return (
    <section id="past-matches" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          往期比赛
        </h2>
        
        <div className="space-y-8">
          {Object.entries(groupedMatches)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([quarter, matches]) => (
            <div key={quarter}>
              <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                <span className="w-2 h-2 bg-[#1E90FF] rounded-full mr-2"></span>
                {quarter}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...matches].sort((a, b) => new Date(b.date) - new Date(a.date)).map((match) => (
                  <div
                    key={match.id}
                    className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-gray-800">{match.title}</h4>
                      <span className="px-2 py-1 bg-[#7FFFD4] text-gray-700 rounded-full text-xs font-medium">
                        已结束
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{match.date}</p>
                    <p className="text-gray-700 mb-4 line-clamp-2">{match.description}</p>
                    {match.resultLink && (
                      <a
                        href={match.resultLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1E90FF] hover:text-[#1873CC] font-medium text-sm inline-flex items-center transition-colors"
                      >
                        查看结果
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PastMatches;
