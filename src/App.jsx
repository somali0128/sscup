import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RecentMatches from './components/RecentMatches';
import Leaderboard from './components/Leaderboard';
import PastMatches from './components/PastMatches';
import SearchFunction from './components/SearchFunction';
import About from './components/About';
import Footer from './components/Footer';
import MahjongCupRegistration from './components/MahjongCupRegistration';
import StreetFighterRegistration from './components/StreetFighterRegistration';
import LimitedDropPage from './components/LimitedDropPage';

const API_BASE_URL = import.meta.env.VITE_SOMA_API_URL ||
  (import.meta.env.DEV ? '' : 'https://api.sticksoma.art');
const API_TIMEOUT_MS = 10_000;

const isClubData = (value) => value &&
  Array.isArray(value.players) &&
  Array.isArray(value.news) &&
  Array.isArray(value.recentMatches) &&
  Array.isArray(value.pastMatches);

function HomePage() {
  const location = useLocation();
  const [clubData, setClubData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort('timeout'), API_TIMEOUT_MS);

    fetch(`${API_BASE_URL}/api/sscup`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`API returned ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        if (!isClubData(payload?.data)) throw new Error('API returned invalid club data');
        setClubData(payload.data);
      })
      .catch(() => {
        if (controller.signal.reason === 'unmount') return;
        setLoadError(controller.signal.reason === 'timeout' ? 'timeout' : 'request');
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort('unmount');
    };
  }, [requestVersion]);

  useEffect(() => {
    // 处理从其他页面跳转过来带 hash 的情况
    const hash = location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const navbarHeight = 64; // h-16 = 64px
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - navbarHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [location.hash, location.pathname]);

  return (
    <>
      <Hero
        matches={clubData?.pastMatches}
        isLoading={!clubData && !loadError}
      />
      {!clubData && !loadError && (
        <div className="py-16 text-center text-gray-500" role="status">正在加载俱乐部数据…</div>
      )}
      {loadError && (
        <div className="mx-auto my-12 max-w-3xl rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-center text-red-700" role="alert">
          <p>{loadError === 'timeout' ? '俱乐部数据请求超时，请稍后重试。' : '俱乐部数据暂时无法加载，请稍后重试。'}</p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-red-600 px-5 py-2 font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={() => {
              setLoadError(null);
              setRequestVersion((version) => version + 1);
            }}
          >
            重新加载
          </button>
        </div>
      )}
      {clubData && (
        <>
          <RecentMatches matches={clubData.recentMatches} news={clubData.news} />
          <Leaderboard players={clubData.players} />
          <PastMatches pastMatches={clubData.pastMatches} />
        </>
      )}
      {/* <SearchFunction /> */}
      <About />
    </>
  );
}

function MainSite() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mahjong-cup-registration" element={<MahjongCupRegistration />} />
        <Route path="/sf6-registration" element={<StreetFighterRegistration />} />
      </Routes>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/event/limited-drop" element={<LimitedDropPage />} />
      <Route path="*" element={<MainSite />} />
    </Routes>
  );
}

export default App;
