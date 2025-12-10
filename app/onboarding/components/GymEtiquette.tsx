'use client';

import { motion } from 'framer-motion';
import { HandMetal, Scissors, Users, Sparkles, Clock, Heart } from 'lucide-react';

const etiquetteRules = [
  {
    icon: HandMetal,
    title: 'Bow When Entering/Leaving Mat',
    description:
      'A simple bow shows respect for the training space and your instructors. It\'s a BJJ tradition that connects us to martial arts heritage.',
    importance: 'high',
  },
  {
    icon: Scissors,
    title: 'Keep Nails Trimmed',
    description:
      'Short nails on fingers and toes prevent accidental scratches to yourself and training partners. Trim them before every class.',
    importance: 'high',
  },
  {
    icon: Heart,
    title: 'Tap Early, Tap Often',
    description:
      'There\'s no shame in tapping! Protecting yourself from injury is more important than ego. Tap early and you\'ll train longer.',
    importance: 'high',
  },
  {
    icon: Sparkles,
    title: 'Personal Hygiene',
    description:
      'Shower before class, brush your teeth, and wear clean training gear. BJJ involves close contact—be considerate of your partners.',
    importance: 'high',
  },
  {
    icon: Users,
    title: 'Respect Training Partners',
    description:
      'Match your intensity to your partner\'s. If they\'re going light, you go light. If they\'re going hard, you can match it—but never exceed.',
    importance: 'medium',
  },
  {
    icon: Clock,
    title: 'Arrive On Time',
    description:
      'Coming late disrupts class. If you must arrive after warm-ups start, wait at the edge of the mat for the instructor to invite you on.',
    importance: 'medium',
  },
  {
    icon: HandMetal,
    title: 'Ask Before Sitting Out',
    description:
      'If you need to take a break during class, make eye contact with the instructor and get permission before stepping off the mat.',
    importance: 'medium',
  },
  {
    icon: Users,
    title: 'No Coaching During Rolls',
    description:
      'Let people figure things out during sparring. Unsolicited advice can be distracting. If someone asks for help, that\'s different!',
    importance: 'low',
  },
];

export default function GymEtiquette() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">BJJ Gym Etiquette</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          These aren't strict rules—they're guidelines that help everyone train safely and
          respectfully. Follow these and you'll fit right in!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {etiquetteRules.map((rule, index) => {
          const Icon = rule.icon;
          const borderColor =
            rule.importance === 'high'
              ? 'border-white/30'
              : rule.importance === 'medium'
              ? 'border-gray-600'
              : 'border-gray-700';

          return (
            <motion.div
              key={rule.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gray-900 border-2 ${borderColor} rounded-lg p-6 hover:border-white/50 transition-all`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    {rule.title}
                    {rule.importance === 'high' && (
                      <span className="text-xs bg-white text-black px-2 py-1 rounded-full font-medium">
                        Important
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{rule.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Golden Rule */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-700/50 rounded-lg p-6 mt-8"
      >
        <div className="flex items-start gap-4">
          <div className="text-4xl">🥋</div>
          <div>
            <h3 className="font-bold text-xl mb-2 text-yellow-300">The Golden Rule</h3>
            <p className="text-yellow-100/90 leading-relaxed">
              <strong>Leave your ego at the door.</strong> BJJ is a journey of continuous learning.
              Everyone taps, everyone makes mistakes, and everyone started as a white belt. Be humble,
              be respectful, and be ready to learn. That's the Fort way.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Questions Section */}
      <div className="text-center mt-8 p-6 bg-gray-900/50 rounded-lg border border-gray-800">
        <p className="text-gray-400 mb-4">
          Have questions about gym etiquette or what to expect?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="tel:260-452-7615"
            className="inline-block px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Call (260) 452-7615
          </a>
          <a
            href="/contact"
            className="inline-block px-6 py-3 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
