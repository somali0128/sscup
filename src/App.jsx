import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RecentMatches from './components/RecentMatches';
import Leaderboard from './components/Leaderboard';
import PastMatches from './components/PastMatches';
import SearchFunction from './components/SearchFunction';
import About from './components/About';
import Footer from './components/Footer';
import MahjongCupRegistration from './components/MahjongCupRegistration';
import { recentMatches, latestNews, leaderboardData, pastMatches } from './data/mockData';

function HomePage() {
  const location = useLocation();

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
      <RecentMatches matches={recentMatches} news={latestNews} />
      <Leaderboard players={leaderboardData} />
      <PastMatches pastMatches={pastMatches} />
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
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
