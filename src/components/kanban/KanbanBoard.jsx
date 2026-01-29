import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { STATUS_ORDER } from '../../utils/constants';

export function KanbanBoard({
  tasks,
  assigneesByTask = {},
  onStatusChange,
  onEdit,
  onDelete,
  onAssign,
  onComment,
}) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tasksByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status);
    return acc;
  }, {});

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id;
    let newStatus = null;

    if (STATUS_ORDER.includes(overId)) {
      newStatus = overId;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (newStatus && activeTask.status !== newStatus) {
      onStatusChange?.(activeTask.id, newStatus);
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id;
    let targetStatus = null;

    if (STATUS_ORDER.includes(overId)) {
      targetStatus = overId;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (targetStatus && activeTask.status !== targetStatus) {
      onStatusChange?.(activeTask.id, targetStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUS_ORDER.map((status) => (
          <KanbanColumn key={status} id={status} tasks={tasksByStatus[status]}>
            {tasksByStatus[status].map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                assignees={assigneesByTask[task.id] || []}
                onEdit={onEdit}
                onDelete={onDelete}
                onAssign={onAssign}
                onComment={onComment}
              />
            ))}
          </KanbanColumn>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 shadow-lifted">
            <KanbanCard
              task={activeTask}
              assignees={assigneesByTask[activeTask.id] || []}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
