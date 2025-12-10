'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, ExternalLink } from 'lucide-react';

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  link?: string;
  linkText?: string;
}

interface ProgressChecklistProps {
  items: ChecklistItem[];
  onItemToggle: (itemId: string, completed: boolean) => Promise<void>;
  memberId: string;
}

export default function ProgressChecklist({ items, onItemToggle, memberId }: ProgressChecklistProps) {
  const [optimisticItems, setOptimisticItems] = useState(items);
  const [updating, setUpdating] = useState<string | null>(null);

  const completedCount = optimisticItems.filter((item) => item.completed).length;
  const progressPercentage = (completedCount / optimisticItems.length) * 100;

  const handleToggle = async (itemId: string) => {
    const item = optimisticItems.find((i) => i.id === itemId);
    if (!item) return;

    const newCompleted = !item.completed;

    // Optimistic update
    setOptimisticItems(
      optimisticItems.map((i) => (i.id === itemId ? { ...i, completed: newCompleted } : i))
    );
    setUpdating(itemId);

    try {
      await onItemToggle(itemId, newCompleted);
    } catch (error) {
      // Revert on error
      setOptimisticItems(items);
      console.error('Failed to update checklist:', error);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">Your BJJ Journey</h3>
          <span className="text-sm text-gray-400">
            {completedCount} of {optimisticItems.length} complete
          </span>
        </div>

        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-white to-gray-300 rounded-full"
          />
        </div>

        {progressPercentage === 100 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-green-900/30 border border-green-700 rounded-lg text-center"
          >
            <p className="text-green-300 font-bold">🎉 Onboarding Complete!</p>
            <p className="text-sm text-green-400 mt-1">
              You're all set to train! See you on the mats.
            </p>
          </motion.div>
        )}
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {optimisticItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              item.completed
                ? 'bg-gray-900 border-white/20'
                : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'
            }`}
            onClick={() => handleToggle(item.id)}
          >
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <div className="flex-shrink-0 mt-1">
                {updating === item.id ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : item.completed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-white rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-black" />
                  </motion.div>
                ) : (
                  <Circle className="w-6 h-6 text-gray-500" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-medium mb-1 ${
                    item.completed ? 'text-white line-through' : 'text-white'
                  }`}
                >
                  {item.label}
                </h4>
                <p className={`text-sm ${item.completed ? 'text-gray-500' : 'text-gray-400'}`}>
                  {item.description}
                </p>

                {/* Link */}
                {item.link && !item.completed && (
                  <a
                    href={item.link}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 mt-2 text-sm text-white hover:text-gray-300 transition-colors"
                  >
                    {item.linkText || 'Complete this step'}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Rewards/Badges */}
      {completedCount >= 3 && completedCount < optimisticItems.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-700/50 rounded-lg text-center"
        >
          <div className="text-3xl mb-2">🌟</div>
          <p className="font-bold text-yellow-300">Making Great Progress!</p>
          <p className="text-sm text-yellow-400/80 mt-1">
            Keep going—you're almost there!
          </p>
        </motion.div>
      )}
    </div>
  );
}
