import { useMemo, useState } from 'react';

const INITIAL_VISIBLE_COUNT = 3;

const getGameDetails = (title = '') => {
  const categoryMatch = title.match(/^【([^】]+)】\s*/);
  return {
    category: categoryMatch?.[1] || '俱乐部赛事',
    title: title.replace(/^【[^】]+】\s*/, '') || title,
  };
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 8h14M7 8V5h10v3m-9 0v11h8V8m-5 4h2" />
    </svg>
  );
}

function MatchArchiveCard({ match }) {
  const game = getGameDetails(match.title);

  return (
    <article className="group flex min-h-[17rem] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#1E90FF]/30 hover:shadow-[0_16px_40px_rgba(15,43,66,0.1)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-[#eaf5ff] px-3 py-1 text-xs font-black text-[#147fe6]">
          {match.quarter || '赛事记录'}
        </span>
        <time className="font-mono text-xs text-slate-400">{match.date || '日期待整理'}</time>
      </div>

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#008a74]">{game.category}</p>
        <h3 className="mt-2 text-xl font-black leading-snug text-slate-900">{game.title}</h3>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">{match.description}</p>

      <div className="mt-auto border-t border-slate-100 pt-5">
        {match.resultLink ? (
          <a
            href={match.resultLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link inline-flex min-h-10 items-center gap-2 rounded-lg font-bold text-[#147fe6] transition hover:text-[#0d67bc] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E90FF]"
          >
            查看赛况
            <span className="group-hover/link:translate-x-0.5"><ArrowIcon /></span>
          </a>
        ) : (
          <span className="inline-flex min-h-10 items-center text-sm font-semibold text-slate-400">暂无公开回放</span>
        )}
      </div>
    </article>
  );
}

function QuarterGroup({ quarter, matches }) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-4">
        <h3 className="shrink-0 text-lg font-black text-slate-800">{quarter}</h3>
        <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
        <span className="shrink-0 text-xs font-semibold text-slate-400">{matches.length} 场</span>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => <MatchArchiveCard key={match.id} match={match} />)}
      </div>
    </div>
  );
}

function PastMatches({ pastMatches = [] }) {
  const [showAll, setShowAll] = useState(false);
  const sortedMatches = useMemo(
    () => [...pastMatches].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [pastMatches],
  );
  const groupedMatches = useMemo(
    () => Object.entries(sortedMatches.reduce((groups, match) => {
      const quarter = match.quarter || '其他赛事';
      if (!groups[quarter]) groups[quarter] = [];
      groups[quarter].push(match);
      return groups;
    }, {})).sort(([a], [b]) => b.localeCompare(a)),
    [sortedMatches],
  );
  const recentMatches = sortedMatches.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMore = sortedMatches.length > INITIAL_VISIBLE_COUNT;

  return (
    <section id="past-matches" className="relative overflow-hidden bg-gradient-to-b from-white via-[#f7faff] to-white py-16 sm:py-20">
      <div aria-hidden="true" className="absolute -left-32 bottom-10 h-72 w-72 rounded-full bg-[#66f5d1]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1E90FF]">Match archive</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">往期比赛</h2>
            <p className="mt-3 max-w-2xl text-slate-500">精彩比赛不定期返场</p>
          </div>
          <div className="inline-flex items-center gap-3 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-500 shadow-sm sm:self-auto">
            <span className="text-[#008a74]"><ArchiveIcon /></span>
            共 {sortedMatches.length} 场赛事
          </div>
        </div>

        {sortedMatches.length > 0 ? (
          <div id="match-archive-list" className="mt-10">
            {showAll ? (
              <div className="space-y-10">
                {groupedMatches.map(([quarter, matches]) => (
                  <QuarterGroup key={quarter} quarter={quarter} matches={matches} />
                ))}
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {recentMatches.map((match) => <MatchArchiveCard key={match.id} match={match} />)}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-10 flex min-h-64 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400"><ArchiveIcon /></div>
            <h3 className="mt-5 text-lg font-black text-slate-800">比赛记录正在整理</h3>
            <p className="mt-2 text-sm text-slate-500">完成的赛事会被收录在这里。</p>
          </div>
        )}

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              aria-controls="match-archive-list"
              aria-expanded={showAll}
              onClick={() => setShowAll((current) => !current)}
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#1E90FF]/20 bg-[#1E90FF]/10 px-7 py-3 font-bold text-[#1873CC] transition hover:-translate-y-0.5 hover:border-[#1E90FF]/35 hover:bg-[#1E90FF] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E90FF]"
            >
              {showAll ? '收起比赛档案' : `查看全部 ${sortedMatches.length} 场比赛`}
              <svg aria-hidden="true" className={`h-5 w-5 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default PastMatches;
