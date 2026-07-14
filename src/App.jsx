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

const API_BASE_URL = import.meta.env.VITE_SOMA_API_URL || 'https://api.sticksoma.art';

function HomePage() {
  const location = useLocation();
  const [clubData, setClubData] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/sscup`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`API returned ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        setClubData(payload.data);
        setLoadError(false);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setLoadError(true);
      });
    return () => controller.abort();
  }, []);

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
      <Hero />
      {!clubData && !loadError && (
        <div className="py-16 text-center text-gray-500" role="status">正在加载俱乐部数据…</div>
      )}
      {loadError && (
        <div className="mx-auto my-12 max-w-3xl rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-center text-red-700" role="alert">
          俱乐部数据暂时无法加载，请稍后刷新页面。
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

function App() {
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

export default App;
