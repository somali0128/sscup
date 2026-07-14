import { useState, useEffect, useMemo } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const INITIAL_VISIBLE_COUNT = 10;

function Leaderboard({ players }) {
  const [displayedScores, setDisplayedScores] = useState({});
  const [showAll, setShowAll] = useState(false);

  // 按分数从高到低排序
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);
  const visiblePlayers = showAll
    ? sortedPlayers
    : sortedPlayers.slice(0, INITIAL_VISIBLE_COUNT);

  // 处理B站图片URL，如果referrerPolicy不够，可以使用代理
  const getImageUrl = (url) => {
    if (!url) return null;

    return url;
  };

  useEffect(() => {
    sortedPlayers.forEach((player) => {
      animateScore(player.id, player.score);
    });
  }, [sortedPlayers]);

  const animateScore = (id, targetScore) => {
    const duration = 2000;
    const steps = 60;
    const increment = targetScore / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayedScores((prev) => ({ ...prev, [id]: targetScore }));
        clearInterval(timer);
      } else {
        setDisplayedScores((prev) => ({ ...prev, [id]: Math.floor(current) }));
      }
    }, duration / steps);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = () => {
    return 'bg-white';
  };

  const getTextColor = () => {
    return 'text-gray-800';
  };

  const getSecondaryTextColor = () => {
    return 'text-gray-600';
  };

  const getBorderColor = (rank) => {
    if (rank === 1) return 'border-[#FFD700]'; // 金色
    if (rank === 2) return 'border-[#C0C0C0]'; // 银色
    if (rank === 3) return 'border-[#CD7F32]'; // 铜色
    return 'border-gray-200';
  };

  const getDividerColor = () => {
    return 'border-gray-200';
  };

  const getHonorTagStyle = (rarity) => {
    // 稀有度颜色映射
    const rarityColors = {
      orange: {
        bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
        text: 'text-white',
        shadow: 'shadow-orange-500/50'
      },
      purple: {
        bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
        text: 'text-white',
        shadow: 'shadow-purple-500/50'
      },
      blue: {
        bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
        text: 'text-white',
        shadow: 'shadow-blue-500/50'
      },
      green: {
        bg: 'bg-gradient-to-r from-green-500 to-green-600',
        text: 'text-white',
        shadow: 'shadow-green-500/50'
      }
    };

    // 如果没有指定稀有度，使用默认样式
    if (!rarity) {
      return 'px-2 py-1 bg-[#1E90FF] text-white text-xs font-medium rounded-full';
    }

    const color = rarityColors[rarity] || rarityColors.blue;
    
    // 所有排名统一使用完整颜色样式
    return `px-2 py-1 ${color.bg} ${color.text} text-xs font-medium rounded-full shadow-md ${color.shadow}`;
  };

  return (
    <section id="leaderboard" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            排行榜
          </h2>
          <Tippy
            content="活跃分数由参与活动与荣誉成就累计获得。参与活动获得基础积分，荣誉标签根据稀有度（绿/蓝/紫/橙）获得额外积分。"
            placement="top"
            arrow={true}
            theme="dark"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 text-sm text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors cursor-help">
              ?
            </span>
          </Tippy>
        </div>
        
        <div id="leaderboard-players" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePlayers.map((player, index) => {
            const rank = index + 1;
            const displayedScore = displayedScores[player.id] || 0;
            
            return (
              <div
                key={player.id}
                className={`${getRankColor()} border-8 ${getBorderColor(rank)} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mr-4 overflow-hidden bg-gray-200">
                      {player.avatar ? (
                        <img 
                          src={getImageUrl(player.avatar)} 
                          alt={player.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            // 如果图片加载失败，隐藏图片显示首字母
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            if (parent && !parent.querySelector('span')) {
                              const fallback = document.createElement('span');
                              fallback.className = `text-2xl ${getTextColor()}`;
                              fallback.textContent = player.name.charAt(0);
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      ) : (
                        <span className={`text-2xl ${getTextColor()}`}>{player.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${getTextColor()}`}>{player.name}</h3>
                      <p className={`text-sm ${getSecondaryTextColor()}`}>排名 {rank}</p>
                    </div>
                  </div>
                  <div className="text-3xl">{getRankIcon(rank)}</div>
                </div>
                
                <div className={`mt-4 pt-4 border-t ${getDividerColor()}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className={getSecondaryTextColor()}>活跃分数</span>
                    <span className="text-2xl font-bold text-[#1E90FF]">
                      {displayedScore.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* 荣誉标签 */}
                  {player.honorTags && player.honorTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {player.honorTags.map((tag, tagIndex) => {
                        // 兼容旧数据格式（字符串）和新格式（对象）
                        const tagName = typeof tag === 'string' ? tag : tag.name;
                        const tagDescription = typeof tag === 'string' ? '' : tag.description;
                        const tagRarity = typeof tag === 'object' ? tag.rarity : null;
                        
                        const tagContent = (
                          <span
                            className={`${getHonorTagStyle(tagRarity)} cursor-help`}
                          >
                            {tagName}
                          </span>
                        );
                        return (
                          <div key={tagIndex}>
                            {tagDescription ? (
                              <Tippy
                                content={tagDescription}
                                placement="top"
                                arrow={true}
                                theme="dark"
                              >
                                {tagContent}
                              </Tippy>
                            ) : (
                              tagContent
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* B站链接 */}
                  {player.bilibiliLink && (
                    <a
                      href={`https://space.bilibili.com/${player.bilibiliLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#FB7299] hover:bg-[#E85A7F] text-white rounded-lg text-sm font-medium transition-colors duration-200 transform hover:scale-105"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                      访问B站
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {sortedPlayers.length > INITIAL_VISIBLE_COUNT && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              aria-controls="leaderboard-players"
              aria-expanded={showAll}
              onClick={() => setShowAll((current) => !current)}
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#1E90FF]/20 bg-[#1E90FF]/10 px-7 py-3 font-bold text-[#1873CC] transition hover:-translate-y-0.5 hover:border-[#1E90FF]/35 hover:bg-[#1E90FF] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E90FF]"
            >
              {showAll ? '收起排行榜' : '展开更多'}
              <svg
                aria-hidden="true"
                className={`h-5 w-5 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Leaderboard;
