import { cn } from '../../utils/cn';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full px-3 py-2 text-sm',
        'bg-white border border-gray-200 rounded-lg',
        'placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent',
        'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
        'transition-shadow duration-150',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 text-sm',
        'bg-white border border-gray-200 rounded-lg',
        'placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent',
        'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
        'transition-shadow duration-150',
        'resize-none',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'w-full px-3 py-2 text-sm',
        'bg-white border border-gray-200 rounded-lg',
        'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent',
        'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
        'transition-shadow duration-150',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
