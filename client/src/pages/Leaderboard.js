import React, { useState } from 'react';
import { useLeetCode, derivePoints } from '../context/LeetCodeContext';

const Leaderboard = () => {
  const [timeFilter, setTimeFilter] = useState('allTime');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { lcData, hasSynced } = useLeetCode();

  const STATIC_BOARD = [
    { rank: 1,   name: 'Sarah Chen',         username: '@sarahchen',   avatar: 'SC', points: 3450, problemsSolved: 156, accuracy: 94.2, streak: 45, change: 'up'   },
    { rank: 2,   name: 'Michael Rodriguez',  username: '@mrodriguez',  avatar: 'MR', points: 3320, problemsSolved: 148, accuracy: 91.8, streak: 32, change: 'up'   },
    { rank: 3,   name: 'Emily Johnson',      username: '@emilyj',      avatar: 'EJ', points: 3180, problemsSolved: 142, accuracy: 89.5, streak: 28, change: 'down' },
    { rank: 4,   name: 'David Kim',          username: '@davidkim',    avatar: 'DK', points: 2950, problemsSolved: 135, accuracy: 87.3, streak: 21, change: 'same' },
    { rank: 5,   name: 'Lisa Wang',          username: '@lisawang',    avatar: 'LW', points: 2890, problemsSolved: 132, accuracy: 85.7, streak: 19, change: 'up'   },
    { rank: 6,   name: 'James Taylor',       username: '@jtaylor',     avatar: 'JT', points: 2760, problemsSolved: 128, accuracy: 83.2, streak: 15, change: 'down' },
    { rank: 7,   name: 'Anna Martinez',      username: '@annam',       avatar: 'AM', points: 2680, problemsSolved: 125, accuracy: 81.9, streak: 12, change: 'up'   },
    { rank: 8,   name: 'Robert Brown',       username: '@rbrown',      avatar: 'RB', points: 2540, problemsSolved: 119, accuracy: 79.8, streak: 10, change: 'same' },
  ];

  // Build the "You" entry from real data if synced, else fallback
  const myPoints   = hasSynced ? derivePoints(lcData) : 1250;
  const myName     = hasSynced ? (lcData.realName || lcData.username) : 'Alex Thompson';
  const myHandle   = hasSynced ? `@${lcData.username}` : '@alexthompson';
  const myAvatar   = hasSynced ? lcData.username.slice(0, 2).toUpperCase() : 'AT';
  const mySolved   = hasSynced ? lcData.totalSolved : 42;
  const myAccuracy = hasSynced ? lcData.acceptance  : 76.5;

  // Calculate approximate rank in static board
  const myRankInBoard = STATIC_BOARD.filter(u => u.points > myPoints).length + 1;

  const me = {
    rank: myRankInBoard > 8 ? (hasSynced && lcData.ranking > 0 ? lcData.ranking : 156) : myRankInBoard,
    name: myName, username: myHandle, avatar: myAvatar,
    points: myPoints, problemsSolved: mySolved, accuracy: myAccuracy,
    streak: 7, change: 'up', isCurrentUser: true,
    avatarUrl: hasSynced ? lcData.avatar : null,
  };

  const leaderboardData = [...STATIC_BOARD, me].sort((a, b) => b.points - a.points)
    .map((u, i) => ({ ...u, displayRank: i + 1 }));




  const getRankIcon = (rank) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
          1
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
          2
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
          3
        </div>
      );
    }
    return (
      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-medium">
        {rank}
      </div>
    );
  };

  const getChangeIcon = (change) => {
    switch (change) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  const timeFilters = ['All Time', 'This Month', 'This Week', 'Today'];
  const categoryFilters = ['All', 'Arrays', 'Strings', 'Trees', 'Dynamic Programming'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-600">See how you rank against other developers</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <div className="flex space-x-2">
              {timeFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter.toLowerCase().replace(' ', ''))}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    timeFilter === filter.toLowerCase().replace(' ', '')
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCategoryFilter(filter.toLowerCase())}
                  className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                    categoryFilter === filter.toLowerCase()
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {leaderboardData.slice(0, 3).map((user, index) => (
          <div
            key={user.rank}
            className={`bg-white rounded-lg shadow-md p-6 text-center ${
              user.rank === 1 ? 'ring-2 ring-yellow-400' : ''
            }`}
          >
            <div className="flex justify-center mb-4">
              {getRankIcon(user.rank)}
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
              {user.avatar}
            </div>
            <h3 className="font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{user.username}</p>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-600">{user.points.toLocaleString()}</div>
              <div className="text-sm text-gray-500">points</div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
              <div>
                <div className="font-medium text-gray-900">{user.problemsSolved}</div>
                <div className="text-gray-500">Solved</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">{user.accuracy}%</div>
                <div className="text-gray-500">Accuracy</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">{user.streak}</div>
                <div className="text-gray-500">Streak</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accuracy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Streak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboardData.map((user) => (
                <tr
                  key={user.rank}
                  className={`hover:bg-gray-50 ${user.isCurrentUser ? 'bg-purple-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankIcon(user.displayRank)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-purple-200" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-medium mr-3">
                          {user.avatar}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.name}
                          {user.isCurrentUser && (
                            <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">You</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-medium text-gray-900">{user.points.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.problemsSolved}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.accuracy}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.streak} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getChangeIcon(user.change)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
