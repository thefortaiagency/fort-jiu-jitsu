'use client';

import { motion } from 'framer-motion';
import { UserPlus, Users, Calendar } from 'lucide-react';

interface ChoosePathProps {
  onSelect: (path: 'new' | 'returning' | 'drop-in') => void;
}

export default function ChoosePath({ onSelect }: ChoosePathProps) {
  const paths = [
    {
      id: 'new' as const,
      icon: UserPlus,
      title: "I'm New Here",
      description: 'Start your BJJ journey with a full membership',
      color: 'from-blue-500 to-blue-600',
      highlight: true,
    },
    {
      id: 'returning' as const,
      icon: Users,
      title: 'Returning Member',
      description: 'Check in or manage your existing membership',
      color: 'from-green-500 to-green-600',
      highlight: false,
    },
    {
      id: 'drop-in' as const,
      icon: Calendar,
      title: 'Drop-in Visit',
      description: 'Just here for one class? Purchase a single session',
      color: 'from-purple-500 to-purple-600',
      highlight: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">
          Choose Your Path
        </h2>
        <p className="text-gray-400">
          Select the option that best describes you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paths.map((path, index) => {
          const Icon = path.icon;
          return (
            <motion.button
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(path.id)}
              className={`
                relative group p-8 rounded-2xl border-2 transition-all duration-300
                ${
                  path.highlight
                    ? 'border-white bg-white/5 hover:bg-white/10'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-500 hover:bg-gray-900'
                }
              `}
            >
              {/* Popular Badge */}
              {path.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}

              {/* Icon with Gradient Background */}
              <div className="mb-6 flex justify-center">
                <div
                  className={`
                    w-20 h-20 rounded-2xl bg-gradient-to-br ${path.color}
                    flex items-center justify-center transform group-hover:scale-110 transition-transform
                  `}
                >
                  <Icon className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3">{path.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {path.description}
              </p>

              {/* Arrow */}
              <div className="mt-6 flex justify-center">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="text-center mt-12 pt-8 border-t border-gray-800">
        <p className="text-gray-500 text-sm">
          Not sure which option to choose?{' '}
          <a href="tel:2604527615" className="text-white hover:underline">
            Call us at (260) 452-7615
          </a>
        </p>
      </div>
    </motion.div>
  );
}
