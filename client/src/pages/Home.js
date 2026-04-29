import React from 'react';
import { Link } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import ProgressChart from '../components/ProgressChart';
import { useLeetCode, derivePoints, deriveLevel } from '../context/LeetCodeContext';

const Home = () => {
  const { lcData, hasSynced } = useLeetCode();

  const totalPoints = hasSynced ? derivePoints(lcData) : 1250;
  const level       = hasSynced ? deriveLevel(lcData)  : 'Intermediate';

  const stats = hasSynced
    ? [
        { label: 'Problems Solved', value: String(lcData.totalSolved),                   change: '+5',  icon: 'check'  },
        { label: 'Easy Solved',     value: String(lcData.easy),                           change: '+2',  icon: 'fire'   },
        { label: 'LC Rank',         value: lcData.ranking > 0 ? `#${lcData.ranking.toLocaleString()}` : 'N/A', change: '—', icon: 'trophy' },
        { label: 'Points',          value: totalPoints.toLocaleString(),                  change: '+150',icon: 'star'   },
      ]
    : [
        { label: 'Problems Solved', value: '42',    change: '+5',  icon: 'check'  },
        { label: 'Current Streak',  value: '7 days',change: '+2',  icon: 'fire'   },
        { label: 'Rank',            value: '#156',  change: '+12', icon: 'trophy' },
        { label: 'Points',          value: '1,250', change: '+150',icon: 'star'   },
      ];

  const recentProblems = [
    { id: 1, title: 'Two Sum',                        slug: 'two-sum',                        difficulty: 'Easy',   status: 'solved',    time: '2 hours ago' },
    { id: 2, title: 'Binary Tree Traversal',          slug: 'binary-tree-inorder-traversal',  difficulty: 'Medium', status: 'attempted', time: '5 hours ago' },
    { id: 3, title: 'Dynamic Programming - Knapsack', slug: 'coin-change',                    difficulty: 'Hard',   status: 'unsolved',  time: '1 day ago'   },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {hasSynced
            ? `Welcome back, ${lcData.realName || lcData.username}!`
            : 'Welcome back!'}
        </h1>
        <p className="text-gray-600">
          {hasSynced
            ? `${level} · ${lcData.totalSolved} problems solved on LeetCode`
            : 'Ready to continue your coding journey?'}
        </p>
      </div>

      {/* LeetCode synced banner */}
      {hasSynced && (
        <div className="mb-6 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-xl p-4 shadow-md text-white flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.112-.661 1.824-.661s1.357.194 1.824.661l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.536.553-1.387.038-1.9l-2.609-2.519c-.756-.756-1.787-1.184-2.85-1.184s-2.094.428-2.85 1.184L5.76 11.16c-.756.756-1.185 1.787-1.185 2.85s.429 2.094 1.185 2.85l4.319 4.363c.756.756 1.787 1.184 2.85 1.184s2.094-.428 2.85-1.184l2.609-2.519c.515-.514.497-1.365-.038-1.9-.535-.535-1.386-.553-1.248.038z"/>
            </svg>
            LeetCode: {lcData.username}
          </div>
          <div className="flex gap-3 text-sm font-semibold flex-wrap">
            <span className="bg-white/20 px-3 py-1 rounded-full">🟢 Easy: {lcData.easy}</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">🟡 Medium: {lcData.medium}</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">🔴 Hard: {lcData.hard}</span>
            <span className="bg-white/30 px-3 py-1 rounded-full font-bold">Total: {lcData.totalSolved}</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">✅ {lcData.acceptance}% acceptance</span>
          </div>
          <Link to="/profile" className="ml-auto text-xs underline opacity-80 hover:opacity-100">Update →</Link>
        </div>
      )}

      {/* Not synced CTA */}
      {!hasSynced && (
        <div className="mb-6 border-2 border-dashed border-orange-300 rounded-xl p-4 flex items-center justify-between bg-orange-50">
          <p className="text-sm text-orange-700 font-medium">
            🔗 Connect your LeetCode profile to see real stats everywhere
          </p>
          <Link
            to="/profile"
            className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition"
          >
            Sync Now
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentProblems.map((problem) => (
                <div key={problem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      problem.status === 'solved'    ? 'bg-green-500' :
                      problem.status === 'attempted' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <h3 className="font-medium text-gray-900">{problem.title}</h3>
                      <p className="text-sm text-gray-500">{problem.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      problem.difficulty === 'Easy'   ? 'difficulty-easy'   :
                      problem.difficulty === 'Medium' ? 'difficulty-medium' : 'difficulty-hard'
                    }`}>
                      {problem.difficulty}
                    </span>
                    <a
                      href={`https://leetcode.com/problems/${problem.slug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-800 font-medium text-sm flex items-center gap-1"
                    >
                      {problem.status === 'solved' ? 'Review' : 'Solve'}
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/></svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <ProgressChart />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/problems" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-semibold">Browse Problems</h3>
            <p className="text-sm opacity-90">Challenge yourself with new problems</p>
          </div>
        </Link>

        <Link to="/leaderboard" className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:border-purple-500 hover:shadow-lg transition-all">
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">View Leaderboard</h3>
            <p className="text-sm text-gray-600">See how you rank against others</p>
          </div>
        </Link>

        <Link to="/recommendations" className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:border-orange-400 hover:shadow-lg transition-all">
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Get Recommendations</h3>
            <p className="text-sm text-gray-600">Personalized suggestions for you</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Home;
