import React, { useState } from 'react';
import { 
  Upload, Files, FolderPlus, Trash2, ArrowRight, 
  LogIn, UserPlus, Database, FileText, ChevronDown, ChevronUp 
} from 'lucide-react';

const ActivityItem = ({ activity }) => {
  const formattedDate = new Date(activity.timestamp).toLocaleString();
  const [expanded, setExpanded] = useState(false);

  const getActionDetails = () => {
    switch(activity.action) {
      case 'file_upload': return { icon: <Upload size={16} />, title: 'Files Uploaded', color: 'bg-blue-900/30', files: activity.details.files };
      case 'vault_access': return { icon: <Files size={16} />, title: 'Vault Accessed', color: 'bg-green-900/30', path: activity.details.path };
      case 'folder_created': return { icon: <FolderPlus size={16} />, title: 'Folder Created', color: 'bg-purple-900/30', name: activity.details.folder_name };
      case 'file_deleted': return { icon: <Trash2 size={16} />, title: 'File Deleted', color: 'bg-red-900/30', name: activity.details.filename };
      case 'folder_deleted': return { icon: <FolderPlus size={16} />, title: 'Folder Deleted', color: 'bg-orange-900/30', name: activity.details.folder_name };
      case 'file_download': return { icon: <ArrowRight size={16} />, title: 'File Downloaded', color: 'bg-teal-900/30', name: activity.details.filename };
      case 'multi_download': return { icon: <Files size={16} />, title: 'Multiple Files Downloaded', color: 'bg-indigo-900/30', count: activity.details.count };
      case 'login': return { icon: <LogIn size={16} />, title: 'User Login', color: 'bg-teal-900/30' };
      case 'account_created': return { icon: <UserPlus size={16} />, title: 'Account Created', color: 'bg-indigo-900/30' };
      case 'storage_cleaned': return { icon: <Database size={16} />, title: 'Storage Cleaned', color: 'bg-blue-900/30' };
      case 'storage_upgraded': return { icon: <Database size={16} />, title: 'Storage Upgraded', color: 'bg-green-900/30', newLimit: activity.details.newLimit };
      default: return { icon: <Database size={16} />, title: 'System Activity', color: 'bg-gray-700' };
    }
  };

  const details = getActionDetails();

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 mb-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${details.color}`}>{details.icon}</div>
          <div>
            <h4 className="font-medium">{details.title}</h4>
            <p className="text-xs text-gray-400">{formattedDate}</p>
          </div>
        </div>
        {details.files && (
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-white">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        )}
      </div>
      
      {expanded && details.files && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <h5 className="text-sm font-medium mb-2">Uploaded Files:</h5>
          <ul className="space-y-1">
            {details.files.map((file, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm">
                <FileText size={14} className="text-gray-400" />
                <span className="truncate max-w-[200px]">{file.name}</span>
                <span className="text-gray-500 text-xs ml-auto">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {details.name && !expanded && (
        <div className="mt-2 text-sm text-gray-300">{details.name}</div>
      )}

      {details.path && !expanded && (
        <div className="mt-2 text-sm text-gray-300">Path: {details.path || 'Root'}</div>
      )}

      {details.count && !expanded && (
        <div className="mt-2 text-sm text-gray-300">Files: {details.count}</div>
      )}

      {details.newLimit && (
        <div className="mt-2 text-sm text-gray-300">New Limit: {details.newLimit} MB</div>
      )}
    </div>
  );
};

export default ActivityItem;