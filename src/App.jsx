import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RecentMatches from './components/RecentMatches';
import Leaderboard from './components/Leaderboard';
import PastMatches from './components/PastMatches';
import SearchFunction from './components/SearchFunction';
import About from './components/About';
import Footer from './components/Footer';
import { recentMatches, latestNews, leaderboardData, pastMatches } from './data/mockData';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <RecentMatches matches={recentMatches} news={latestNews} />
      <Leaderboard players={leaderboardData} />
      <PastMatches pastMatches={pastMatches} />
      <SearchFunction />
      <About />
      <Footer />
    </div>
  );
}

export default App;
