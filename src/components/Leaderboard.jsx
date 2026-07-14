import { useEffect, useMemo, useState } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const INITIAL_VISIBLE_COUNT = 10;

const scoreLabels = {
  participation: '参赛',
  ranking: '名次',
  honors: '荣誉',
  contribution: '贡献',
  bonus: '加成',
};

const podiumStyles = {
  1: {
    order: 'md:order-2',
    card: 'leaderboard-champion border-[#e7bd34] bg-gradient-to-b from-[#fff8d8] via-white to-white',
    badge: 'bg-[#f3c845] text-[#4b3600]',
    ring: 'ring-[#f3c845]/35',
    label: '赛季第一',
    icon: '🥇',
  },
  2: {
    order: 'md:order-1 md:mt-12',
    card: 'border-[#b8c0cc] bg-gradient-to-b from-slate-100 to-white',
    badge: 'bg-slate-300 text-slate-700',
    ring: 'ring-slate-300/50',
    label: '第二名',
    icon: '🥈',
  },
  3: {
    order: 'md:order-3 md:mt-12',
    card: 'border-[#c9824d] bg-gradient-to-b from-orange-50 to-white',
    badge: 'bg-[#d78b52] text-white',
    ring: 'ring-orange-300/45',
    label: '第三名',
    icon: '🥉',
  },
};

const rarityColors = {
  orange: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/30',
  purple: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/30',
  blue: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/30',
  green: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30',
};

function PlayerAvatar({ player, className = 'h-16 w-16', ringClass = 'ring-gray-200' }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`${className} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 ring-4 ${ringClass}`}>
      {player.avatar && !hasError ? (
        <img
          src={player.avatar}
          alt={player.name}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-2xl font-bold text-slate-600">{player.name.charAt(0)}</span>
      )}
    </div>
  );
}

