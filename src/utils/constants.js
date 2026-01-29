export const STATUS = {
  todo: { label: 'To Do', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'In Progress', color: 'bg-amber-50 text-amber-700' },
  done: { label: 'Done', color: 'bg-emerald-50 text-emerald-700' },
  blocked: { label: 'Blocked', color: 'bg-red-50 text-red-700' },
};

export const PRIORITY = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', color: 'bg-blue-50 text-blue-700' },
  high: { label: 'High', color: 'bg-orange-50 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-50 text-red-700' },
};

export const ROLE = {
  owner: { label: 'Owner', color: 'bg-purple-50 text-purple-700' },
  admin: { label: 'Admin', color: 'bg-blue-50 text-blue-700' },
  member: { label: 'Member', color: 'bg-gray-100 text-gray-700' },
};

export const STATUS_ORDER = ['todo', 'in_progress', 'done', 'blocked'];
