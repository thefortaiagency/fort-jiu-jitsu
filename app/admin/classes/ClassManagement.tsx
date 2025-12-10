'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-auth';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { Class } from '@/lib/supabase';
import ClassFormModal from './ClassFormModal';

interface ClassManagementProps {
  user: User;
}

type ViewMode = 'weekly' | 'list';

const DAYS_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const PROGRAMS = [
  { value: 'kids-bjj', label: 'Kids BJJ' },
  { value: 'adult-bjj', label: 'Adult BJJ' },
  { value: 'beginners', label: 'Beginners' },
  { value: 'junior-hammers', label: 'Junior Hammers' },
  { value: 'big-hammers', label: 'Big Hammers' },
  { value: 'lady-hammers', label: 'Lady Hammers' },
];

export default function ClassManagement({ user }: ClassManagementProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [stats, setStats] = useState({
    totalClasses: 0,
    activeClasses: 0,
    classesByProgram: {} as Record<string, number>,
  });

  const fetchClasses = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    let query = supabase.from('classes').select('*').order('day_of_week', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching classes:', error);
      return;
    }

    const sortedData = (data || []).sort((a, b) => {
      const dayDiff =
        DAYS_ORDER.indexOf(a.day_of_week) - DAYS_ORDER.indexOf(b.day_of_week);
      if (dayDiff !== 0) return dayDiff;
      return a.start_time.localeCompare(b.start_time);
    });

    setClasses(sortedData);

    // Calculate stats
    const activeClasses = sortedData.filter((c) => c.is_active).length;
    const byProgram: Record<string, number> = {};
    sortedData.forEach((c) => {
      byProgram[c.program] = (byProgram[c.program] || 0) + 1;
    });

    setStats({
      totalClasses: sortedData.length,
      activeClasses,
      classesByProgram: byProgram,
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const handleCreateClass = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const handleEditClass = (classItem: Class) => {
    setEditingClass(classItem);
    setIsModalOpen(true);
  };

  const handleSaveClass = async (classData: Partial<Class>) => {
    const supabase = createBrowserSupabaseClient();

    if (editingClass) {
      // Update existing class
      const { error } = await supabase
        .from('classes')
        .update({
          ...classData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingClass.id);

      if (error) {
        console.error('Error updating class:', error);
        throw error;
      }
    } else {
      // Create new class
      const { error } = await supabase.from('classes').insert([
        {
          ...classData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Error creating class:', error);
        throw error;
      }
    }

    await fetchClasses();
    setIsModalOpen(false);
    setEditingClass(null);
  };

  const handleToggleActive = async (classItem: Class) => {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from('classes')
      .update({
        is_active: !classItem.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', classItem.id);

    if (error) {
      console.error('Error toggling class status:', error);
      alert('Failed to update class status');
      return;
    }

    await fetchClasses();
  };

  const handleDeleteClass = async (classItem: Class) => {
    if (
      !confirm(
        `Are you sure you want to delete "${classItem.name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from('classes').delete().eq('id', classItem.id);

    if (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class');
      return;
    }

    await fetchClasses();
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getClassesByDay = (day: string) => {
    return classes.filter(
      (c) =>
        c.day_of_week === day &&
        (filterProgram === 'all' || c.program === filterProgram)
    );
  };

  const filteredClasses =
    filterProgram === 'all'
      ? classes
      : classes.filter((c) => c.program === filterProgram);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-serif">THE FORT</h1>
              <p className="text-gray-400 text-sm">Class Schedule Management</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 text-sm border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Back to Dashboard
              </button>
              <span className="text-gray-400 text-sm">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Total Classes</p>
            <p className="text-3xl font-bold">{stats.totalClasses}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">Active Classes</p>
            <p className="text-3xl font-bold text-green-400">{stats.activeClasses}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Classes by Program</p>
            <div className="space-y-1">
              {Object.entries(stats.classesByProgram).map(([program, count]) => (
                <div key={program} className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    {PROGRAMS.find((p) => p.value === program)?.label || program}:
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('weekly')}
                  className={`px-4 py-2 text-sm transition-colors ${
                    viewMode === 'weekly'
                      ? 'bg-white text-black'
                      : 'bg-transparent hover:bg-gray-800'
                  }`}
                >
                  Weekly View
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-black'
                      : 'bg-transparent hover:bg-gray-800'
                  }`}
                >
                  List View
                </button>
              </div>

              {/* Program Filter */}
              <select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                className="px-4 py-2 bg-black border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-gray-600"
              >
                <option value="all">All Programs</option>
                {PROGRAMS.map((prog) => (
                  <option key={prog.value} value={prog.value}>
                    {prog.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreateClass}
              className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              + Add Class
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-400">Loading classes...</div>
          </div>
        ) : viewMode === 'weekly' ? (
          // Weekly View
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-x-auto">
            <div className="grid grid-cols-7 min-w-[1200px]">
              {/* Day Headers */}
              {DAYS_ORDER.map((day) => (
                <div
                  key={day}
                  className="bg-gray-800 border-b border-gray-700 p-4 text-center font-medium"
                >
                  {day}
                </div>
              ))}

              {/* Day Columns */}
              {DAYS_ORDER.map((day) => {
                const dayClasses = getClassesByDay(day);
                return (
                  <div
                    key={day}
                    className="border-r border-gray-800 last:border-r-0 min-h-[400px] p-2 space-y-2"
                  >
                    {dayClasses.length === 0 ? (
                      <div className="text-gray-600 text-sm text-center py-4">
                        No classes
                      </div>
                    ) : (
                      dayClasses.map((classItem) => (
                        <div
                          key={classItem.id}
                          className={`bg-black border rounded-lg p-3 cursor-pointer hover:border-gray-600 transition-colors ${
                            classItem.is_active
                              ? 'border-gray-700'
                              : 'border-gray-800 opacity-50'
                          }`}
                          onClick={() => handleEditClass(classItem)}
                        >
                          <div className="font-medium text-sm mb-1">
                            {classItem.name}
                          </div>
                          <div className="text-xs text-gray-400 mb-2">
                            {formatTime(classItem.start_time)} -{' '}
                            {formatTime(classItem.end_time)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {classItem.instructor}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-800 rounded">
                              {
                                PROGRAMS.find((p) => p.value === classItem.program)
                                  ?.label
                              }
                            </span>
                            {!classItem.is_active && (
                              <span className="text-xs text-red-400">Inactive</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // List View
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 border-b border-gray-700">
                  <th className="text-left p-4 font-medium">Class Name</th>
                  <th className="text-left p-4 font-medium">Program</th>
                  <th className="text-left p-4 font-medium">Instructor</th>
                  <th className="text-left p-4 font-medium">Day</th>
                  <th className="text-left p-4 font-medium">Time</th>
                  <th className="text-left p-4 font-medium">Capacity</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      No classes found. Create your first class to get started.
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map((classItem) => (
                    <tr
                      key={classItem.id}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-medium">{classItem.name}</div>
                        {classItem.skill_level !== 'all' && (
                          <div className="text-xs text-gray-400 mt-1">
                            {classItem.skill_level}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        {PROGRAMS.find((p) => p.value === classItem.program)?.label}
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {classItem.instructor}
                      </td>
                      <td className="p-4 text-sm">{classItem.day_of_week}</td>
                      <td className="p-4 text-sm">
                        {formatTime(classItem.start_time)} -{' '}
                        {formatTime(classItem.end_time)}
                      </td>
                      <td className="p-4 text-sm">{classItem.max_capacity}</td>
                      <td className="p-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(classItem);
                          }}
                          className={`text-xs px-3 py-1 rounded-full ${
                            classItem.is_active
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}
                        >
                          {classItem.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClass(classItem)}
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClass(classItem)}
                            className="text-sm text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal */}
      <ClassFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClass(null);
        }}
        onSave={handleSaveClass}
        classToEdit={editingClass}
      />
    </div>
  );
}
