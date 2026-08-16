import { useEffect } from 'react';

const productDetails = [
  ['系列款式', '6 款常规款'],
  ['单盒内容', '随机角色公仔 × 1、角色卡 × 1'],
  ['公仔尺寸', '80 × 80 × 120 mm'],
  ['商品材质', '粘土'],
];

function LimitedDropPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = '百变毛毛系列';
    return () => { document.title = '好友礼盒'; };
  }, []);

  return (
    <div className="blind-box-font min-h-screen bg-[#fff7cf] text-[#27304d]">
      <header className="select-none border-b border-black/10 bg-white px-3 pt-3 font-sans text-black sm:px-5 sm:pt-5 lg:px-8 lg:pt-8" aria-label="SO MART 装饰导航">
        <div className="relative mx-auto flex h-[3.75rem] max-w-[1920px] items-center justify-between px-3 sm:h-16 sm:px-6">
          <div className="flex w-10 items-center sm:w-56">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black px-2 text-xs text-black/60 sm:w-40 sm:justify-between sm:px-3">
              <span className="hidden truncate sm:inline">百变毛毛系列</span>
              <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="6.5" />
                <path strokeLinecap="round" d="m16 16 4 4" />
              </svg>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 bg-[#d90027] px-1.5 py-1 text-lg font-black leading-none tracking-[-0.08em] text-white sm:text-2xl">
            SO MART
          </div>

          <div className="flex w-24 items-center justify-end gap-3 sm:w-56 sm:gap-5" aria-hidden="true">
            <svg className="hidden h-5 w-5 sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16a4 4 0 1 1 1.9-7.5A5.5 5.5 0 0 1 20 11.5c0 1.2-.4 2.2-1.1 3.1M6 17.5h.01M12 18.5h.01M18 17.5h.01" /></svg>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="4" /><path strokeLinecap="round" d="M4.5 20c.8-4 3.3-6 7.5-6s6.7 2 7.5 6" /></svg>
            <svg className="hidden h-5 w-5 sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path strokeLinecap="round" strokeLinejoin="round" d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.5 4.5 0 0 1 12 7.2a4.5 4.5 0 0 1 8.8 1.5Z" /></svg>
            <div className="relative">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14l1.2 11H3.8L5 8ZM8 8V6a4 4 0 0 1 8 0v2" /></svg>
              <span className="absolute -right-2 -top-2 text-[10px] text-[#d90027]">0</span>
            </div>
          </div>
        </div>

        <div className="border-t border-black/10">
          <nav className="mx-auto flex h-11 max-w-[1060px] items-center justify-center gap-4 overflow-hidden whitespace-nowrap px-3 text-[10px] font-medium sm:h-12 sm:gap-8 sm:px-4 sm:text-[11px]" aria-hidden="true">
            <span>NEW &amp; FEATURED⌄</span>
            <span>CHARACTERS⌄</span>
            <span className="hidden md:inline">🛹 BACK TO SCHOOL</span>
            <span>POP NOW</span>
            <span className="hidden sm:inline">CATEGORIES⌄</span>
            <span className="hidden sm:inline">COLLABS⌄</span>
            <span className="hidden lg:inline">MEGA⌄</span>
            <span className="hidden md:inline">STORE PICKUP</span>
            <span className="hidden md:inline">ABOUT US⌄</span>
          </nav>
        </div>
      </header>

      <main className="px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto grid max-w-[1440px] overflow-hidden bg-[#fff7cf] lg:grid-cols-[minmax(0,1.12fr)_minmax(25rem,0.88fr)]">
          <section className="border-b-2 border-[#27304d] lg:border-b-0 lg:border-r-2" aria-label="商品图片">
            <div className="relative aspect-square overflow-hidden bg-[#f8ecd0] p-2 sm:p-3 lg:aspect-[4/4.2] lg:p-4">
              <img src="/limited-drop/maomao-series.png" alt="百变毛毛系列六款常规款集合" className="h-full w-full object-contain" />
            </div>
          </section>

          <section className="px-4 py-7 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
            <div className="mx-auto max-w-xl">
              <div className="flex items-center justify-between gap-5 border-b-2 border-[#27304d]/15 pb-5">
                <span className="rotate-[-2deg] rounded-full border-2 border-[#27304d] bg-[#ff8eb0] px-3 py-1.5 text-[10px] font-black tracking-[0.15em] text-white shadow-[2px_2px_0_#27304d]">限量定制</span>
                <span className="font-mono text-[10px] tracking-[0.16em] text-[#637092]">SKU YM-BLIND-001</span>
              </div>

              <h1 className="mt-9 text-[clamp(2.2rem,4.2vw,3.8rem)] font-black leading-[1.12] tracking-[-0.03em] text-[#27304d]">
                好友礼盒之：<br /><span className="text-[#ff5f88]">百变毛毛系列</span>
              </h1>
              <p className="mt-5 text-sm font-black tracking-[0.12em] text-[#637092]">第一弹</p>

              <div className="mt-10 flex items-end justify-between border-y border-black/15 py-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">Collection status</p>
                  <p className="mt-2 text-3xl font-black tracking-tight">非卖品</p>
                </div>
                <span className="rotate-2 rounded-full border-2 border-[#27304d] bg-[#ffdb69] px-4 py-2 text-xs font-black tracking-[0.12em] shadow-[3px_3px_0_#27304d]">限定定制</span>
              </div>

              <p className="mt-8 text-sm leading-7 text-black/65">
                百变毛毛系列收录六款常规造型，每一款都带着不同的小道具与生活灵感。这是一份为朋友特别制作的限定礼盒。
              </p>

              <div className="mt-8 rounded-3xl border-2 border-[#27304d] bg-[#bdeff7] p-5 shadow-[5px_5px_0_#27304d]">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold">作品状态</span>
                  <span className="font-mono font-black text-[#f04470]">限定定制</span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full border-2 border-[#27304d] bg-white"><div className="h-full w-full bg-[#ff6f91]" /></div>
                <p className="mt-3 text-xs font-bold leading-5 text-[#637092]">本页面仅作作品展示，不提供购买或预订。</p>
              </div>

              <button type="button" disabled className="mt-6 flex min-h-14 w-full cursor-not-allowed items-center justify-center rounded-full border-2 border-[#27304d] bg-[#9da6b9] px-6 text-sm font-black tracking-[0.16em] text-white shadow-[5px_5px_0_#27304d]">
                非卖品 · 仅供展示
              </button>

              <div className="mt-10 border-t border-black/15">
                <p className="py-4 text-[10px] font-black uppercase tracking-[0.18em] text-black/45">作品信息</p>
                <div className="pb-7 text-sm leading-7 text-black/65">
                  <dl className="divide-y divide-black/10 border-y border-black/10">
                    {productDetails.map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[7rem_1fr] gap-4 py-3.5">
                        <dt className="font-bold text-black/45">{label}</dt>
                        <dd className="text-black/75">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t-2 border-[#27304d] bg-[#79ddf2] px-5 py-8 text-[#27304d] sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 text-[10px] font-bold uppercase tracking-[0.18em] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 好友礼盒</span>
          <span className="text-[#637092]">今天也要开心拆盒!</span>
        </div>
      </footer>
    </div>
  );
}

export default LimitedDropPage;
