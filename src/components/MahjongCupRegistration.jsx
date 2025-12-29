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
      {/* Banner区域 - 手机端隐藏 */}
      <section className="relative w-full hidden md:block h-64 md:h-96 overflow-hidden">
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

      {/* 顶部导航链接 - 手机端固定在顶部，桌面端在navbar下方 */}
      <nav className="sticky top-0 md:top-16 bg-white shadow-md z-40 border-b">
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
                    <p className="text-lg font-bold">16 人</p>
                  </div>
                </div>
              </div>

              {/* 报名须知 */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <h4 className="text-lg font-bold text-gray-800 mb-2">报名条件</h4>
                <p className="text-gray-700">
                  会打雀魂·万象修罗即可，心态爆炸请自备
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
              {/* 一、赛事基本信息 */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">一、赛事基本信息</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="space-y-3 text-gray-700">
                      <p><strong className="text-gray-800">赛事名称：</strong>臭鱼烂虾杯 · 雀魂积分赛（万象修罗）</p>
                      <p><strong className="text-gray-800">比赛形式：</strong>线上积分制比赛</p>
                      <p><strong className="text-gray-800">参赛人数：</strong>16 人</p>
                      <p><strong className="text-gray-800">默认对局模式：</strong>四人麻将（万象修罗规则）</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-[#1E90FF] to-[#00CED1] rounded-lg p-4 text-white">
                    <h4 className="text-lg font-bold mb-2">赛事定位：</h4>
                    <p className="mb-2">非淘汰 · 多轮对局 · 积分制</p>
                    <p className="text-sm opacity-90">一把定不了命运，但会留下痕迹。</p>
                  </div>
                  
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

              {/* 二、赛制总览 */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">二、赛制总览</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    本赛事采用 <strong className="text-[#1E90FF]">非淘汰积分制</strong>，<br/>
                    全员多轮对局，累计积分排名，<br/>
                    最终按总积分高低决定名次。
                  </p>
                </div>
              </div>

              {/* 三、比赛结构 */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">三、比赛结构</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">3.1 对局轮次</h4>
                    <div className="space-y-2 text-gray-700">
                      <p>• 全体选手参与 <strong>5轮比赛</strong></p>
                      <p>• 每轮：</p>
                      <div className="ml-4 space-y-1">
                        <p>- 重新分桌</p>
                        <p>- 每桌进行 1 场对局</p>
                        <p>- 比赛过程中不设淘汰</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">3.2 分桌规则</h4>
                    <div className="space-y-2 text-gray-700">
                      <p>• 原则上使用 <strong>四人桌</strong></p>
                      <p>• 每轮结束后：</p>
                      <div className="ml-4 space-y-1">
                        <p>- 更新总积分榜</p>
                        <p>- 重新分桌</p>
                        <p>- 优先匹配之前没一起打过的人</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 四、积分计算规则 */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">四、积分计算规则</h3>
                <div className="space-y-4">
                  <div className="bg-white border-2 border-[#1E90FF] rounded-lg p-5">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">4.1 四人场积分计算</h4>
                    <div className="space-y-2 text-gray-700">
                      <p>• 使用雀魂对局结束时显示的 <strong>最终得点</strong></p>
                      <p>• 每名选手在该局获得的得点：<strong>直接计入个人总积分</strong></p>
                      <p>• 所有四人场对局：</p>
                      <div className="ml-4 space-y-1">
                        <p>- 不做额外换算</p>
                        <p>- 不设名次加权</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border-2 border-[#FFA500] rounded-lg p-5">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">4.2 三人场的处理规则</h4>
                    <div className="space-y-3 text-gray-700">
                      <p>在以下情况可能出现三人场：</p>
                      <div className="ml-4 space-y-1">
                        <p>• 参赛人数临时不足</p>
                        <p>• 掉线 / 异常情况</p>
                        <p>• 赛事流程需要临时调整</p>
                      </div>
                      <p>为保证积分公平性，三人场得点将进行比例换算后计入总积分。</p>
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <h5 className="font-bold text-gray-800 mb-2">三人场积分换算方式</h5>
                        <div className="space-y-2">
                          <p>• 以 <strong>四人场为基准</strong></p>
                          <p>• 三人场得点 × 4 ÷ 3</p>
                          <p>• 换算后的结果：计入个人总积分</p>
                          <p>• 小数部分保留到整数（四舍五入）</p>
                        </div>
                        <div className="mt-3 bg-white rounded p-3">
                          <p className="font-semibold mb-1">示例：</p>
                          <p>三人场某选手得点：+12,000</p>
                          <p>换算后计入积分：12,000 × 4 ÷ 3 ≈ <strong>16,000</strong></p>
                        </div>
                        <p className="text-sm mt-3 text-gray-600">
                          说明：该换算仅用于 人数差异带来的期望值修正，不代表三人场与四人场在竞技层面的完全等价。
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">4.3 积分统一原则</h4>
                    <div className="space-y-2 text-gray-700">
                      <p>所有对局（四人 / 三人）：最终都只体现在 <strong>"总积分榜"</strong></p>
                      <p>不额外区分：</p>
                      <div className="ml-4 space-y-1">
                        <p>• 对局类型</p>
                        <p>• 桌次</p>
                        <p>• 对手强弱</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 五、排名与决赛安排 */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">五、排名与决赛安排</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">5.1 排名规则</h4>
                    <div className="space-y-2 text-gray-700">
                      <p>• 按 <strong>总积分从高到低</strong> 排名</p>
                      <p>• 若总积分相同：</p>
                      <div className="ml-4 space-y-1">
                        <p>- 扔骰子决定（祝你好运）</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 六、异常与特殊情况 */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">六、异常与特殊情况</h3>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">6.1 掉线处理</h4>
                    <div className="space-y-2 text-gray-700">
                      <p>• 掉线后允许短时间重连</p>
                      <p>• 无法重连者：按当局最低得点结算</p>
                      <p>• 是否重开由主办方裁定</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-gray-800 mb-3">6.2 规则调整权</h4>
                    <div className="space-y-2 text-gray-700">
                      <p>若出现规则未覆盖情况：</p>
                      <div className="ml-4 space-y-1">
                        <p>• 由臭鱼烂虾杯组委会现场裁定</p>
                        <p>• 所有裁定结果为最终结果，不接受赛后申诉</p>
                      </div>
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
