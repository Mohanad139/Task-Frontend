import { cn } from '../../utils/cn';
import { STATUS, PRIORITY, ROLE } from '../../utils/constants';

export function Badge({ children, className, variant = 'default' }) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  return (
    <span className={cn(baseClasses, className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const config = STATUS[status] || STATUS.todo;
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }) {
  const config = PRIORITY[priority] || PRIORITY.medium;
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
}

export function RoleBadge({ role }) {
  const config = ROLE[role] || ROLE.member;
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  );
}
