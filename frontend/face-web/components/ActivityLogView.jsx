import React from 'react';
import ActivityItem from './ActivityItem';
import { History, Folder, Loader2 } from 'lucide-react';

const ActivityLogView = ({ activityLog, loadingActivity }) => (
  <div className="max-w-4xl mx-auto">
    <div className="bg-gray-800/60 rounded-2xl p-6">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <History size={24} /> Activity History
        {loadingActivity && <Loader2 size={20} className="animate-spin ml-2" />}
      </h3>
      
      {activityLog.length > 0 ? (
        <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
          {activityLog.map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          {loadingActivity ? (
            <div className="flex flex-col items-center">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p>Loading activities...</p>
            </div>
          ) : (
            <>
              <Folder size={48} className="mx-auto text-gray-500 mb-4" />
              <h4 className="text-xl font-medium">No activity yet</h4>
              <p className="text-gray-400 mt-2">
                Your upload and access activities will appear here
              </p>
            </>
          )}
        </div>
      )}
    </div>
  </div>
);

export default ActivityLogView;