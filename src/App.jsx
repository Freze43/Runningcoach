import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Training from './components/Training';
import Progress from './components/Progress';
import TrainingPlans from './components/TrainingPlans';
import SocialFeed from './components/SocialFeed';
import GearTracker from './components/GearTracker';
import CoachingAI from './components/CoachingAI';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';

import { 
  INITIAL_USER, 
  SEEDED_RUNS, 
  MOCK_ACTIVITIES, 
  getScheduleForProgram,
  getProgressMetricsForUser,
  getAnnualVolumeForUser
} from './data/mockData';

export default function App() {
  // 1. Current Active Session User
  const [user, setUser] = useState(() => {
    const active = localStorage.getItem('user_active');
    return active ? JSON.parse(active) : null;
  });

  // 2. User-specific database states
  const [runs, setRuns] = useState([]);
  const [shoes, setShoes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [feed, setFeed] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dynamic sports science calculations
  const [progressMetrics, setProgressMetrics] = useState([]);
  const [annualVolume, setAnnualVolume] = useState([]);

  // 3. Reactive database loader listening to active user login state
  useEffect(() => {
    if (user && user.email) {
      const emailKey = user.email.toLowerCase();

      // --- RUNS LOAD ---
      const savedRuns = localStorage.getItem(`runs_${emailKey}`);
      if (savedRuns) {
        setRuns(JSON.parse(savedRuns));
      } else {
        const initialRuns = emailKey === 'rio@run.com' ? SEEDED_RUNS : [];
        setRuns(initialRuns);
        localStorage.setItem(`runs_${emailKey}`, JSON.stringify(initialRuns));
      }

      // --- SHOES LOAD ---
      const savedShoes = localStorage.getItem(`shoes_${emailKey}`);
      if (savedShoes) {
        setShoes(JSON.parse(savedShoes));
      } else {
        const initialShoes = emailKey === 'rio@run.com' ? INITIAL_USER.shoes : [];
        setShoes(initialShoes);
        localStorage.setItem(`shoes_${emailKey}`, JSON.stringify(initialShoes));
      }

      // --- SCHEDULES LOAD ---
      const savedSchedules = localStorage.getItem(`schedules_${emailKey}`);
      if (savedSchedules) {
        setSchedules(JSON.parse(savedSchedules));
      } else {
        if (emailKey === 'rio@run.com') {
          const initialSchedules = getScheduleForProgram('10k', 'intermediate', 3);
          setSchedules(initialSchedules);
          localStorage.setItem(`schedules_${emailKey}`, JSON.stringify(initialSchedules));
        } else {
          setSchedules([]);
          localStorage.setItem(`schedules_${emailKey}`, JSON.stringify([]));
        }
      }

      // --- GLOBAL FEED LOAD ---
      const savedFeed = localStorage.getItem('global_feed');
      if (savedFeed) {
        setFeed(JSON.parse(savedFeed));
      } else {
        setFeed(MOCK_ACTIVITIES);
        localStorage.setItem('global_feed', JSON.stringify(MOCK_ACTIVITIES));
      }

    } else {
      setRuns([]);
      setShoes([]);
      setSchedules([]);
      setProgressMetrics([]);
      setAnnualVolume([]);
    }
  }, [user]);

  // 4. Update computed sports-science analytics whenever runs or user updates
  useEffect(() => {
    if (user && user.email) {
      const metrics = getProgressMetricsForUser(user.email, runs, user.level);
      const volume = getAnnualVolumeForUser(user.email, runs);
      setProgressMetrics(metrics);
      setAnnualVolume(volume);
    }
  }, [runs, user]);

  // 5. Persistence writers when user-specific data updates
  useEffect(() => {
    if (user && user.email) {
      const emailKey = user.email.toLowerCase();
      localStorage.setItem(`runs_${emailKey}`, JSON.stringify(runs));
    }
  }, [runs, user]);

  useEffect(() => {
    if (user && user.email) {
      const emailKey = user.email.toLowerCase();
      localStorage.setItem(`shoes_${emailKey}`, JSON.stringify(shoes));
    }
  }, [shoes, user]);

  useEffect(() => {
    if (user && user.email) {
      const emailKey = user.email.toLowerCase();
      localStorage.setItem(`schedules_${emailKey}`, JSON.stringify(schedules));
    }
  }, [schedules, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('global_feed', JSON.stringify(feed));
    }
  }, [feed, user]);

  // Enrollment & Resets coordinated at parent level to avoid reactive loader overwrites!
  const enrollUserInProgram = (programId) => {
    if (!user || !user.email) return;
    const emailKey = user.email.toLowerCase();
    
    const updatedUser = { ...user, activeProgramId: programId, currentWeek: 1 };
    const newSched = getScheduleForProgram(programId, user.level, 1);
    
    // Write directly to local storage so reactive loader mounts it instantly
    localStorage.setItem(`schedules_${emailKey}`, JSON.stringify(newSched));
    localStorage.setItem('user_active', JSON.stringify(updatedUser));
    
    setSchedules(newSched);
    setUser(updatedUser);
  };

  const resetUserProgram = () => {
    if (!user || !user.email) return;
    const emailKey = user.email.toLowerCase();
    
    const updatedUser = { ...user, activeProgramId: null, currentWeek: 1 };
    
    localStorage.setItem(`schedules_${emailKey}`, JSON.stringify([]));
    localStorage.setItem('user_active', JSON.stringify(updatedUser));
    
    setSchedules([]);
    setUser(updatedUser);
  };

  // Auth Action Handlers
  const handleLoginSuccess = (loggedInUser) => {
    localStorage.setItem('user_active', JSON.stringify(loggedInUser));
    
    const emailKey = loggedInUser.email.toLowerCase();
    const updatedMembersList = localStorage.getItem('admin_members');
    if (updatedMembersList) {
      const members = JSON.parse(updatedMembersList);
      const match = members.find(m => m.email.toLowerCase() === emailKey);
      if (match) {
        loggedInUser.level = match.level;
        loggedInUser.name = match.name;
      }
    }

    setUser(loggedInUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user_active');
    setActiveTab('dashboard');
  };

  const handleSetUserAndSync = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user_active', JSON.stringify(updatedUser));

    // Also update in admin list if matches
    const updatedMembersList = localStorage.getItem('admin_members');
    if (updatedMembersList) {
      const members = JSON.parse(updatedMembersList);
      const emailKey = updatedUser.email.toLowerCase();
      const updatedMembers = members.map(m => {
        if (m.email.toLowerCase() === emailKey) {
          return { 
            ...m, 
            name: updatedUser.name, 
            level: updatedUser.level, 
            vo2max: updatedUser.vo2maxHistory[updatedUser.vo2maxHistory.length - 1]?.value || 0.0 
          };
        }
        return m;
      });
      localStorage.setItem('admin_members', JSON.stringify(updatedMembers));
    }
  };

  const addActivityFeed = (newFeedItem) => {
    const updatedFeed = [newFeedItem, ...feed];
    setFeed(updatedFeed);
    localStorage.setItem('global_feed', JSON.stringify(updatedFeed));
  };

  // Render sub-panel view
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard runs={runs} user={user} progressMetrics={progressMetrics} />;
      case 'training':
        return <Training runs={runs} annualVolume={annualVolume} />;
      case 'progress':
        return <Progress progressMetrics={progressMetrics} user={user} />;
      case 'plans':
        return (
          <TrainingPlans 
            user={user} 
            setUser={handleSetUserAndSync} 
            runs={runs} 
            setRuns={setRuns} 
            schedules={schedules} 
            setSchedules={setSchedules}
            addActivityFeed={addActivityFeed}
            enrollUserInProgram={enrollUserInProgram}
            resetUserProgram={resetUserProgram}
          />
        );
      case 'coaching':
        return <CoachingAI user={user} runs={runs} />;
      case 'social':
        return <SocialFeed user={user} feed={feed} setFeed={setFeed} />;
      case 'gear':
        return <GearTracker shoes={shoes} setShoes={setShoes} user={user} setUser={handleSetUserAndSync} />;
      case 'admin':
        return <AdminPanel user={user} setUser={handleSetUserAndSync} />;
      default:
        return <Dashboard runs={runs} user={user} progressMetrics={progressMetrics} />;
    }
  };

  // Render AuthModal if session user is empty
  if (!user) {
    return <AuthModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-full w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header Row */}
        <Header 
          activeTab={activeTab} 
          user={user} 
          shoes={shoes} 
        />

        {/* Dynamic Inner Tab View */}
        <main className="flex-1 overflow-hidden flex flex-col relative">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
