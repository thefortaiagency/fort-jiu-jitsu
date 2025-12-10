'use client';

import { useState, useEffect } from 'react';
import type { Class } from '@/lib/supabase';

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: Partial<Class>) => Promise<void>;
  classToEdit?: Class | null;
}

const PROGRAMS = [
  { value: 'kids-bjj', label: 'Kids BJJ' },
  { value: 'adult-bjj', label: 'Adult BJJ' },
  { value: 'beginners', label: 'Beginners' },
  { value: 'junior-hammers', label: 'Junior Hammers' },
  { value: 'big-hammers', label: 'Big Hammers' },
  { value: 'lady-hammers', label: 'Lady Hammers' },
];

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const SKILL_LEVELS = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export default function ClassFormModal({
  isOpen,
  onClose,
  onSave,
  classToEdit,
}: ClassFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    program: '',
    instructor: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    max_capacity: 20,
    age_min: undefined as number | undefined,
    age_max: undefined as number | undefined,
    skill_level: 'all',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (classToEdit) {
      setFormData({
        name: classToEdit.name,
        program: classToEdit.program,
        instructor: classToEdit.instructor,
        day_of_week: classToEdit.day_of_week,
        start_time: classToEdit.start_time,
        end_time: classToEdit.end_time,
        max_capacity: classToEdit.max_capacity,
        age_min: classToEdit.age_min,
        age_max: classToEdit.age_max,
        skill_level: classToEdit.skill_level,
        is_active: classToEdit.is_active,
      });
    } else {
      setFormData({
        name: '',
        program: '',
        instructor: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        max_capacity: 20,
        age_min: undefined,
        age_max: undefined,
        skill_level: 'all',
        is_active: true,
      });
    }
    setErrors({});
  }, [classToEdit, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.program) newErrors.program = 'Program is required';
    if (!formData.instructor.trim()) newErrors.instructor = 'Instructor is required';
    if (!formData.day_of_week) newErrors.day_of_week = 'Day is required';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';
    if (formData.max_capacity < 1) newErrors.max_capacity = 'Must be at least 1';

    // Validate time order
    if (formData.start_time && formData.end_time) {
      if (formData.start_time >= formData.end_time) {
        newErrors.end_time = 'End time must be after start time';
      }
    }

    // Validate age range
    if (formData.age_min !== undefined && formData.age_max !== undefined) {
      if (formData.age_min > formData.age_max) {
        newErrors.age_max = 'Max age must be greater than min age';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave({
        ...formData,
        age_min: formData.age_min || undefined,
        age_max: formData.age_max || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error saving class:', error);
      alert('Failed to save class. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-serif">
            {classToEdit ? 'Edit Class' : 'Add New Class'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Class Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Class Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600 text-white"
              placeholder="e.g., Advanced BJJ"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Program */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Program <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600 text-white"
            >
              <option value="">Select program...</option>
              {PROGRAMS.map((prog) => (
                <option key={prog.value} value={prog.value}>
                  {prog.label}
                </option>
              ))}
            </select>
            {errors.program && (
              <p className="text-red-400 text-sm mt-1">{errors.program}</p>
            )}
          </div>

          {/* Instructor */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Instructor <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.instructor}
              onChange={(e) =>
                setFormData({ ...formData, instructor: e.target.value })
              }
              className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600 text-white"
              placeholder="Instructor name"
            />
            {errors.instructor && (
              <p className="text-red-400 text-sm mt-1">{errors.instructor}</p>
            )}
          </div>

          {/* Day and Times */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Day <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.day_of_week}
                onChange={(e) =>
                  setFormData({ ...formData, day_of_week: e.target.value })
                }
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600 text-white"
              >
                <option value="">Select day...</option>
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              {errors.day_of_week && (
                <p className="text-red-400 text-sm mt-1">{errors.day_of_week}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Start Time <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600 text-white"
              />
              {errors.start_time && (
                <p className="text-red-400 text-sm mt-1">{errors.start_time}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                End Time <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600 text-white"
              />
              {errors.end_time && (
                <p className="text-red-400 text-sm mt-1">{errors.end_time}</p>
              )}
            </div>
          </div>

          {/* Capacity and Skill Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Max Capacity <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_capacity: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600 text-white"
              />
              {errors.max_capacity && (
                <p className="text-red-400 text-sm mt-1">{errors.max_capacity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Skill Level <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.skill_level}
                onChange={(e) =>
                  setFormData({ ...formData, skill_level: e.target.value })
                }
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600 text-white"
              >
                {SKILL_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Age Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Min Age (optional)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.age_min || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    age_min: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600 text-white"
                placeholder="Leave empty for no min"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Max Age (optional)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.age_max || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    age_max: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:outline-none focus:border-gray-600 text-white"
                placeholder="Leave empty for no max"
              />
              {errors.age_max && (
                <p className="text-red-400 text-sm mt-1">{errors.age_max}</p>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="w-4 h-4 bg-black border border-gray-800 rounded focus:ring-2 focus:ring-gray-600"
            />
            <label htmlFor="is_active" className="text-sm">
              Class is active and visible to members
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? 'Saving...' : classToEdit ? 'Update Class' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
