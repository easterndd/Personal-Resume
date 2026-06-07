import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Button } from '../common/Button'
import { SortableSkillItem } from './SortableSkillItem'
import type { ResumeSkill } from '../../types'

interface SortableSkillsProps {
  skills: ResumeSkill[]
  onSkillsChange: (skills: ResumeSkill[]) => void
  onToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void
}

export const SortableSkills: React.FC<SortableSkillsProps> = ({ skills, onSkillsChange, onToast }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().split('-')[1])
      const newIndex = parseInt(over.id.toString().split('-')[1])
      const newSkills = arrayMove(skills, oldIndex, newIndex)
      onSkillsChange(newSkills)
      onToast('success', '技能顺序已更新')
    }
  }

  const handleUpdateCategory = (index: number, category: string) => {
    const newSkills = [...skills]
    newSkills[index] = { ...newSkills[index], category }
    onSkillsChange(newSkills)
  }

  const handleUpdateItems = (index: number, items: string[]) => {
    const newSkills = [...skills]
    newSkills[index] = { ...newSkills[index], items }
    onSkillsChange(newSkills)
  }

  const handleDelete = (index: number) => {
    if (skills.length <= 1) {
      onToast('warning', '至少保留一个技能分类')
      return
    }
    const newSkills = skills.filter((_, i) => i !== index)
    onSkillsChange(newSkills)
    onToast('success', '技能分类已删除')
  }

  const handleAdd = () => {
    onSkillsChange([...skills, { category: '', items: [] }])
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={skills.map((_, i) => `skill-${i}`)} strategy={verticalListSortingStrategy}>
          {skills.map((skill, index) => (
            <SortableSkillItem
              key={`skill-item-${index}`}
              skill={skill}
              index={index}
              onUpdateCategory={handleUpdateCategory}
              onUpdateItems={handleUpdateItems}
              onDelete={handleDelete}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button onClick={handleAdd} variant="secondary" size="small">
        <Plus size={16} />
        添加技能分类
      </Button>
    </div>
  )
}
