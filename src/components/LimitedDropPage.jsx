import { useEffect, useState } from 'react';

const productImages = [
  { src: '/limited-drop/product-01.svg', alt: '惊喜角色盲盒包装正面展示' },
  { src: '/limited-drop/product-02.svg', alt: '盲盒六款常规角色阵容' },
  { src: '/limited-drop/product-03.svg', alt: '神秘隐藏款角色剪影' },
  { src: '/limited-drop/product-04.svg', alt: '盲盒公仔尺寸与细节展示' },
  { src: '/limited-drop/product-05.svg', alt: '盲盒整盒包装展示' },
];

const productDetails = [
  ['系列款式', '6 款常规款 + 1 款隐藏款'],
  ['单盒内容', '随机角色公仔 × 1、角色卡 × 1'],
  ['公仔尺寸', '高度约 70–85 mm'],
  ['商品材质', '粘土'],
  ['隐藏概率', '常规系列中约 1 : 72'],
  ['售后说明', '盲盒拆封后非质量问题不支持退换'],
];

function ChevronIcon({ direction }) {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 6 6 6-6 6'} />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M6 8h12l1 12H5L6 8Zm3 1V6a3 3 0 016 0v3" />
    </svg>
  );
}

function LimitedDropPage() {
  const [activeImage, setActiveImage] = useState(0);
  const [activePanel, setActivePanel] = useState('details');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = '好友礼盒之：樾哥&毛毛系列';
    return () => { document.title = '好友礼盒'; };
  }, []);

  const selectPrevious = () => setActiveImage((current) => (current - 1 + productImages.length) % productImages.length);
  const selectNext = () => setActiveImage((current) => (current + 1) % productImages.length);

  return (
    <div className="min-h-screen bg-[#fff7cf] font-[Arial,'Helvetica_Neue',sans-serif] text-[#27304d]">
      <div className="border-b-2 border-[#27304d] bg-[#ff6f91] px-4 py-2.5 text-center text-[11px] font-black tracking-[0.16em] text-white">
        ✦ 限定惊喜掉落 · 全部售罄啦 · 感谢大家喜欢 ✦
      </div>

      <header className="border-b-2 border-[#27304d] bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-end px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-[0.18em]">
            <span className="hidden text-[#637092] sm:inline">Series 01 · Mystery friends</span>
            <span className="flex items-center gap-2 rounded-full bg-[#ffdb69] px-3 py-2"><BagIcon /> 购物袋 (0)</span>
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[minmax(0,1.12fr)_minmax(25rem,0.88fr)]">
          <section className="border-b-2 border-[#27304d] lg:border-b-0 lg:border-r-2" aria-label="商品图片">
            <div className="relative aspect-[4/4.5] overflow-hidden bg-[#bfeef7] sm:aspect-[4/3.7] lg:sticky lg:top-0 lg:aspect-auto lg:h-[calc(100vh-7rem)] lg:min-h-[44rem]">
              {productImages.map((image, index) => (
                <img
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  aria-hidden={index !== activeImage}
                  className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${index === activeImage ? 'scale-100 opacity-100' : 'pointer-events-none scale-[1.02] opacity-0'}`}
                />
              ))}

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-[#27304d]/40 to-transparent p-5 pt-24 text-white sm:p-8">
                <span className="rounded-full border-2 border-[#27304d] bg-white px-3 py-1.5 font-mono text-xs font-black text-[#27304d] shadow-[2px_2px_0_#27304d]">{String(activeImage + 1).padStart(2, '0')} / {String(productImages.length).padStart(2, '0')}</span>
                <div className="flex gap-2">
                  <button type="button" aria-label="上一张商品图片" onClick={selectPrevious} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#27304d] bg-white text-[#27304d] shadow-[3px_3px_0_#27304d] transition hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><ChevronIcon direction="left" /></button>
                  <button type="button" aria-label="下一张商品图片" onClick={selectNext} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#27304d] bg-[#ffdb69] text-[#27304d] shadow-[3px_3px_0_#27304d] transition hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><ChevronIcon direction="right" /></button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 border-t-2 border-[#27304d] bg-white">
              {productImages.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  aria-label={`查看第 ${index + 1} 张商品图片`}
                  aria-current={index === activeImage ? 'true' : undefined}
                  onClick={() => setActiveImage(index)}
                  className={`relative aspect-square overflow-hidden border-r-2 border-[#27304d] last:border-r-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-black ${index === activeImage ? 'opacity-100' : 'opacity-55 hover:opacity-85'}`}
                >
                  <img src={image.src} alt="" className="h-full w-full object-cover" />
                  {index === activeImage && <span className="absolute inset-x-0 bottom-0 h-2 bg-[#ff6f91]" />}
                </button>
              ))}
            </div>
          </section>

          <section className="px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
            <div className="mx-auto max-w-xl">
              <div className="flex items-center justify-between gap-5 border-b-2 border-[#27304d]/15 pb-5">
                <span className="rotate-[-2deg] rounded-full border-2 border-[#27304d] bg-[#ff8eb0] px-3 py-1.5 text-[10px] font-black tracking-[0.15em] text-white shadow-[2px_2px_0_#27304d]">限量定制</span>
                <span className="font-mono text-[10px] tracking-[0.16em] text-[#637092]">SKU YM-BLIND-001</span>
              </div>

              <h1 className="mt-9 text-[clamp(2.7rem,5vw,4.8rem)] font-black leading-[0.98] tracking-[-0.06em] text-[#27304d]">
                好友礼盒之：<br /><span className="text-[#ff5f88]">樾哥&amp;毛毛系列</span>
              </h1>
              <p className="mt-5 text-sm font-black tracking-[0.12em] text-[#637092]">第一弹</p>

              <div className="mt-10 flex items-end justify-between border-y border-black/15 py-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">Final price</p>
                  <p className="mt-2 text-3xl font-black tracking-tight">￥ 399.90</p>
                </div>
                <span className="rotate-2 rounded-full border-2 border-[#27304d] bg-[#ffdb69] px-4 py-2 text-xs font-black tracking-[0.12em] shadow-[3px_3px_0_#27304d]">售罄啦!</span>
              </div>

              <p className="mt-8 text-sm leading-7 text-black/65">
                谁躲在盒子里？拆开才知道！樾哥和毛毛带着各自的小道具前来集合，还有一位神秘隐藏朋友悄悄混在其中。每盒都是随机惊喜，本系列售完不补。
              </p>

              <div className="mt-8 rounded-3xl border-2 border-[#27304d] bg-[#bdeff7] p-5 shadow-[5px_5px_0_#27304d]">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold">库存状态</span>
                  <span className="font-mono font-black text-[#f04470]">0 / 1</span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full border-2 border-[#27304d] bg-white"><div className="h-full w-full bg-[#ff6f91]" /></div>
                <p className="mt-3 text-xs font-bold leading-5 text-[#637092]">唯一一个惊喜已经找到主人啦，不接受追加预订。</p>
              </div>

              <button type="button" disabled className="mt-6 flex min-h-14 w-full cursor-not-allowed items-center justify-center rounded-full border-2 border-[#27304d] bg-[#9da6b9] px-6 text-sm font-black tracking-[0.16em] text-white shadow-[5px_5px_0_#27304d]">
                呜呜，已经卖光啦
              </button>
              <button type="button" disabled className="mt-3 min-h-12 w-full cursor-not-allowed border border-black/20 px-6 text-xs font-bold uppercase tracking-[0.16em] text-black/35">
                到货通知已关闭
              </button>

              <div className="mt-10 border-t border-black/15">
                <div className="flex border-b border-black/15" role="tablist" aria-label="商品信息">
                  {[
                    ['details', '商品详情'],
                    ['contents', '礼盒内容'],
                    ['delivery', '配送说明'],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={activePanel === id}
                      onClick={() => setActivePanel(id)}
                      className={`flex-1 border-b-2 px-2 py-4 text-xs font-black tracking-[0.08em] transition ${activePanel === id ? 'border-black text-black' : 'border-transparent text-black/40 hover:text-black/70'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="py-7 text-sm leading-7 text-black/65" role="tabpanel">
                  {activePanel === 'details' && (
                    <dl className="divide-y divide-black/10 border-y border-black/10">
                      {productDetails.map(([label, value]) => (
                        <div key={label} className="grid grid-cols-[7rem_1fr] gap-4 py-3.5">
                          <dt className="font-bold text-black/45">{label}</dt>
                          <dd className="text-black/75">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {activePanel === 'contents' && (
                    <ul className="list-inside list-[square] space-y-2">
                      <li>随机角色公仔 × 1</li>
                      <li>对应角色收藏卡 × 1</li>
                      <li>惊喜贴纸 × 1</li>
                      <li>密封防拆盲盒包装 × 1</li>
                      <li>抽中隐藏款时将替代一款常规角色</li>
                    </ul>
                  )}
                  {activePanel === 'delivery' && (
                    <div className="space-y-4">
                      <p>默认使用可追踪快递配送。偏远地区、港澳台及海外运费另行计算。</p>
                      <p>盲盒款式随机发放，无法指定。因显示器色差、涂装工艺产生的轻微差异不属于质量问题。</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-black/15 pt-7">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/45">Accepted payment</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['支付宝', '微信支付', '银联', 'Visa', 'Mastercard'].map((method) => (
                    <span key={method} className="border border-black/20 bg-white/40 px-3 py-2 text-xs font-bold text-black/55">{method}</span>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-black/40">商品已售罄，付款渠道当前不可用。展示信息仅供活动存档。</p>
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
