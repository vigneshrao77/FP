import React, { useState } from 'react';
import { useLeetCode, derivePoints, deriveLevel } from '../context/LeetCodeContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const PROGRESS_MOCK = [
  { month: 'Jan', problems: 8,  points: 120 },
  { month: 'Feb', problems: 12, points: 280 },
  { month: 'Mar', problems: 10, points: 250 },
  { month: 'Apr', problems: 12, points: 350 },
];

const ACHIEVEMENTS_TEMPLATES = [
  { id: 1, title: 'First Problem',    description: 'Solved your first problem',  icon: 'star',     threshold: (lc) => lc.totalSolved >= 1   },
  { id: 2, title: 'Week Warrior',     description: '7+ problems solved',          icon: 'fire',     threshold: (lc) => lc.totalSolved >= 7   },
  { id: 3, title: 'Problem Solver',   description: 'Solved 25 problems',          icon: 'trophy',   threshold: (lc) => lc.totalSolved >= 25  },
  { id: 4, title: 'Accuracy Master',  description: '80% acceptance rate',         icon: 'target',   threshold: (lc) => lc.acceptance >= 80   },
  { id: 5, title: 'Century Club',     description: 'Solved 100 problems',         icon: 'calendar', threshold: (lc) => lc.totalSolved >= 100 },
  { id: 6, title: 'Elite Solver',     description: 'Solved 500 problems',         icon: 'crown',    threshold: (lc) => lc.totalSolved >= 500 },
];

const ICONS = {
  star:     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  fire:     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>,
  trophy:   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  target:   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  calendar: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  crown:    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
};

const DiffPill = ({ label, count, color }) => (
  <div className={`flex flex-col items-center px-4 py-3 rounded-xl border-2 ${color}`}>
    <span className="text-2xl font-bold">{count}</span>
    <span className="text-xs font-semibold mt-0.5 uppercase tracking-wider">{label}</span>
  </div>
);

