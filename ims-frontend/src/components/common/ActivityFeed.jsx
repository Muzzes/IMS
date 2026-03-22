import React from 'react';

export default function ActivityFeed({ activities = [] }) {
  if (activities.length === 0) {
    return <div className="text-center text-sm text-gray-500 py-4">No recent activity</div>;
  }
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, itemIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {itemIdx !== activities.length - 1 ? (
                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${activity.bgColor}`}>
                    <activity.icon className="h-4 w-4 text-white" aria-hidden="true" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.content}{' '}
                      <span className="font-medium text-gray-900 dark:text-gray-200">{activity.target}</span>
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={activity.datetime}>{activity.date}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
