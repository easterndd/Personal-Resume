import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, GripVertical } from 'lucide-react'
import { Field } from '../editor/Field'
import type { ResumeSkill } from '../../types'

interface SortableSkillItemProps {
  skill: ResumeSkill
  index: number
  onUpdateCategory: (index: number, category: string) => void
  onUpdateItems: (index: number, items: string[]) => void
  onDelete: (index: number) => void
  disabled?: boolean
}

export const SortableSkillItem: React.FC<SortableSkillItemProps> = ({
  skill,
  index,
  onUpdateCategory,
  onUpdateItems,
  onDelete,
  disabled = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `skill-${index}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-slate-200 rounded-lg p-4 bg-white"
    >
      <div className="flex items-center gap-2 mb-3">
        <button
          {...attributes}
          {...listeners}
          className={`p-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-colors ${
            isDragging ? 'text-blue-500 bg-blue-50' : 'text-slate-400 hover:text-slate-500 hover:bg-slate-50'
          }`}
          disabled={disabled}
        >
          <GripVertical size={16} />
        </button>
        <span className="text-slate-600 text-sm font-medium">技能分类 {index + 1}</span>
        {!disabled && (
          <button
            onClick={() => onDelete(index)}
            className="ml-auto p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <Field label="技能分类">
        <input
          className="h-10 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none"
          value={skill.category}
          onChange={(e) => onUpdateCategory(index, e.target.value)}
        />
      </Field>
      <Field label="技能列表">
        <textarea
          className="min-h-[112px] p-3 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none resize-y leading-[1.65]"
          placeholder="每行一个技能，支持多条"
          value={skill.items.join('\n')}
          onChange={(e) => onUpdateItems(index, e.target.value.split('\n').filter(Boolean))}
        />
      </Field>
    </div>
  )
}