function HonorTags({ tags = [], limit }) {
  const visibleTags = typeof limit === 'number' ? tags.slice(0, limit) : tags;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {visibleTags.map((tag, index) => {
        const name = typeof tag === 'string' ? tag : tag.name;
        const description = typeof tag === 'string' ? '' : tag.description;
        const rarity = typeof tag === 'object' ? tag.rarity : null;
        const tagContent = (
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold shadow-md ${rarityColors[rarity] || 'bg-[#1E90FF] text-white'}`}>
            {name}
          </span>
        );

        return description ? (
          <Tippy key={`${name}-${index}`} content={description} placement="top" arrow theme="dark">
            {tagContent}
          </Tippy>
        ) : (
          <span key={`${name}-${index}`}>{tagContent}</span>
        );
      })}
    </div>
  );
}

function ScoreDisplay({ player, displayedScore, maxScore, prominent = false }) {
  const breakdown = player.scoreBreakdown && typeof player.scoreBreakdown === 'object'
    ? Object.entries(player.scoreBreakdown).filter(([, value]) => Number.isFinite(value) && value > 0)
    : [];
  const percentage = maxScore > 0 ? Math.max(4, (player.score / maxScore) * 100) : 0;

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <span className="text-sm font-medium text-slate-500">活跃分</span>
        <strong className={`${prominent ? 'text-4xl' : 'text-2xl'} tracking-tight text-[#147fe6]`}>
          {displayedScore.toLocaleString()}
        </strong>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/80" aria-hidden="true">
        <div
          className={`h-full rounded-full ${prominent ? 'bg-gradient-to-r from-[#e8b923] to-[#ffdc55]' : 'bg-gradient-to-r from-[#1E90FF] to-[#00CED1]'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {breakdown.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          {breakdown.map(([key, value]) => (
            <span key={key}>{scoreLabels[key] || key} <b className="text-slate-700">+{value.toLocaleString()}</b></span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          参赛基础分 <span className="mx-1 text-[#1E90FF]">+</span> 荣誉加成
        </p>
      )}
    </div>
  );
}

function BilibiliLink({ player, compact = false }) {
  if (!player.bilibiliLink) return null;

  return (
    <a
      href={`https://space.bilibili.com/${player.bilibiliLink}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`访问 ${player.name} 的 B 站主页`}
      className={`${compact ? 'h-9 w-9 px-0' : 'px-4 py-2'} inline-flex items-center justify-center gap-2 rounded-lg bg-[#FB7299] text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#E85A7F]`}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
      </svg>
      {!compact && '访问B站'}
    </a>
  );
}

function PodiumCard({ player, rank, displayedScore, maxScore }) {
  const style = podiumStyles[rank];
  const isChampion = rank === 1;

  return (
    <article
      data-rank={rank}
      className={`${style.order} ${style.card} relative flex min-h-[30rem] flex-col overflow-hidden rounded-[1.75rem] border-2 p-6 shadow-xl`}
    >
      {isChampion && <div aria-hidden="true" className="absolute inset-x-10 -top-16 h-36 rounded-full bg-[#ffdc55]/30 blur-3xl" />}
      <div className="relative flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-xs font-black tracking-wide ${style.badge}`}>{style.label}</span>
        <span className={`text-4xl ${isChampion ? 'champion-medal' : ''}`} aria-label={style.label}>{style.icon}</span>
      </div>

      <div className="relative mt-6 flex flex-col items-center text-center">
        <PlayerAvatar
          player={player}
          className={isChampion ? 'h-28 w-28' : 'h-24 w-24'}
          ringClass={style.ring}
        />
        <h3 className={`${isChampion ? 'text-2xl' : 'text-xl'} mt-5 font-black text-slate-900`}>{player.name}</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">排名 {rank}</p>
      </div>

      <div className="relative mt-6 border-y border-slate-200/80 py-5">
        <ScoreDisplay player={player} displayedScore={displayedScore} maxScore={maxScore} prominent={isChampion} />
      </div>

      <div className="relative mt-5 flex flex-1 flex-col items-center justify-between gap-5">
        <HonorTags tags={player.honorTags} limit={isChampion ? 4 : 3} />
        <BilibiliLink player={player} />
      </div>
    </article>
  );
}

function RankingCard({ player, rank, displayedScore, maxScore }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#1E90FF]/30 hover:shadow-lg">
      <div className="flex items-center gap-4">
        <div className="w-10 shrink-0 text-center text-xl font-black text-slate-400">#{rank}</div>
        <PlayerAvatar player={player} className="h-14 w-14" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-slate-800">{player.name}</h3>
          <p className="mt-1 truncate text-xs text-slate-500">
            {player.honorTags?.[0]
              ? (typeof player.honorTags[0] === 'string' ? player.honorTags[0] : player.honorTags[0].name)
              : '持续活跃中'}
          </p>
        </div>
        <BilibiliLink player={player} compact />
      </div>
      <div className="mt-4 border-t border-slate-100 pt-4">
        <ScoreDisplay player={player} displayedScore={displayedScore} maxScore={maxScore} />
      </div>
    </article>
  );
}

function Leaderboard({ players }) {
  const [displayedScores, setDisplayedScores] = useState({});
  const [showAll, setShowAll] = useState(false);
  const [showScoreRules, setShowScoreRules] = useState(false);

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => b.score - a.score),
    [players],
  );
  const podiumPlayers = sortedPlayers.slice(0, 3);
  const remainingPlayers = showAll
    ? sortedPlayers.slice(3)
    : sortedPlayers.slice(3, INITIAL_VISIBLE_COUNT);
  const maxScore = sortedPlayers[0]?.score || 0;

  useEffect(() => {
    const duration = 1600;
    const steps = 48;
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      setDisplayedScores(Object.fromEntries(
        sortedPlayers.map((player) => [
          player.id,
          step >= steps ? player.score : Math.floor((player.score / steps) * step),
        ]),
      ));
      if (step >= steps) window.clearInterval(timer);
    }, duration / steps);

    return () => window.clearInterval(timer);
  }, [sortedPlayers]);

  return (
    <section id="leaderboard" className="bg-gradient-to-b from-white via-[#f8fbff] to-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1E90FF]">Season standings</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">排行榜</h2>
            <p className="mt-2 text-slate-500">用每一次参赛和荣誉，累积属于你的活跃分。</p>
          </div>
          <button
            type="button"
            aria-controls="score-rules"
            aria-expanded={showScoreRules}
            onClick={() => setShowScoreRules((current) => !current)}
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-[#1E90FF]/20 bg-white px-4 py-2.5 text-sm font-bold text-[#1873CC] shadow-sm transition hover:border-[#1E90FF]/40 hover:bg-[#1E90FF]/5 sm:self-auto"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1E90FF]/10">?</span>
            积分如何计算
          </button>
        </div>

        {showScoreRules && (
          <div id="score-rules" className="mt-6 grid gap-3 rounded-2xl border border-[#1E90FF]/15 bg-[#eef7ff] p-5 text-sm text-slate-600 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
            <div><b className="block text-slate-900">参与活动</b><span>获得每场比赛的基础积分</span></div>
            <span className="hidden text-xl font-black text-[#1E90FF] md:block">+</span>
            <div><b className="block text-slate-900">荣誉成就</b><span>按标签稀有度获得额外加成</span></div>
            <span className="hidden text-xl font-black text-[#1E90FF] md:block">=</span>
            <div><b className="block text-slate-900">活跃分</b><span>所有积分累计后的排行榜总分</span></div>
          </div>
        )}

        <div className="mt-12 grid items-start gap-6 md:grid-cols-3" aria-label="排行榜前三名">
          {podiumPlayers.map((player, index) => (
            <PodiumCard
              key={player.id}
              player={player}
              rank={index + 1}
              displayedScore={displayedScores[player.id] || 0}
              maxScore={maxScore}
            />
          ))}
        </div>

        {remainingPlayers.length > 0 && (
          <div className="mt-14">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800">其他排名</h3>
              <span className="text-sm text-slate-500">第 4–{showAll ? sortedPlayers.length : Math.min(INITIAL_VISIBLE_COUNT, sortedPlayers.length)} 名</span>
            </div>
            <div id="leaderboard-more-players" className="grid gap-4 md:grid-cols-2">
              {remainingPlayers.map((player) => {
                const rank = sortedPlayers.indexOf(player) + 1;
                return (
                  <RankingCard
                    key={player.id}
                    player={player}
                    rank={rank}
                    displayedScore={displayedScores[player.id] || 0}
                    maxScore={maxScore}
                  />
                );
              })}
            </div>
          </div>
        )}

        {sortedPlayers.length > INITIAL_VISIBLE_COUNT && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              aria-controls="leaderboard-more-players"
              aria-expanded={showAll}
              onClick={() => setShowAll((current) => !current)}
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#1E90FF]/20 bg-[#1E90FF]/10 px-7 py-3 font-bold text-[#1873CC] transition hover:-translate-y-0.5 hover:border-[#1E90FF]/35 hover:bg-[#1E90FF] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E90FF]"
            >
              {showAll ? '收起排行榜' : '展开更多'}
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

export default Leaderboard;
