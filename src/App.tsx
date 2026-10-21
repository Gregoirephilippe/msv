import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import AccountSection from './components/AccountSection';
import SavingsSection from './components/SavingsSection';
import InvestmentSection from './components/InvestmentSection';
import TravelSection from './components/TravelSection';
import BankSwitchSection from './components/BankSwitchSection';
import FAQ from './components/FAQ';
import ArticlesSection from './components/ArticlesSection';
import Footer from './components/Footer';
import Registration from './pages/Registration';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import AdminLoginPage from './pages/AdminLogin';
import { BANK_CONFIG } from './config/constants';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main>
        <Hero />
        <AccountSection />
        <SavingsSection />
        <InvestmentSection />
        <TravelSection />
        <BankSwitchSection />
        <FAQ />
        <ArticlesSection />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  // Update document title
  React.useEffect(() => {
    document.title = `${BANK_CONFIG.name} - ${BANK_CONFIG.tagline}`;
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/inscription" element={<Registration />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;