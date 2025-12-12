'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, ChevronLeft, ChevronRight, User, Users } from 'lucide-react';

interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  qrCode: string | null;
  program: string;
}

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  status: string;
  isPrimaryAccountHolder: boolean;
  qrCode?: string | null;
}

interface QRCodeCheckInProps {
  member: MemberData;
  familyMembers: FamilyMember[];
}

export default function QRCodeCheckIn({ member, familyMembers }: QRCodeCheckInProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Build list of all people who can check in (member + active family members)
  const allMembers = [
    { id: member.id, firstName: member.firstName, lastName: member.lastName, qrCode: member.qrCode, program: member.program },
    ...familyMembers
      .filter(fm => fm.status === 'active' && fm.id !== member.id)
      .map(fm => ({
        id: fm.id,
        firstName: fm.firstName,
        lastName: fm.lastName,
        qrCode: fm.qrCode || null,
        program: fm.program,
      }))
  ];

  const hasFamilyMembers = allMembers.length > 1;
  const currentMember = allMembers[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allMembers.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + allMembers.length) % allMembers.length);
  };

  if (!currentMember?.qrCode) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-[#f9f9f9] to-[#f0f0f0] dark:from-[#1b1b1b] dark:to-[#0a0a0a] rounded-3xl p-6 border border-[#e2e2e2] dark:border-[#303030]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1b1b1b] dark:bg-white flex items-center justify-center">
            <QrCode className="w-5 h-5 text-white dark:text-[#1b1b1b]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1b1b1b] dark:text-white">Check-In QR Code</h2>
            <p className="text-sm text-[#5e5e5e] dark:text-[#b9b9b9]">Show at kiosk to check in</p>
          </div>
        </div>
        {hasFamilyMembers && (
          <div className="flex items-center gap-1 px-3 py-1.5 bg-[#e2e2e2] dark:bg-[#303030] rounded-full">
            <Users className="w-4 h-4 text-[#5e5e5e] dark:text-[#b9b9b9]" />
            <span className="text-sm font-medium text-[#5e5e5e] dark:text-[#b9b9b9]">
              {currentIndex + 1}/{allMembers.length}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Previous Button */}
        {hasFamilyMembers && (
          <button
            onClick={goToPrev}
            className="p-3 rounded-full bg-[#e2e2e2] dark:bg-[#303030] hover:bg-[#d0d0d0] dark:hover:bg-[#404040] transition-colors"
            aria-label="Previous family member"
          >
            <ChevronLeft className="w-6 h-6 text-[#1b1b1b] dark:text-white" />
          </button>
        )}

        {/* QR Code Card */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMember.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              {/* Member Name */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#e2e2e2] dark:bg-[#303030] flex items-center justify-center">
                  <User className="w-4 h-4 text-[#5e5e5e] dark:text-[#b9b9b9]" />
                </div>
                <div>
                  <p className="font-bold text-[#1b1b1b] dark:text-white">
                    {currentMember.firstName} {currentMember.lastName}
                  </p>
                  <p className="text-xs text-[#777777] capitalize">
                    {currentMember.program?.replace('-', ' ') || 'Member'}
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-2xl border-2 border-[#e2e2e2] dark:border-[#303030] shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentMember.qrCode!)}&bgcolor=ffffff&color=1b1b1b`}
                  alt={`QR code for ${currentMember.firstName}`}
                  width={180}
                  height={180}
                  className="rounded-lg"
                />
              </div>

              {/* QR Code Value */}
              <p className="mt-3 font-mono text-sm bg-[#f9f9f9] dark:bg-[#0a0a0a] text-[#5e5e5e] dark:text-[#b9b9b9] px-4 py-2 rounded-lg border border-[#e2e2e2] dark:border-[#303030]">
                {currentMember.qrCode}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Button */}
        {hasFamilyMembers && (
          <button
            onClick={goToNext}
            className="p-3 rounded-full bg-[#e2e2e2] dark:bg-[#303030] hover:bg-[#d0d0d0] dark:hover:bg-[#404040] transition-colors"
            aria-label="Next family member"
          >
            <ChevronRight className="w-6 h-6 text-[#1b1b1b] dark:text-white" />
          </button>
        )}
      </div>

      {/* Family Member Dots */}
      {hasFamilyMembers && (
        <div className="flex justify-center gap-2 mt-4">
          {allMembers.map((m, index) => (
            <button
              key={m.id}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-[#1b1b1b] dark:bg-white w-6'
                  : 'bg-[#d0d0d0] dark:bg-[#404040] hover:bg-[#b0b0b0] dark:hover:bg-[#505050]'
              }`}
              aria-label={`Show ${m.firstName}'s QR code`}
            />
          ))}
        </div>
      )}

      {/* Instructions */}
      <p className="text-center text-sm text-[#777777] mt-4">
        {hasFamilyMembers
          ? 'Swipe to see family member codes. Show at the kiosk to check in.'
          : 'Show this code at the kiosk when you arrive.'}
      </p>
    </div>
  );
}
