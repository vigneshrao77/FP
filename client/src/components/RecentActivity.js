import React from 'react';

const RecentActivity = () => {
  const activities = [
    { id: 1, type: 'solved', problem: 'Two Sum', time: '2 hours ago', points: '+10' },
    { id: 2, type: 'attempted', problem: 'Binary Tree Traversal', time: '5 hours ago', points: '+5' },
    { id: 3, type: 'achievement', title: '7 Day Streak!', time: '1 day ago', points: '+50' },
    { id: 4, type: 'solved', problem: 'Array Rotation', time: '2 days ago', points: '+15' },
  ];

  const getActivityIcon = (type) => {
    const icons = {
      solved: (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      attempted: (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      achievement: (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    };
    return icons[type];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {activity.type === 'achievement' ? activity.title : `Solved: ${activity.problem}`}
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
            <div className="text-sm font-medium text-green-600">
              {activity.points}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
