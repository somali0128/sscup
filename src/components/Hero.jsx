const communityGames = ['街霸 6', '雀魂', '无畏契约', '玩家社区'];

const getMatchArtwork = (title = '') => {
  if (title.includes('街霸')) return '/sf6.png';
  if (title.includes('雀魂') || title.includes('麻将')) return '/header_schinese.jpg';
  return null;
};

const getMatchAction = (match) => {
  if (!match) {
    return { label: '浏览近期赛事', href: '#recent-matches' };
  }

  if (match.status === '征集中') {
    return {
      label: '立即报名',
      href: match.actionHref || '/mahjong-cup-registration',
    };
  }

  if (match.status === '已完赛' && match.actionHref) {
    return { label: '查看最新战报', href: match.actionHref };
  }

  return { label: '查看赛事动态', href: '#recent-matches' };
};

const getStatusStyle = (status) => {
  if (status === '征集中') return 'border-[#ffdc55]/50 bg-[#ffdc55] text-[#091722]';
  if (status === '已完赛') return 'border-white/20 bg-white/10 text-white';
  return 'border-[#66f5d1]/40 bg-[#66f5d1]/15 text-[#8fffe4]';
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function Hero({ matches = [], isLoading = false }) {
  const featuredMatch =
    matches.find((match) => match.status === '征集中') ||
    matches.find((match) => match.status === '筹备中') ||
    matches[0];
  const action = getMatchAction(featuredMatch);
  const artwork = getMatchArtwork(featuredMatch?.title);
  const isExternal = /^https?:\/\//i.test(action.href);

  return (
    <section
      id="home"
      className="relative isolate overflow-hidden bg-[#071827] text-white"
    >
      <div aria-hidden="true" className="hero-grid absolute inset-0 opacity-30" />
      <div aria-hidden="true" className="absolute -left-40 top-16 h-96 w-96 rounded-full bg-[#1376ff]/35 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-36 top-1/3 h-[28rem] w-[28rem] rounded-full bg-[#00d6b4]/25 blur-3xl" />
      <div aria-hidden="true" className="absolute bottom-0 left-1/3 h-32 w-72 -rotate-12 bg-[#ff5a36]/15 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[#8fffe4] backdrop-blur-md sm:text-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ffdc55] opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#ffdc55]" />
            </span>
            相信自己，创造奇迹
          </div>

          <h1 className="text-[clamp(3rem,5.2vw,5rem)] font-black leading-[0.92] tracking-[-0.055em]">
            臭鱼烂虾，
            <span className="mt-3 block text-[#66f5d1] sm:mt-4">也能创造奇迹。</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            不论段位，不限游戏。来打一场属于自己的比赛，认识一群愿意认真玩、开心赢的朋友。
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href={action.href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#ffdc55] px-6 py-3 font-bold text-[#091722] shadow-[0_12px_40px_rgba(255,220,85,0.18)] transition hover:-translate-y-0.5 hover:bg-[#ffe57e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffdc55]"
            >
              {action.label}
              <span className="transition-transform group-hover:translate-x-1"><ArrowIcon /></span>
            </a>
            <a
              href="#about"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              认识臭鱼烂虾杯
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
            <span className="flex items-center gap-2"><b className="text-[#66f5d1]">01</b> 所有水平皆可报名</span>
            <span className="flex items-center gap-2"><b className="text-[#66f5d1]">02</b> 小游戏，整大活</span>
            <span className="flex items-center gap-2"><b className="text-[#66f5d1]">03</b> 快乐第一</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[34rem] lg:mx-0 lg:justify-self-end">
          <div aria-hidden="true" className="absolute -inset-5 rotate-3 rounded-[2rem] border border-[#66f5d1]/20 bg-[#66f5d1]/5" />
          <div className="hero-float relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#0d2437]/90 shadow-[0_35px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="relative h-52 overflow-hidden sm:h-64">
              {artwork ? (
                <img
                  src={artwork}
                  alt=""
                  className="h-full w-full object-cover opacity-85"
                />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(135deg,#1376ff_0%,#0a3654_50%,#00b99a_100%)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d2437] via-[#0d2437]/20 to-transparent" />
              <div aria-hidden="true" className="absolute -right-10 -top-8 text-[9rem] font-black leading-none text-white/[0.08] sm:text-[12rem]">S&amp;S</div>
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-[#071827]/75 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] backdrop-blur-md">
                {isLoading ? '同步赛场情报' : 'Featured match'}
              </div>
              <img
                src="/sscup.png"
                alt="S&S Cup Logo"
                className="absolute bottom-3 right-4 h-20 w-20 object-contain drop-shadow-2xl sm:h-24 sm:w-24"
              />
            </div>

            <div className="relative p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${getStatusStyle(featuredMatch?.status)}`}>
                  {isLoading ? '数据同步中' : featuredMatch?.status || '新赛程筹备中'}
                </span>
                <span className="text-sm text-slate-400">{featuredMatch?.date || '下一场，等你来战'}</span>
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">
                {featuredMatch?.title || '下一场比赛正在筹备'}
              </h2>
              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-300 sm:text-base">
                {featuredMatch?.description || '关注赛事动态，选择你擅长的游戏，和新老朋友一起上场。'}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#66f5d1]">Play · Meet · Enjoy</span>
                <a
                  href={action.href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  aria-label={`${action.label}：${featuredMatch?.title || '近期赛事'}`}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:border-[#ffdc55] hover:bg-[#ffdc55] hover:text-[#091722] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffdc55]"
                >
                  <ArrowIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-y border-white/10 bg-[#05121f]/80 py-3 backdrop-blur-sm">
        <div className="overflow-hidden" aria-label={`比赛项目：${communityGames.join('、')}`}>
          <div aria-hidden="true" className="hero-marquee-track whitespace-nowrap text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
            {[0, 1].map((group) => (
              <div key={group} className="hero-marquee-group">
                {communityGames.map((game) => (
                  <span key={`${group}-${game}`} className="flex items-center gap-[clamp(1.5rem,4vw,4rem)]">
                    {game}<i className="h-1.5 w-1.5 shrink-0 rotate-45 bg-[#ffdc55]" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
