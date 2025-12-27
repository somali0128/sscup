import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function MahjongCupRegistration() {
  const [activeSection, setActiveSection] = useState('introduction');
  const location = useLocation();

  useEffect(() => {
    // 页面加载时滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    // 处理从外部跳转的锚点（只计算navbar高度）
    const hash = window.location.hash.slice(1);
    if (hash) {
      setActiveSection(hash);
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          // 从外部跳转时，只计算navbar高度，banner是页面的一部分应该可见
          const navbarHeight = 64; // h-16 = 64px
          const offset = navbarHeight;
          
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - offset,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [location.hash]);

  const handleNavClick = (section) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      const navbarHeight = 64; // h-16 = 64px
      const topNavHeight = 70; // 顶部导航链接高度
      const offset = navbarHeight + topNavHeight;
      
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
      window.history.pushState(null, '', `#${section}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Banner区域 */}
      <section className="relative w-full h-64 md:h-96 overflow-hidden">
        {/* Banner背景图片 */}
        <img 
          src="/header_schinese.jpg" 
          alt="雀魂游戏" 
          className="w-full h-full object-cover"
        />
        {/* 半透明遮罩层，确保文字可读性 */}
        <div className="absolute inset-0 bg-black/30"></div>
        {/* 文字内容 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              【雀魂】雀神杯
            </h1>
            <p className="text-xl md:text-2xl drop-shadow-md">
              事已至此，先打麻将吧！
            </p>
          </div>
        </div>
      </section>

      {/* 顶部导航链接 */}
      <nav className="sticky top-16 bg-white shadow-md z-40 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 py-4">
            <a
              href="/"
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#1E90FF] hover:bg-gray-50 transition-colors duration-200"
            >
              ← 返回首页
            </a>
            <div className="w-px bg-gray-300"></div>
            <button
              onClick={() => handleNavClick('introduction')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeSection === 'introduction'
                  ? 'text-[#1E90FF] bg-blue-50'
                  : 'text-gray-700 hover:text-[#1E90FF] hover:bg-gray-50'
              }`}
            >
              活动介绍
            </button>
            <button
              onClick={() => handleNavClick('rules')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeSection === 'rules'
                  ? 'text-[#1E90FF] bg-blue-50'
                  : 'text-gray-700 hover:text-[#1E90FF] hover:bg-gray-50'
              }`}
            >
              活动规则
            </button>
            <button
              onClick={() => handleNavClick('registration')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeSection === 'registration'
                  ? 'text-[#1E90FF] bg-blue-50'
                  : 'text-gray-700 hover:text-[#1E90FF] hover:bg-gray-50'
              }`}
            >
              报名方式
            </button>
            {/* <button
              onClick={() => handleNavClick('schedule')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeSection === 'schedule'
                  ? 'text-[#1E90FF] bg-blue-50'
                  : 'text-gray-700 hover:text-[#1E90FF] hover:bg-gray-50'
              }`}
            >
              赛程安排
            </button> */}
          </div>
        </div>
      </nav>

      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 活动介绍 */}
        <section id="introduction" className="mb-16 scroll-mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-2 h-8 bg-[#1E90FF] rounded-full mr-4"></div>
              活动介绍
            </h2>
            <div className="space-y-6">
              {/* 标题 */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  臭鱼烂虾杯 · 雀魂篇 报名开启
                </h3>
              </div>

              {/* 正文 */}
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p className="text-lg font-medium">
                  盐揪生集合——
                </p>
                <p className="text-lg">
                  你是否曾因为一张牌彻夜难眠？<br/>
                  你是否坚信"这把是我运气不佳"？<br/>
                  你是否想在众目睽睽之下，凑出清一色一条龙？
                </p>
                <p className="text-lg font-semibold text-[#1E90FF]">
                  臭鱼烂虾杯 · 雀魂篇 正式开启报名！
                </p>
              </div>

              {/* 比赛信息 */}
              <div className="bg-gradient-to-r from-[#1E90FF] to-[#00CED1] rounded-lg p-6 text-white">
                <h4 className="text-xl font-bold mb-4">比赛信息</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm opacity-90 mb-1">比赛时间</p>
                    <p className="text-lg font-bold">2026年1月30日 20:30 (预计持续3小时)</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-1">比赛项目</p>
                    <p className="text-lg font-bold">雀魂·万象修罗</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-1">人数上限</p>
                    <p className="text-lg font-bold">32 人</p>
                  </div>
                </div>
              </div>

              {/* 赛制速读 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">赛制速读</h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#1E90FF] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 mt-0.5">
                      ✓
                    </div>
                    <p className="text-gray-700">四人局</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#1E90FF] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 mt-0.5">
                      ✓
                    </div>
                    <p className="text-gray-700">每轮一场定胜负</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#1E90FF] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 mt-0.5">
                      ✓
                    </div>
                    <p className="text-gray-700">前两名晋级</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#1E90FF] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 mt-0.5">
                      ✓
                    </div>
                    <p className="text-gray-700">总决赛 打两场定冠军</p>
                  </div>
                </div>
              </div>

              {/* 报名须知 */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <h4 className="text-lg font-bold text-gray-800 mb-2">报名须知</h4>
                <p className="text-gray-700">
                  会打即可，心态爆炸请自备
                </p>
              </div>

              {/* 活动奖品 */}
              <div className="bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF6347] rounded-lg p-6 text-white">
                <h4 className="text-xl font-bold mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  活动奖品
                </h4>
                <div className="space-y-3">
                  <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <h5 className="text-lg font-bold">总冠军</h5>
                    </div>
                    <div className="ml-13 space-y-1">
                      <p className="text-sm opacity-90">• 指定舰长 × 1</p>
                      <p className="text-sm opacity-90">• 荣誉头衔</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 活动规则 */}
        <section id="rules" className="mb-16 scroll-mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-2 h-8 bg-[#1E90FF] rounded-full mr-4"></div>
              活动规则
            </h2>
            <div className="space-y-8">
              {/* 比赛总体结构 */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">比赛总体结构</h3>
                <p className="text-gray-700 mb-4">
                  本次比赛采用 <strong className="text-[#1E90FF]">多轮淘汰制</strong>：
                </p>
                <div className="bg-gradient-to-r from-[#1E90FF] to-[#00CED1] rounded-lg p-4 text-white mb-4">
                  <p className="font-semibold text-lg">预选赛（多桌） → 晋级赛 → 总决赛（两场）</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-gray-700">• 四人局（尽可能），每轮取前两名晋级；</p>
                  <p className="text-gray-700">• 除总决赛外，其余轮次均为一场定胜负；</p>
                  <p className="text-gray-700">• 总决赛打两场，两轮成绩总和决定冠军。</p>
                </div>
              </div>

              {/* 参赛与分组规则 */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">参赛与分组规则</h3>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">比赛模式</h4>
                    <div className="space-y-4 text-gray-700">
                      <p>四人麻将，<strong>万象修罗规则</strong></p>
                      
                      {/* 规则图片 */}
                      <div className="mt-4 space-y-4">
                        <div className="bg-white rounded-lg p-2 shadow-sm">
                          <img 
                            src="/rule_1.png" 
                            alt="雀魂万象修罗规则图1" 
                            className="w-full h-auto rounded"
                          />
                        </div>
                        <div className="bg-white rounded-lg p-2 shadow-sm">
                          <img 
                            src="/rule_2.png" 
                            alt="雀魂万象修罗规则图2" 
                            className="w-full h-auto rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">分组方式</h4>
                    <div className="space-y-2 text-gray-700">
                      <p>• 所有非种子选手：<strong>随机分组</strong></p>
                      <p>• 种子选手最多八名，种子选手首轮轮空。</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <h4 className="text-lg font-bold text-gray-800 mb-2">注：什么是种子选手？</h4>
                    <p className="text-gray-700">
                      种子选手优先在往期活动高活跃成员，主播和特邀嘉宾中选择。
                    </p>
                  </div>
                </div>
              </div>

              {/* 晋级规则 */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">晋级规则</h3>
                <div className="space-y-4">
                  {/* 首轮 */}
                  <div className="bg-white border-2 border-[#1E90FF] rounded-lg p-5">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-[#1E90FF] rounded-full flex items-center justify-center text-white font-bold mr-3">
                        1
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">首轮海选</h4>
                    </div>
                    <div className="ml-14 space-y-2 text-gray-700">
                      <p>• 8 位种子首轮轮空 → 自动进入第二轮</p>
                      <p>• 首轮海选 24 人，且 6 桌同时进行（每桌4人）</p>
                      <p>• 每桌第 1 名直接晋级（共 6 人）</p>
                      <p>• 所有桌第 2 名进入"复活池"，扔骰子拼大小，取 2 人晋级（共 2 人）</p>
                      <p className="text-[#1E90FF] font-semibold">运气也是实力的一部分！</p>
                    </div>
                  </div>

                  {/* 第二轮 */}
                  <div className="bg-white border-2 border-[#00CED1] rounded-lg p-5">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-[#00CED1] rounded-full flex items-center justify-center text-white font-bold mr-3">
                        2
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">第二轮晋级赛</h4>
                    </div>
                    <div className="ml-14 space-y-2 text-gray-700">
                      <p>• 16人，4桌同时进行</p>
                      <p>• 所有桌前两名晋级（共8人）</p>
                    </div>
                  </div>

                  {/* 第三轮 */}
                  <div className="bg-white border-2 border-[#FFA500] rounded-lg p-5">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-[#FFA500] rounded-full flex items-center justify-center text-white font-bold mr-3">
                        3
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">第三轮半决赛</h4>
                    </div>
                    <div className="ml-14 space-y-2 text-gray-700">
                      <p>• 两桌同时进行</p>
                      <p>• 每桌第一名进入总决赛</p>
                    </div>
                  </div>

                  {/* 第四轮 */}
                  <div className="bg-white border-2 border-[#FFD700] rounded-lg p-5">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center text-white font-bold mr-3">
                        4
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">第四轮总决赛</h4>
                    </div>
                    <div className="ml-14 space-y-2 text-gray-700">
                      <p>• 共两轮，两轮过后总积分高者为总冠军</p>
                      <p>• 若积分相同，则掷骰子决定</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 报名方式 */}
        <section id="registration" className="mb-16 scroll-mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-2 h-8 bg-[#1E90FF] rounded-full mr-4"></div>
              报名方式
            </h2>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#1E90FF] to-[#00CED1] rounded-lg p-6 text-white">
                <div className="flex items-center mb-4">
                  <img 
                    src="/qq_logo.png" 
                    alt="QQ Logo" 
                    className="w-8 h-8 mr-3 object-contain"
                  />
                  <h3 className="text-2xl font-bold">QQ群报名</h3>
                </div>
                <p className="text-lg mb-4">
                  请添加以下QQ群进行报名申请：
                </p>
                <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-2xl font-bold mb-2">QQ群号：</p>
                  <p className="text-3xl font-mono font-bold">1077757525</p>
                  <p className="text-sm mt-2 opacity-90">添加QQ群后，请按照群内指引完成报名</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default MahjongCupRegistration;
