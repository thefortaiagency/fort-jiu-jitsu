'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';

interface FirstClassCountdownProps {
  firstClassDate: string;
  onReschedule?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function FirstClassCountdown({
  firstClassDate,
  onReschedule,
}: FirstClassCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const classTime = new Date(firstClassDate).getTime();
      const difference = classTime - now;

      if (difference < 0) {
        setIsPast(true);
        setTimeRemaining(null);
        return;
      }

      setIsPast(false);
      setTimeRemaining({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [firstClassDate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const addToGoogleCalendar = () => {
    const startDate = new Date(firstClassDate);
    const endDate = new Date(startDate.getTime() + 90 * 60000); // 90 minutes

    const formatDateForGoogle = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const details = encodeURIComponent(
      'Your first Brazilian Jiu-Jitsu class at The Fort!\n\nWhat to bring:\n- Water bottle\n- Athletic clothes\n- Towel\n- Positive attitude!\n\nLocation: 1519 Goshen Road, Fort Wayne, IN 46808'
    );

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      'First BJJ Class at The Fort'
    )}&dates=${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}&details=${details}&location=${encodeURIComponent(
      '1519 Goshen Road, Fort Wayne, IN 46808'
    )}&sf=true&output=xml`;

    window.open(url, '_blank');
  };

  const addToAppleCalendar = () => {
    const startDate = new Date(firstClassDate);
    const endDate = new Date(startDate.getTime() + 90 * 60000);

    const formatDateForICS = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDateForICS(startDate)}
DTEND:${formatDateForICS(endDate)}
SUMMARY:First BJJ Class at The Fort
DESCRIPTION:Your first Brazilian Jiu-Jitsu class at The Fort!\\n\\nWhat to bring:\\n- Water bottle\\n- Athletic clothes\\n- Towel\\n- Positive attitude!
LOCATION:1519 Goshen Road, Fort Wayne, IN 46808
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'first-bjj-class.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isPast) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center"
      >
        <div className="text-4xl mb-3">🥋</div>
        <h3 className="text-xl font-bold mb-2">Hope You Enjoyed Your First Class!</h3>
        <p className="text-gray-400">
          Your first class date has passed. Ready to schedule your next session?
        </p>
        {onReschedule && (
          <button
            onClick={onReschedule}
            className="mt-4 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Schedule
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-lg p-6"
    >
      {/* Class Info */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-4">Your First Class</h3>

        <div className="space-y-2 text-gray-300">
          <div className="flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>{formatDate(firstClassDate)}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{formatTime(firstClassDate)}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <MapPin className="w-5 h-5" />
            <span>1519 Goshen Road, Fort Wayne, IN 46808</span>
          </div>
        </div>
      </div>

      {/* Countdown */}
      {timeRemaining && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {Object.entries(timeRemaining).map(([unit, value]) => (
            <motion.div
              key={unit}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-black rounded-lg p-4 text-center border border-gray-800"
            >
              <div className="text-3xl font-bold text-white mb-1">{value}</div>
              <div className="text-xs uppercase text-gray-500">{unit}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={addToGoogleCalendar}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Google</span>
          </button>
          <button
            onClick={addToAppleCalendar}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Apple/Outlook</span>
          </button>
        </div>

        <a
          href="https://maps.google.com/?q=1519+Goshen+Road+Fort+Wayne+IN+46808"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-4 py-3 text-center border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
        >
          <div className="flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" />
            Get Directions
          </div>
        </a>

        {onReschedule && (
          <button
            onClick={onReschedule}
            className="block w-full px-4 py-3 text-center text-gray-400 hover:text-white transition-colors text-sm"
          >
            Need to reschedule?
          </button>
        )}
      </div>
    </motion.div>
  );
}
