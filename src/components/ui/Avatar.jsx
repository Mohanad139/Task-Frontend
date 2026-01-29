import { cn } from '../../utils/cn';

const sizes = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
  xl: 'h-12 w-12 text-lg',
};

const colors = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];

function getColorFromName(name) {
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Avatar({ name, size = 'md', className }) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        sizes[size],
        getColorFromName(name || ''),
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

export function AvatarGroup({ names = [], max = 3, size = 'sm' }) {
  const visible = names.slice(0, max);
  const remaining = names.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((name, i) => (
        <Avatar
          key={i}
          name={name}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'inline-flex items-center justify-center rounded-full font-medium',
            'bg-gray-100 text-gray-600 ring-2 ring-white',
            sizes[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
