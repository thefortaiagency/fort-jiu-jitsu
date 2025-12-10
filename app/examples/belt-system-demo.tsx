/**
 * BJJ Belt System - Visual Demo Page
 *
 * This page demonstrates all belt system components
 * Access at: /examples/belt-system-demo
 *
 * USE THIS FOR TESTING AND DEMO PURPOSES
 */

'use client';

import React from 'react';
import BeltDisplay, { BeltBadge, BeltIcon } from '@/app/components/BeltDisplay';

export default function BeltSystemDemo() {
  const adultBelts = [
    { name: 'white', display_name: 'White Belt', stripes: 0 },
    { name: 'blue', display_name: 'Blue Belt', stripes: 2 },
    { name: 'purple', display_name: 'Purple Belt', stripes: 3 },
    { name: 'brown', display_name: 'Brown Belt', stripes: 4 },
    { name: 'black', display_name: 'Black Belt', stripes: 0 },
  ];

  const kidsBelts = [
    { name: 'kids_white', display_name: 'White Belt', stripes: 1 },
    { name: 'kids_grey', display_name: 'Grey Belt', stripes: 2 },
    { name: 'kids_yellow', display_name: 'Yellow Belt', stripes: 3 },
    { name: 'kids_orange', display_name: 'Orange Belt', stripes: 4 },
    { name: 'kids_green', display_name: 'Green Belt', stripes: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            BJJ Belt System Components Demo
          </h1>
          <p className="text-gray-600 mb-2">
            Visual demonstration of all belt system components
          </p>
          <p className="text-sm text-gray-500">
            This page shows how belt components render with different sizes and
            configurations
          </p>
        </div>

        {/* Adult Belts Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Adult Belt System (16+)
          </h2>

          {/* Size Variations */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Size Variations (Blue Belt - 2 Stripes)
            </h3>
            <div className="flex items-end gap-8 flex-wrap">
              <div>
                <p className="text-xs text-gray-500 mb-2">Extra Small</p>
                <BeltDisplay
                  beltName="blue"
                  beltDisplayName="Blue Belt"
                  stripes={2}
                  size="sm"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Medium (Default)</p>
                <BeltDisplay
                  beltName="blue"
                  beltDisplayName="Blue Belt"
                  stripes={2}
                  size="md"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Large</p>
                <BeltDisplay
                  beltName="blue"
                  beltDisplayName="Blue Belt"
                  stripes={2}
                  size="lg"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Extra Large</p>
                <BeltDisplay
                  beltName="blue"
                  beltDisplayName="Blue Belt"
                  stripes={2}
                  size="xl"
                />
              </div>
            </div>
          </div>

          {/* All Adult Belts */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              All Adult Belts with Stripes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {adultBelts.map((belt) => (
                <div key={belt.name} className="text-center">
                  <BeltDisplay
                    beltName={belt.name}
                    beltDisplayName={belt.display_name}
                    stripes={belt.stripes}
                    size="lg"
                    showStripes={true}
                    showLabel={true}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {belt.stripes} {belt.stripes === 1 ? 'stripe' : 'stripes'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stripe Progression */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Stripe Progression (Purple Belt)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[0, 1, 2, 3, 4].map((stripes) => (
                <div key={stripes} className="text-center">
                  <BeltDisplay
                    beltName="purple"
                    beltDisplayName="Purple Belt"
                    stripes={stripes}
                    size="md"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {stripes === 0 ? 'No stripes' : `${stripes} stripes`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kids Belts Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Kids Belt System (Under 16)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {kidsBelts.map((belt) => (
              <div key={belt.name} className="text-center">
                <BeltDisplay
                  beltName={belt.name}
                  beltDisplayName={belt.display_name}
                  stripes={belt.stripes}
                  size="lg"
                  showStripes={true}
                  showLabel={true}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {belt.stripes} {belt.stripes === 1 ? 'stripe' : 'stripes'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Compact Belt Badges */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Belt Badges (Compact Display)
          </h2>
          <p className="text-gray-600 mb-4">
            Use in member cards, lists, and navigation
          </p>

          <div className="flex flex-wrap gap-3">
            {adultBelts.map((belt) => (
              <BeltBadge
                key={belt.name}
                beltName={belt.name}
                beltDisplayName={belt.display_name}
                stripes={belt.stripes}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {kidsBelts.map((belt) => (
              <BeltBadge
                key={belt.name}
                beltName={belt.name}
                beltDisplayName={belt.display_name}
                stripes={belt.stripes}
              />
            ))}
          </div>
        </div>

        {/* Belt Icons */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Belt Icons (Avatars & Small Spaces)
          </h2>
          <p className="text-gray-600 mb-4">
            Use in avatars, navigation, and tight spaces
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 w-24">
                Size 16px:
              </span>
              {adultBelts.map((belt) => (
                <BeltIcon
                  key={belt.name}
                  beltName={belt.name}
                  stripes={belt.stripes}
                  size={16}
                />
              ))}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 w-24">
                Size 24px:
              </span>
              {adultBelts.map((belt) => (
                <BeltIcon
                  key={belt.name}
                  beltName={belt.name}
                  stripes={belt.stripes}
                  size={24}
                />
              ))}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 w-24">
                Size 32px:
              </span>
              {adultBelts.map((belt) => (
                <BeltIcon
                  key={belt.name}
                  beltName={belt.name}
                  stripes={belt.stripes}
                  size={32}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Member Card Example */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Example: Member Card with Belt
          </h2>

          <div className="bg-gray-50 rounded-lg p-6 max-w-md">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                JS
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  John Smith
                </h3>
                <BeltBadge
                  beltName="purple"
                  beltDisplayName="Purple Belt"
                  stripes={3}
                  className="mt-2"
                />
                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  <p>Member since: Jan 2022</p>
                  <p>Classes attended: 156</p>
                  <p>Days at belt: 245</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Design Notes */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Design Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Realistic Belt Appearance
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Accurate BJJ belt colors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Gradient backgrounds for depth</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Subtle fabric texture overlay</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>White stripes with realistic placement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Proper shadows and shine effects</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Responsive Design
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>4 size options (sm/md/lg/xl)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>Mobile-friendly layouts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>Touch-friendly interactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>Print-optimized certificates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>Accessible color contrasts</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> All components are production-ready and
              follow BJJ academy best practices from{' '}
              <a
                href="https://www.martialytics.com"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Martialytics
              </a>
              . Colors, stripes, and progression rules are accurate to IBJJF
              standards.
            </p>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Implementation
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Import Components
              </h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                {`import BeltDisplay, { BeltBadge, BeltIcon } from '@/app/components/BeltDisplay';`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Basic Usage
              </h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                {`<BeltDisplay
  beltName="blue"
  beltDisplayName="Blue Belt"
  stripes={2}
  size="lg"
  showStripes={true}
  showLabel={true}
/>`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                In Member Cards
              </h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                {`<BeltBadge
  beltName={member.current_belt.name}
  beltDisplayName={member.current_belt.display_name}
  stripes={member.current_stripes}
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
