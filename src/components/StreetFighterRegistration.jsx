import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const initialForm = {
  gameId: '',
  rankCurrent: '',
  mainCharacters: '',
  bracket: '',
  mentorCup: '',
  voiceOk: '',
};

function StreetFighterRegistration() {
  const [activeSection, setActiveSection] = useState('intro');
  const [form, setForm] = useState(initialForm);
  const [copyHint, setCopyHint] = useState('');
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setActiveSection(hash);
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          const navbarHeight = 64;
          const topNavHeight = 70;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - navbarHeight - topNavHeight,
            behavior: 'smooth',
          });
        }, 100);
      }
    }
  }, [location.hash]);

  const handleNavClick = (section) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      const navbarHeight = 64;
      const topNavHeight = 70;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navbarHeight - topNavHeight,
        behavior: 'smooth',
      });
      window.history.pushState(null, '', `#${section}`);
    }
  };

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildRegistrationText = () => {
    const lines = [
      '【臭鱼烂虾街霸大会 · 报名信息】',
      '',
      `1. 游戏ID：${form.gameId || '（未填）'}`,
      `2. 当前段位：${form.rankCurrent || '（未填）'}`,
      `3. 常用角色：${form.mainCharacters || '（未填）'}`,
      `4. 报名组别：${form.bracket || '（未填）'}`,
      `5. 是否愿意参加师徒杯：${form.mentorCup || '（未填）'}`,
      `6. 是否可语音：${form.voiceOk || '（未填）'}`,
    ];
    return lines.join('\n');
  };

  const handleCopy = async () => {
    const text = buildRegistrationText();
    try {
      await navigator.clipboard.writeText(text);
      setCopyHint('已复制到剪贴板，请粘贴到 QQ 群或发给管理员');
    } catch {
      setCopyHint('复制失败，请手动全选复制');
    }
    setTimeout(() => setCopyHint(''), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative w-full h-56 md:h-72 overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#4a0e0e] to-[#c45c26]">
        <div className="absolute inset-0 opacity-30 bg-[url('/sf6.png')] bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="text-center text-white">
            <p className="text-sm md:text-base font-semibold text-amber-200/90 mb-2">街头霸王6</p>
            <h1 className="text-3xl md:text-5xl font-bold mb-3 drop-shadow-lg">
              【臭鱼烂虾】街霸师徒杯
            </h1>
            <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
              正式开启报名！
            </p>
          </div>
        </div>
      </section>

      <nav className="hidden md:block sticky top-16 bg-white shadow-md z-40 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 py-4">
            <a
              href="/"
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#1E90FF] hover:bg-gray-50 transition-colors duration-200"
            >
              ← 返回首页
            </a>
            <div className="w-px bg-gray-300 hidden sm:block" />
            {[
              { id: 'intro', label: '活动介绍' },
              { id: 'groups', label: '正式赛分组' },
              { id: 'rules', label: '赛制与说明' },
              { id: 'registration', label: '报名表单' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleNavClick(id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeSection === id
                    ? 'text-[#1E90FF] bg-blue-50'
                    : 'text-gray-700 hover:text-[#1E90FF] hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section id="intro" className="mb-16 scroll-mt-28 md:scroll-mt-36">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-red-600 to-amber-500 rounded-full mr-4" />
              活动介绍
            </h2>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-2">游戏项目</h3>
              <p className="text-lg text-gray-700 font-medium">Street Fighter 6</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="rounded-xl border-2 border-[#1E90FF]/30 bg-blue-50/50 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-800">正式赛</h3>
                </div>
                <p className="text-gray-700 font-semibold">5月16日（周六）</p>
                <p className="text-gray-600">晚 20:00 - 23:00</p>
              </div>
              <div className="rounded-xl border-2 border-amber-500/40 bg-amber-50/60 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-800">师徒杯娱乐赛</h3>
                </div>
                <p className="text-gray-700 font-semibold">5月17日（周日）</p>
                <p className="text-gray-600">晚 20:00 - 23:00</p>
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-r from-[#1E90FF] to-cyan-600 p-6 text-white">
              <p className="text-lg font-medium leading-relaxed">
                本次正式赛将根据玩家水平分为三个组别，并举办师徒杯娱乐特别活动。详细分组与赛制订请看下方章节。
              </p>
            </div>
          </div>
        </section>

        <section id="groups" className="mb-16 scroll-mt-28 md:scroll-mt-36">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-red-600 to-amber-500 rounded-full mr-4" />
              正式赛分组
            </h2>
            <p className="text-gray-600 mb-6">本次正式赛将根据玩家水平分为三个组别：</p>

            <div className="space-y-6">
              <div className="rounded-xl border border-amber-800/20 bg-gradient-to-br from-stone-100 to-amber-50/80 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                  金属组
                </h3>
                <p className="text-sm text-gray-600 mb-4">黑铁-黄金</p>
                <p className="text-sm font-semibold text-gray-700 mb-2">适合：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                  <li>新人玩家</li>
                  <li>总游戏时长不足100h的玩家</li>
                </ul>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">预计人数：</span>8 - 12 人
                </p>
              </div>

              <div className="rounded-xl border border-cyan-600/25 bg-gradient-to-br from-cyan-50 to-sky-50 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                  渡劫组
                </h3>
                <p className="text-sm text-gray-600 mb-4">白金-钻石</p>
                <p className="text-sm font-semibold text-gray-700 mb-2">适合：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                  <li>已经开始理解对局</li>
                  <li>正在经历「坐牢修行」的玩家</li>
                </ul>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">预计人数：</span>2 - 4 人
                </p>
              </div>

              <div className="rounded-xl border border-red-700/25 bg-gradient-to-br from-red-950/5 to-orange-50 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                  大师组
                </h3>
                <p className="text-sm text-gray-600 mb-4">Master</p>
                <p className="text-sm font-semibold text-gray-700 mb-2">适合：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                  <li>Master 段位玩家</li>
                  <li>负分大师也是大师</li>
                </ul>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">预计人数：</span>2 - 4 人
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-lg bg-gray-50 border-l-4 border-[#1E90FF] p-5">
              <h3 className="font-bold text-gray-800 mb-3">📌 分组说明</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>分组将参考玩家历史最高段位与实际水平</li>
                <li>主办方保留最终分组调整权</li>
                <li>若出现明显炸鱼情况，主办方有权重新分配组别</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="rules" className="mb-16 scroll-mt-28 md:scroll-mt-36">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-red-600 to-amber-500 rounded-full mr-4" />
              赛制与说明
            </h2>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">正式赛赛制</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>除总决赛外均为 BO3</li>
                <li>总决赛为 BO5</li>
                <li>暂定为传统晋级赛，包含败者组，将根据实际报名人数决定具体淘汰形式</li>
                <li>比赛默认线上进行</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">师徒杯（娱乐赛）</h3>
              <p className="text-gray-700 mb-3">师徒杯为娱乐性质特别活动。</p>
              <p className="text-sm font-semibold text-gray-800 mb-2">目前暂定：</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>师父带徒弟组队</li>
                <li>可能采用随机组队 / 指导赛 / 接力赛等形式</li>
                <li>将根据最终报名人数与玩家构成决定具体规则</li>
              </ul>
              <p className="text-gray-700 bg-amber-50 rounded-lg p-4 border border-amber-200/60">
                即使没有固定师父或徒弟，也欢迎报名参加。
              </p>
            </div>

            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-3">⚠️ 注意事项</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>请确保比赛期间网络稳定</li>
                <li>默认允许直播与解说</li>
                <li>禁止作弊、代打及恶意行为</li>
                <li>主办方保留最终解释权</li>
              </ul>
            </div>

          </div>
        </section>

        <section id="registration" className="mb-16 scroll-mt-28 md:scroll-mt-36">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-red-600 to-amber-500 rounded-full mr-4" />
              报名表单
            </h2>
            <p className="text-gray-600 mb-6">
              请填写以下信息，完成后可复制文本发送至 QQ 群完成报名。
            </p>

            <div className="space-y-5 max-w-2xl">
              <label className="block">
                <span className="text-sm font-medium text-gray-800">1. 游戏 ID</span>
                <input
                  type="text"
                  value={form.gameId}
                  onChange={(e) => setField('gameId', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#1E90FF] focus:ring-2 focus:ring-[#1E90FF]/20 outline-none"
                  placeholder="例如：CFN 显示名"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-800">2. 当前段位</span>
                <input
                  type="text"
                  value={form.rankCurrent}
                  onChange={(e) => setField('rankCurrent', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-[#1E90FF] focus:ring-2 focus:ring-[#1E90FF]/20"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-800">3. 常用角色</span>
                <input
                  type="text"
                  value={form.mainCharacters}
                  onChange={(e) => setField('mainCharacters', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-[#1E90FF] focus:ring-2 focus:ring-[#1E90FF]/20"
                  placeholder="可多写，用顿号或逗号分隔"
                />
              </label>
              <fieldset>
                <legend className="text-sm font-medium text-gray-800">4. 报名组别</legend>
                <div className="mt-2 space-y-2">
                  {[
                    { value: '金属组（Bronze / Silver / Gold）', label: '金属组' },
                    { value: '渡劫组（Platinum / Diamond）', label: '渡劫组' },
                    { value: '大师组（Master）', label: '大师组' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="bracket"
                        value={opt.value}
                        checked={form.bracket === opt.value}
                        onChange={(e) => setField('bracket', e.target.value)}
                        className="text-[#1E90FF] focus:ring-[#1E90FF]"
                      />
                      <span className="text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-medium text-gray-800">5. 是否愿意参加师徒杯</legend>
                <div className="mt-2 flex flex-wrap gap-4">
                  {['愿意', '暂不考虑'].map((v) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mentorCup"
                        value={v}
                        checked={form.mentorCup === v}
                        onChange={(e) => setField('mentorCup', e.target.value)}
                        className="text-[#1E90FF] focus:ring-[#1E90FF]"
                      />
                      <span className="text-gray-700">{v}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-medium text-gray-800">6. 是否可语音</legend>
                <div className="mt-2 flex flex-wrap gap-4">
                  {['可以', '不方便'].map((v) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="voiceOk"
                        value={v}
                        checked={form.voiceOk === v}
                        onChange={(e) => setField('voiceOk', e.target.value)}
                        className="text-[#1E90FF] focus:ring-[#1E90FF]"
                      />
                      <span className="text-gray-700">{v}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="px-6 py-3 rounded-lg bg-[#1E90FF] text-white font-medium hover:bg-[#1873CC] transition-colors"
              >
                复制报名信息
              </button>
              <button
                type="button"
                onClick={() => setForm(initialForm)}
                className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                清空表单
              </button>
            </div>
            {copyHint && (
              <p className="mt-3 text-sm text-green-700">{copyHint}</p>
            )}

            <div className="mt-10 rounded-xl bg-gradient-to-r from-[#1E90FF] to-cyan-600 p-6 text-white">
              <div className="flex items-center mb-3">
                <img src="/qq_logo.png" alt="QQ" className="w-8 h-8 mr-3 object-contain" />
                <h3 className="text-xl font-bold">QQ 群报名</h3>
              </div>
              <p className="mb-4 opacity-95">复制报名信息后，请先申请入群，之后发至群内或按群公告指引完成报名。</p>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm opacity-90 mb-1">QQ 群号</p>
                <p className="text-2xl font-mono font-bold">1004017180</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default StreetFighterRegistration;
