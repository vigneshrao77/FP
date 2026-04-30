import React, { useState } from 'react';
import { useLeetCode, derivePoints, deriveSkillGaps, deriveRecommendations } from '../context/LeetCodeContext';
import { Link } from 'react-router-dom';
import AIAssistant from '../components/AIAssistant';


const LC_URL = (slug) => `https://leetcode.com/problems/${slug}/`;

const Recommendations = () => {

  const { lcData, hasSynced } = useLeetCode();
  const [refreshKey, setRefreshKey] = useState(0);

  const recommendations = deriveRecommendations(lcData);
  // give each recommendation a LeetCode slug
  const SLUGS = {
    'Two Sum':                                       'two-sum',
    'Valid Parentheses':                             'valid-parentheses',
    'Climbing Stairs':                               'climbing-stairs',
    'Binary Tree Level Order Traversal':             'binary-tree-level-order-traversal',
    'Longest Substring Without Repeating Characters':'longest-substring-without-repeating-characters',
    'Coin Change':                                   'coin-change',
    'Merge k Sorted Lists':                          'merge-k-sorted-lists',
    'Trapping Rain Water':                           'trapping-rain-water',
  };
  const skillGaps       = hasSynced ? deriveSkillGaps(lcData) : [
    { category: 'Dynamic Programming', progress: 25, color: 'bg-red-500' },
    { category: 'Trees',               progress: 60, color: 'bg-yellow-500' },
    { category: 'Graph Algorithms',    progress: 15, color: 'bg-red-500' },
    { category: 'String Manipulation', progress: 75, color: 'bg-green-500' },
    { category: 'Arrays',              progress: 90, color: 'bg-green-500' },
    { category: 'Linked Lists',        progress: 70, color: 'bg-yellow-500' },
  ];

  // Dynamic learning path based on solved counts
  const learningPath = [
    { step: 1, title: 'Solve your first problem',               completed: lcData.totalSolved >= 1   },
    { step: 2, title: 'Solve 10 Easy problems',                 completed: lcData.easy >= 10          },
    { step: 3, title: 'Attempt Medium problems (solve 10)',     completed: lcData.medium >= 10        },
    { step: 4, title: 'Reach 80% acceptance rate',             completed: lcData.acceptance >= 80    },
    { step: 5, title: 'Solve your first Hard problem',         completed: lcData.hard >= 1           },
    { step: 6, title: 'Solve 100 problems total',              completed: lcData.totalSolved >= 100  },
  ];

  const getDifficultyColor = (d) =>
    d === 'Easy' ? 'difficulty-easy' : d === 'Medium' ? 'difficulty-medium' : 'difficulty-hard';

  const getMatchColor = (p) => p >= 80 ? 'bg-green-500' : p >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommendations</h1>
        <p className="text-gray-600">
          {hasSynced
            ? `Personalized for ${lcData.username} · ${lcData.totalSolved} solved · ${lcData.acceptance}% acceptance`
            : 'Personalized problems based on your performance and goals'}
        </p>
      </div>

      {/* Sync CTA if not connected */}
      {!hasSynced && (
        <div className="mb-6 border-2 border-dashed border-orange-300 rounded-xl p-4 flex items-center justify-between bg-orange-50">
          <p className="text-sm text-orange-700 font-medium">
            🔗 Sync your LeetCode profile to get personalized recommendations based on your actual weak areas
          </p>
          <Link to="/profile" className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition">
            Sync Now
          </Link>
        </div>
      )}

      {/* Learning Path */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Learning Path</h2>
        <div className="space-y-3">
          {learningPath.map((step) => (
            <div key={step.step} className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}>
                {step.completed ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.step}
              </div>
              <div className={`flex-1 ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                <span className={step.completed ? 'font-medium' : ''}>{step.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Gaps */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Skill Analysis {hasSynced && <span className="text-sm font-normal text-orange-600 ml-2">(from LeetCode)</span>}
        </h2>
        <div className="space-y-4">
          {skillGaps.map((skill) => (
            <div key={skill.category}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{skill.category}</span>
                <span className="text-sm text-gray-500">{skill.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${skill.color} h-2 rounded-full transition-all duration-700`} style={{ width: `${skill.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Mentor Section */}
      <AIAssistant />

      {/* Recommended Problems */}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recommended Problems
            {hasSynced && <span className="ml-2 text-sm font-normal text-gray-500">sorted by your weakness</span>}
          </h2>
          <button onClick={() => setRefreshKey(k => k + 1)} className="text-purple-600 hover:text-purple-800 font-medium text-sm">
            Refresh Recommendations
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendations.map((problem) => (
            <div key={`${problem.id}-${refreshKey}`} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{problem.title}</h3>
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(problem.difficulty)}`}>{problem.difficulty}</span>
                    <span className="text-sm text-gray-500">{problem.category}</span>
                    <span className="text-sm text-gray-500">~{problem.estimatedTime}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{problem.reason}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {problem.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="ml-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{problem.matchPercentage}%</div>
                  <div className="text-xs text-gray-500">Match</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className={`${getMatchColor(problem.matchPercentage)} h-2 rounded-full`} style={{ width: `${problem.matchPercentage}%` }} />
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-purple-600">{problem.points}</span> points
                </div>
                <a
                  href={LC_URL(SLUGS[problem.title] || problem.title.toLowerCase().replace(/ /g, '-'))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/></svg>
                  Solve on LeetCode
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {hasSynced && lcData.hard === 0 && (
            <li className="flex items-start">
              <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Try your first Hard problem — it unlocks new problem-solving patterns
            </li>
          )}
          {hasSynced && lcData.acceptance < 60 && (
            <li className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Your acceptance rate is {lcData.acceptance}% — focus on understanding problems before submitting
            </li>
          )}
          <li className="flex items-start">
            <svg className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {hasSynced ? `You've solved ${lcData.medium} Medium problems — keep going to master patterns!` : 'Try medium difficulty problems to challenge yourself appropriately'}
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Practice consistently every day to build problem-solving intuition
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Recommendations;
