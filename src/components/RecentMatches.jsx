const statusStyles = {
  '征集中': 'border-[#ffdc55]/50 bg-[#ffdc55] text-[#091722]',
  '筹备中': 'border-[#66f5d1]/35 bg-[#66f5d1]/15 text-[#8fffe4]',
  '已完赛': 'border-white/15 bg-white/10 text-slate-200',
};

const lightStatusStyles = {
  '征集中': 'bg-[#fff4bd] text-[#765600]',
  '筹备中': 'bg-[#dffbf4] text-[#08705e]',
  '已完赛': 'bg-slate-100 text-slate-600',
};

const getActionConfig = (match) => {
  const href = match.actionHref ?? '/mahjong-cup-registration';
  if (match.status === '征集中') return { label: '立刻报名', href, active: true };
  if (match.status === '已完赛') return { label: '赛况回看', href, active: true };
  return { label: '敬请期待', href: '#', active: false };
};

function ArrowIcon({ className = 'h-5 w-5' }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M5 11h14M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
    </svg>
  );
}

function FeaturedMatch({ match }) {
  if (!match) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        新赛程正在筹备，敬请期待。
      </div>
    );
  }

  const action = getActionConfig(match);
  const isExternal = /^https?:\/\//i.test(action.href);

  return (
    <article className="group relative isolate min-h-[25rem] overflow-hidden rounded-[1.75rem] bg-[#0d2437] p-6 text-white shadow-[0_24px_60px_rgba(7,24,39,0.18)] sm:p-8">
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_90%_10%,rgba(0,214,180,0.28),transparent_38%),radial-gradient(circle_at_0%_100%,rgba(19,118,255,0.35),transparent_45%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div aria-hidden="true" className="absolute -right-5 top-8 -z-10 text-[7rem] font-black leading-none text-white/[0.05] sm:text-[9rem]">S&amp;S</div>

      <div className="flex h-full min-h-[21rem] flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#8fffe4]">Featured match</span>
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[match.status] || statusStyles['筹备中']}`}>
            {match.status || '筹备中'}
          </span>
        </div>

        <div className="mt-auto max-w-2xl pt-16">
          <div className="inline-flex items-center gap-2 text-sm text-slate-300">
            <CalendarIcon />
            <time>{match.date || '日期待定'}</time>
          </div>
          <h3 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{match.title}</h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">{match.description}</p>

          <div className="mt-7 flex items-end justify-between gap-5 border-t border-white/10 pt-6">
            <span className="hidden font-mono text-xs uppercase tracking-[0.2em] text-[#66f5d1] sm:block">Play · Meet · Enjoy</span>
            {action.active ? (
              <a
                href={action.href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="group/action inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#ffdc55] px-5 py-3 font-bold text-[#091722] transition hover:-translate-y-0.5 hover:bg-[#ffe57e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffdc55]"
              >
                {action.label}
                <span className="transition-transform group-hover/action:translate-x-1"><ArrowIcon /></span>
              </a>
            ) : (
              <span className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-5 py-3 font-bold text-slate-300">
                {action.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function CompactMatch({ match }) {
  const action = getActionConfig(match);
  const isExternal = /^https?:\/\//i.test(action.href);

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${lightStatusStyles[match.status] || lightStatusStyles['筹备中']}`}>
          {match.status || '筹备中'}
        </span>
        {action.active && <ArrowIcon className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#147fe6]" />}
      </div>
      <h4 className="mt-5 text-lg font-black leading-snug text-slate-900">{match.title}</h4>
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <CalendarIcon />
        <time>{match.date || '日期待定'}</time>
      </div>
    </>
  );

  return action.active ? (
    <a
      href={action.href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#1E90FF]/30 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E90FF]"
    >
      {content}
    </a>
  ) : (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{content}</article>
  );
}

function NewsFeed({ news = [] }) {
  const visibleNews = news.slice(0, 5);

  return (
    <aside className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(15,43,66,0.08)] sm:p-7">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00a98f]">News feed</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">最新动态</h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dffbf4] text-[#008a74]">
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2M7 8h6v4H7V8zm0 8h6" />
          </svg>
        </div>
      </div>

      {visibleNews.length > 0 ? (
        <ol className="mt-2">
          {visibleNews.map((item, index) => {
            const isFeatured = index === 0;
            const content = (
              <div className={`group relative grid grid-cols-[2.5rem_1fr] gap-3 rounded-2xl px-3 py-5 transition ${isFeatured ? 'bg-[#effcf8]' : 'hover:bg-slate-50'}`}>
                <div className="relative flex justify-center">
                  {index < visibleNews.length - 1 && <span aria-hidden="true" className="absolute left-1/2 top-7 h-[calc(100%+1.25rem)] w-px -translate-x-1/2 bg-slate-200" />}
                  <span className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full font-mono text-[10px] font-black ${isFeatured ? 'bg-[#66f5d1] text-[#073b32] ring-4 ring-[#dffbf4]' : 'border border-slate-200 bg-white text-slate-500'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="min-w-0 pr-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <time>{item.date || '最近更新'}</time>
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="font-semibold text-[#008a74]">{item.category || '社区动态'}</span>
                    {isFeatured && <span className="rounded-full bg-[#ffdc55] px-2 py-0.5 text-[10px] font-black text-[#5d4500]">NEW</span>}
                  </div>
                  <div className="mt-2 flex items-start gap-3">
                    <p className="flex-1 font-bold leading-6 text-slate-800">{item.title || item.content}</p>
                    {item.href && <ArrowIcon className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#147fe6]" />}
                  </div>
                  {item.title && item.content && <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{item.content}</p>}
                </div>
              </div>
            );

            return item.href ? (
              <li key={item.id}>
                <a href={item.href} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E90FF]">{content}</a>
              </li>
            ) : (
              <li key={item.id}>{content}</li>
            );
          })}
        </ol>
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">···</div>
          <p className="mt-4 font-bold text-slate-700">暂时没有新动态</p>
          <p className="mt-1 text-sm text-slate-500">新的赛事消息会第一时间出现在这里。</p>
        </div>
      )}

      {news.length > visibleNews.length && (
        <p className="mt-4 border-t border-slate-100 pt-5 text-center text-sm font-semibold text-slate-500">
          还有 {news.length - visibleNews.length} 条历史动态
        </p>
      )}
    </aside>
  );
}

function RecentMatches({ matches = [], news = [] }) {
  const featuredMatch = matches[0];
  const secondaryMatches = matches.slice(1, 3);

  return (
    <section id="recent-matches" className="relative overflow-hidden bg-gradient-to-b from-white via-[#f6fbff] to-white py-16 sm:py-20">
      <div aria-hidden="true" className="absolute -left-36 top-28 h-72 w-72 rounded-full bg-[#1E90FF]/10 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-28 bottom-20 h-72 w-72 rounded-full bg-[#66f5d1]/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1E90FF]">Latest updates</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">赛事动态中心</h2>
            <p className="mt-3 max-w-2xl text-slate-500">关注下一场对局、报名进度与俱乐部最新消息。</p>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#66f5d1] opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00b99a]" />
            </span>
            动态持续更新
          </div>
        </div>

        <div className="mt-10 grid items-start gap-7 lg:grid-cols-[minmax(0,7fr)_minmax(22rem,5fr)]">
          <div className="min-w-0">
            <FeaturedMatch match={featuredMatch} />
            {secondaryMatches.length > 0 && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {secondaryMatches.map((match) => <CompactMatch key={match.id} match={match} />)}
              </div>
            )}
          </div>
          <NewsFeed news={news} />
        </div>
      </div>
    </section>
  );
}

export default RecentMatches;
