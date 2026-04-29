import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useLeetCode } from '../context/LeetCodeContext';

const WEEKLY_MOCK = [
  { day: 'Mon', problems: 2, points: 20 },
  { day: 'Tue', problems: 3, points: 35 },
  { day: 'Wed', problems: 1, points: 15 },
  { day: 'Thu', problems: 4, points: 50 },
  { day: 'Fri', problems: 2, points: 25 },
  { day: 'Sat', problems: 5, points: 75 },
  { day: 'Sun', problems: 3, points: 40 },
];

const DIFF_COLORS = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' };

const ProgressChart = () => {
  const { lcData, hasSynced } = useLeetCode();

  const diffData = hasSynced
    ? [
        { name: 'Easy',   value: lcData.easy,   color: DIFF_COLORS.Easy   },
        { name: 'Medium', value: lcData.medium,  color: DIFF_COLORS.Medium },
        { name: 'Hard',   value: lcData.hard,    color: DIFF_COLORS.Hard   },
      ]
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Weekly Line Chart */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Progress</h2>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={WEEKLY_MOCK}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
            <Line type="monotone" dataKey="problems" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} name="Problems Solved" />
            <Line type="monotone" dataKey="points"   stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} name="Points Earned" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full" />
          <span className="text-sm text-gray-600">Problems Solved</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-sm text-gray-600">Points Earned</span>
        </div>
      </div>

      {/* LeetCode difficulty bar chart (only when synced) */}
      {hasSynced && diffData && (
        <div className="mt-6 border-t border-gray-100 pt-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            LeetCode Difficulty Split
            <span className="ml-2 text-xs font-normal text-orange-600">({lcData.totalSolved} total)</span>
          </h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diffData} barSize={40}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
                <Bar dataKey="value" name="Solved" radius={[4, 4, 0, 0]}>
                  {diffData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressChart;
