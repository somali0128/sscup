import { Routes, Route } from 'react-router-dom';
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