const Profile = () => {
  const { lcData, hasSynced, syncing, syncMsg, syncProfile, clearProfile } = useLeetCode();
  const [lcUsername, setLcUsername] = useState('');

  const totalPoints   = hasSynced ? derivePoints(lcData) : 1250;
  const level         = hasSynced ? deriveLevel(lcData)  : 'Intermediate';
  const nextThreshold = level === 'Beginner' ? 500 : level === 'Junior' ? 1500 : level === 'Intermediate' ? 3000 : level === 'Advanced' ? 5000 : 9999;

  const achievements = ACHIEVEMENTS_TEMPLATES.map(a => ({ ...a, earned: hasSynced ? a.threshold(lcData) : false }));

  const categoryData = hasSynced
    ? [
        { category: 'Easy',   solved: lcData.easy   },
        { category: 'Medium', solved: lcData.medium  },
        { category: 'Hard',   solved: lcData.hard    },
      ]
    : [
        { category: 'Arrays', solved: 15 }, { category: 'Strings', solved: 8 },
        { category: 'Trees',  solved: 6  }, { category: 'DP',       solved: 4 },
      ];

  const handleSync = async () => {
    await syncProfile(lcUsername);
    setLcUsername('');
  };

  const displayName   = hasSynced ? (lcData.realName || lcData.username) : 'Alex Thompson';
  const displayHandle = hasSynced ? `@${lcData.username}` : '@alexthompson';
  const displayRank   = hasSynced && lcData.ranking > 0 ? lcData.ranking : 156;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Track your progress and achievements</p>
      </div>

      {/* ── LeetCode Sync Card ───────────────────────────── */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.112-.661 1.824-.661s1.357.194 1.824.661l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.536.553-1.387.038-1.9l-2.609-2.519c-.756-.756-1.787-1.184-2.85-1.184s-2.094.428-2.85 1.184L5.76 11.16c-.756.756-1.185 1.787-1.185 2.85s.429 2.094 1.185 2.85l4.319 4.363c.756.756 1.787 1.184 2.85 1.184s2.094-.428 2.85-1.184l2.609-2.519c.515-.514.497-1.365-.038-1.9-.535-.535-1.386-.553-1.248.038z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Sync from LeetCode</h2>
            <p className="text-sm text-gray-500">Updates all stats across the whole website instantly</p>
          </div>
          {hasSynced && (
            <div className="ml-auto flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                ✅ Synced: {lcData.username}
              </span>
              <button onClick={clearProfile} className="text-xs text-red-500 hover:text-red-700 underline">
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          <input
            id="lc-username-input"
            type="text"
            value={lcUsername}
            onChange={e => setLcUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSync()}
            placeholder="Enter LeetCode username (e.g. neal_wu)"
            className="flex-1 min-w-0 px-4 py-2.5 border-2 border-orange-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-white transition"
          />
          <button
            id="lc-sync-btn"
            onClick={handleSync}
            disabled={syncing}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition flex items-center gap-2 shadow"
          >
            {syncing ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Syncing…</>
            ) : '🔄 Sync Profile'}
          </button>
        </div>

        {syncMsg && (
          <div className={`mt-3 px-4 py-2.5 rounded-lg text-sm font-medium ${syncMsg.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {syncMsg.text}
          </div>
        )}

        {hasSynced && (
          <div className="mt-5 border-t border-orange-200 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">LeetCode Breakdown</p>
            <div className="flex gap-3 flex-wrap">
              <DiffPill label="Easy"       count={lcData.easy}              color="border-green-200 bg-green-50 text-green-700" />
              <DiffPill label="Medium"     count={lcData.medium}            color="border-yellow-200 bg-yellow-50 text-yellow-700" />
              <DiffPill label="Hard"       count={lcData.hard}              color="border-red-200 bg-red-50 text-red-700" />
              <DiffPill label="Total"      count={lcData.totalSolved}       color="border-purple-200 bg-purple-50 text-purple-700" />
              <DiffPill label="Acceptance" count={`${lcData.acceptance}%`}  color="border-blue-200 bg-blue-50 text-blue-700" />
              {lcData.ranking > 0 && <DiffPill label="LC Rank" count={`#${lcData.ranking.toLocaleString()}`} color="border-gray-200 bg-gray-50 text-gray-700" />}
            </div>
            {lcData.lastSynced && <p className="text-xs text-gray-400 mt-2">Last synced: {new Date(lcData.lastSynced).toLocaleString()}</p>}
          </div>
        )}
      </div>

      {/* Profile Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-6">
          {lcData.avatar ? (
            <img src={lcData.avatar} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-purple-200" />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-3xl">
              {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
            <p className="text-gray-500 mb-2">{displayHandle}</p>
            <div className="flex items-center space-x-6 text-sm flex-wrap gap-y-1">
              <span className="text-gray-600">Rank #{displayRank.toLocaleString()}</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">{level}</span>
              {hasSynced && (
                <a href={`https://leetcode.com/${lcData.username}`} target="_blank" rel="noopener noreferrer"
                  className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full font-medium text-xs hover:bg-orange-200 transition">
                  🔗 LC: {lcData.username}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Points',     val: totalPoints.toLocaleString(), sub: `${Math.max(0, nextThreshold - totalPoints).toLocaleString()} to next level`, icon: 'text-purple-600', svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /> },
          { label: 'Problems Solved',  val: hasSynced ? lcData.totalSolved : 42, sub: hasSynced ? `${lcData.easy}E · ${lcData.medium}M · ${lcData.hard}H` : 'Total completed', icon: 'text-green-600',  svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
          { label: 'Acceptance Rate',  val: `${hasSynced ? lcData.acceptance : 76.5}%`, sub: 'Success rate', icon: 'text-blue-600', svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
          { label: 'Global Rank',      val: hasSynced && lcData.ranking > 0 ? `#${lcData.ranking.toLocaleString()}` : '#156', sub: 'LeetCode ranking', icon: 'text-orange-600', svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /> },
        ].map(({ label, val, sub, icon, svg }) => (
          <div key={label} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{label}</span>
              <svg className={`w-5 h-5 ${icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{svg}</svg>
            </div>
            <div className="text-2xl font-bold text-gray-900">{val}</div>
            <div className="text-sm text-gray-500">{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Progress</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PROGRESS_MOCK}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
                <Line type="monotone" dataKey="problems" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
                <Line type="monotone" dataKey="points"   stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {hasSynced ? 'LeetCode Difficulty Breakdown' : 'Category Progress'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
                <Bar dataKey="solved" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Achievements</h3>
        {hasSynced && <p className="text-xs text-gray-500 mb-4">Based on your real LeetCode stats</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((a) => (
            <div key={a.id} className={`p-4 rounded-lg border-2 ${a.earned ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
              <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 ${a.earned ? 'text-purple-600' : 'text-gray-400'}`}>{ICONS[a.icon]}</div>
                <div>
                  <h4 className="font-medium text-gray-900">{a.title}</h4>
                  <p className="text-sm text-gray-500">{a.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
