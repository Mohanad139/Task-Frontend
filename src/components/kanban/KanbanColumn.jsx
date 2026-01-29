import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '../../utils/cn';
import { STATUS } from '../../utils/constants';

const columnStyles = {
  todo: 'border-t-gray-400',
  in_progress: 'border-t-amber-400',
  done: 'border-t-emerald-400',
  blocked: 'border-t-red-400',
};

export function KanbanColumn({ id, children, tasks = [] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const config = STATUS[id] || STATUS.todo;

  return (
    <div
      className={cn(
        'flex flex-col bg-gray-50 rounded-lg border-t-2',
        columnStyles[id],
        isOver && 'bg-gray-100'
      )}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{config.label}</span>
          <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-medium text-gray-500 bg-white rounded-full border border-gray-200">
            {tasks.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 px-2 pb-2 space-y-2 min-h-[200px]',
          'transition-colors duration-150'
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>
    </div>
  );
}
