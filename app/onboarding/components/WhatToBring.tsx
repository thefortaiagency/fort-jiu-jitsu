'use client';

import { motion } from 'framer-motion';
import { Droplets, Shirt, Footprints, Wind, Package, Smile, Check } from 'lucide-react';

const essentialItems = [
  {
    icon: Droplets,
    name: 'Water Bottle',
    description: "You'll sweat a lot! Bring a large bottle and stay hydrated.",
    required: true,
    tip: "Fill it before class - there's a water fountain but it gets busy.",
  },
  {
    icon: Wind,
    name: 'Towel',
    description: 'For wiping sweat between drills. A small workout towel works great.',
    required: true,
    tip: 'Microfiber towels are lightweight and dry quickly.',
  },
  {
    icon: Footprints,
    name: 'Flip Flops or Sandals',
    description: 'For walking off the mat to the bathroom or water fountain.',
    required: true,
    tip: 'Never walk on the mat with shoes, or off the mat barefoot.',
  },
  {
    icon: Shirt,
    name: 'Change of Clothes',
    description: "You'll be soaked after training. Fresh clothes feel amazing!",
    required: true,
    tip: 'Keep a gym bag in your car with backup clothes.',
  },
  {
    icon: Package,
    name: 'Gi (Optional)',
    description: 'If you have your own gi, bring it! Otherwise, we have loaners.',
    required: false,
    tip: 'A white gi is traditional and works for all classes.',
  },
  {
    icon: Smile,
    name: 'Positive Attitude',
    description: 'The most important thing! Come ready to learn and have fun.',
    required: true,
    tip: 'Everyone was a beginner once. Be patient with yourself!',
  },
];

const whatToWear = {
  withGi: [
    'Gi jacket and pants (we provide loaners)',
    'Rash guard or t-shirt underneath',
    'Athletic shorts under gi pants',
    'No underwear with metal fasteners',
  ],
  noGi: [
    'Athletic t-shirt or rash guard',
    'Athletic shorts or spats',
    'No pockets, zippers, or buttons',
    'Form-fitting clothes work best',
  ],
};

const dontBring = [
  'Jewelry or watches (can cause injuries)',
  'Shoes (leave at entrance or in your bag)',
  'Strong cologne/perfume (close contact sport)',
  'Baggy clothes (get caught during techniques)',
];

export default function WhatToBring() {
  return (
    <div className="space-y-8">
      {/* Essential Items Checklist */}
      <div>
        <h2 className="text-3xl font-bold mb-2">What to Bring</h2>
        <p className="text-gray-400 mb-6">
          Pack these essentials for your first class. Don't worry if you forget something—we've got
          you covered!
        </p>

        <div className="space-y-3">
          {essentialItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900 border border-gray-700 rounded-lg p-5 hover:border-gray-500 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      {item.required && (
                        <span className="text-xs bg-white text-black px-2 py-0.5 rounded-full font-medium">
                          Essential
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                    {item.tip && (
                      <div className="flex items-start gap-2 mt-2 p-3 bg-black rounded-lg border border-gray-800">
                        <span className="text-xs font-bold text-yellow-400 flex-shrink-0">TIP:</span>
                        <span className="text-xs text-gray-400">{item.tip}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 border-2 border-gray-600 rounded-md flex items-center justify-center hover:border-white hover:bg-white group transition-all cursor-pointer">
                      <Check className="w-5 h-5 text-gray-600 group-hover:text-black transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* What to Wear */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 border border-gray-700 rounded-lg p-6"
        >
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Package className="w-6 h-6" />
            With a Gi
          </h3>
          <ul className="space-y-2">
            {whatToWear.withGi.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900 border border-gray-700 rounded-lg p-6"
        >
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Shirt className="w-6 h-6" />
            No-Gi Classes
          </h3>
          <ul className="space-y-2">
            {whatToWear.noGi.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Don't Bring */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-red-900/20 border border-red-900/50 rounded-lg p-6"
      >
        <h3 className="font-bold text-xl mb-4 text-red-300">⚠️ Leave These at Home</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {dontBring.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-400 text-sm">✕</span>
              </div>
              <span className="text-red-200">{item}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Need to Buy a Gi? */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-lg p-6 text-center"
      >
        <h3 className="font-bold text-xl mb-3">Need to Buy a Gi?</h3>
        <p className="text-gray-400 mb-4 max-w-2xl mx-auto">
          No rush! Use our loaners for your first few classes to make sure BJJ is right for you.
          When you're ready, we can recommend quality gis for beginners at great prices.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="tel:260-452-7615"
            className="inline-block px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Ask Us About Gis
          </a>
          <a
            href="/contact"
            className="inline-block px-6 py-3 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
          >
            Contact for Sizing Help
          </a>
        </div>
      </motion.div>
    </div>
  );
}
