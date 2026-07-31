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
  (import.meta.env.DEV ? '' : 'https://soma-api-one.vercel.app');
const CLUB_DATA_TIMEOUT_MS = 12_000;

function HomePage() {
  const location = useLocation();
  const [clubData, setClubData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let isCurrentRequest = true;
    let didTimeout = false;
    const timeoutId = window.setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, CLUB_DATA_TIMEOUT_MS);

    async function loadClubData() {
      setIsLoading(true);
      setLoadError('');

      try {
        const response = await fetch(`${API_BASE_URL}/api/sscup`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!response.ok) throw new Error(`API returned ${response.status}`);
        const payload = await response.json();

        if (!payload?.data || typeof payload.data !== 'object') {
          throw new Error('API returned invalid club data');
        }

        if (isCurrentRequest) setClubData(payload.data);
      } catch {
        if (isCurrentRequest) {
          setLoadError(
            didTimeout
              ? '俱乐部数据请求超时，请稍后重试。'
              : '俱乐部数据暂时无法加载，请稍后重试。',
          );
        }
      } finally {
        if (isCurrentRequest) setIsLoading(false);
        window.clearTimeout(timeoutId);
      }
    }

    loadClubData();

    return () => {
      isCurrentRequest = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [reloadKey]);

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
        isLoading={isLoading}
      />
      {isLoading && (
        <div className="py-16 text-center text-gray-500" role="status">正在加载俱乐部数据…</div>
      )}
      {loadError && (
        <div className="mx-auto my-12 max-w-3xl rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-center text-red-700" role="alert">
          <p>{loadError}</p>
          <button
            type="button"
            className="mt-3 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={() => setReloadKey((key) => key + 1)}
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
