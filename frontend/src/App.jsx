import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Backtesting from './pages/BackTesting';
import Research from './pages/Research';
import Risk from './pages/Risk';
import MarketIntelligence from './pages/MarketIntelligence';
import TradeLog from './pages/TradeLog';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="backtesting" element={<Backtesting />} />
          <Route path="research" element={<Research />} />
          <Route path="risk" element={<Risk />} />
          <Route path="intelligence" element={<MarketIntelligence />} />
          <Route path="trades" element={<TradeLog />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;