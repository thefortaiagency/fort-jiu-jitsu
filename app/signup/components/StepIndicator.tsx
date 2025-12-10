'use client';

import { motion } from 'framer-motion';

interface Step {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-12">
      {/* Desktop: Horizontal Progress Bar */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="relative flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: currentStep >= step.number ? '#ffffff' : '#1f2937',
                    borderColor: currentStep >= step.number ? '#ffffff' : '#374151',
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 relative z-10"
                >
                  <span className={currentStep >= step.number ? 'text-black' : 'text-gray-400'}>
                    {currentStep > step.number ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </span>
                </motion.div>

                {/* Step Label */}
                <motion.span
                  initial={false}
                  animate={{
                    color: currentStep >= step.number ? '#ffffff' : '#6b7280',
                  }}
                  className="absolute -bottom-8 text-sm font-medium whitespace-nowrap"
                >
                  {step.label}
                </motion.span>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-800 mx-4 relative">
                  <motion.div
                    initial={false}
                    animate={{
                      width: currentStep > step.number ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-0 left-0 h-full bg-white"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Vertical Progress Dots */}
      <div className="md:hidden">
        <div className="flex justify-center items-center gap-2">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: currentStep === step.number ? 1.2 : 1,
                  backgroundColor: currentStep >= step.number ? '#ffffff' : '#374151',
                }}
                className="w-2.5 h-2.5 rounded-full"
              />
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Step {currentStep} of {steps.length}
          </p>
          <p className="text-white font-medium mt-1">
            {steps.find((s) => s.number === currentStep)?.label}
          </p>
        </div>
      </div>
    </div>
  );
}
