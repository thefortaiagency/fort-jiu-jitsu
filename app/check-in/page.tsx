'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, CheckCircle, XCircle, User, Users, QrCode } from 'lucide-react';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  program: string;
  status: string;
  member_code?: string;
}

interface CheckInResult {
  success: boolean;
  member?: Member;
  message: string;
}

export default function CheckInKiosk() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'dropdown' | 'barcode'>('dropdown');
  const [recentCheckIns, setRecentCheckIns] = useState<Member[]>([]);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Load members on mount
  useEffect(() => {
    loadMembers();
    loadRecentCheckIns();
  }, []);

  // Focus barcode input when in barcode mode
  useEffect(() => {
    if (mode === 'barcode' && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [mode]);

  async function loadMembers() {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  }

  async function loadRecentCheckIns() {
    try {
      const res = await fetch('/api/check-ins/recent?limit=5');
      const data = await res.json();
      setRecentCheckIns(data.checkIns || []);
    } catch (error) {
      console.error('Failed to load recent check-ins:', error);
    }
  }

  async function handleCheckIn(member: Member) {
    setIsLoading(true);
    setCheckInResult(null);

    try {
      const res = await fetch('/api/check-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: member.id,
          check_in_method: mode === 'barcode' ? 'barcode' : 'kiosk',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCheckInResult({
          success: true,
          member,
          message: `Welcome, ${member.first_name}!`,
        });
        // Add to recent check-ins
        setRecentCheckIns((prev) => [member, ...prev.slice(0, 4)]);
      } else {
        setCheckInResult({
          success: false,
          member,
          message: data.error || 'Check-in failed',
        });
      }
    } catch (error) {
      setCheckInResult({
        success: false,
        member,
        message: 'Network error. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setSelectedMember(null);
      setSearchQuery('');
      setBarcodeInput('');

      // Clear result after 3 seconds
      setTimeout(() => {
        setCheckInResult(null);
      }, 3000);
    }
  }

  async function handleBarcodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    setIsLoading(true);

    try {
      // Look up member by barcode/member code
      const res = await fetch(`/api/members/lookup?code=${encodeURIComponent(barcodeInput)}`);
      const data = await res.json();

      if (data.member) {
        await handleCheckIn(data.member);
      } else {
        setCheckInResult({
          success: false,
          message: 'Member not found. Please try again or use dropdown.',
        });
        setTimeout(() => setCheckInResult(null), 3000);
      }
    } catch (error) {
      setCheckInResult({
        success: false,
        message: 'Lookup failed. Please try again.',
      });
      setTimeout(() => setCheckInResult(null), 3000);
    } finally {
      setIsLoading(false);
      setBarcodeInput('');
      barcodeInputRef.current?.focus();
    }
  }

  const filteredMembers = members.filter((m) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.first_name.toLowerCase().includes(query) ||
      m.last_name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query)
    );
  });

  const activeMembers = filteredMembers.filter((m) => m.status === 'active');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">THE FORT</h1>
            <p className="text-gray-400">Member Check-In</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('dropdown')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                mode === 'dropdown'
                  ? 'bg-white text-black'
                  : 'border border-gray-700 hover:bg-gray-800'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">Name</span>
            </button>
            <button
              onClick={() => setMode('barcode')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                mode === 'barcode'
                  ? 'bg-white text-black'
                  : 'border border-gray-700 hover:bg-gray-800'
              }`}
            >
              <QrCode className="w-5 h-5" />
              <span className="hidden sm:inline">Scan</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Success/Error Message */}
        {checkInResult && (
          <div
            className={`mb-8 p-6 rounded-2xl flex items-center gap-4 animate-pulse ${
              checkInResult.success
                ? 'bg-green-900/50 border-2 border-green-500'
                : 'bg-red-900/50 border-2 border-red-500'
            }`}
          >
            {checkInResult.success ? (
              <CheckCircle className="w-16 h-16 text-green-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-16 h-16 text-red-400 flex-shrink-0" />
            )}
            <div>
              <p
                className={`text-2xl font-bold ${
                  checkInResult.success ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {checkInResult.message}
              </p>
              {checkInResult.member && (
                <p className="text-gray-400 mt-1">
                  {checkInResult.member.program} Program
                </p>
              )}
            </div>
          </div>
        )}

        {/* Barcode Mode */}
        {mode === 'barcode' && (
          <div className="mb-8">
            <form onSubmit={handleBarcodeSubmit} className="relative">
              <div className="bg-gray-900 border-2 border-gray-700 rounded-2xl p-8 text-center">
                <QrCode className="w-20 h-20 mx-auto mb-4 text-gray-600" />
                <p className="text-xl text-gray-400 mb-6">
                  Scan your member barcode or enter your member ID
                </p>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan or type member code..."
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-6 py-4 text-2xl text-center focus:ring-2 focus:ring-white focus:border-transparent"
                  autoFocus
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={isLoading || !barcodeInput.trim()}
                  className="mt-6 w-full bg-white text-black font-bold py-4 rounded-xl text-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Checking in...' : 'Check In'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Dropdown Mode */}
        {mode === 'dropdown' && (
          <div className="mb-8">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-full bg-gray-900 border-2 border-gray-700 rounded-xl pl-14 pr-6 py-4 text-xl focus:ring-2 focus:ring-white focus:border-transparent"
                autoComplete="off"
              />
            </div>

            {/* Member Selection */}
            {selectedMember ? (
              <div className="bg-gray-900 border-2 border-white rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">
                      {selectedMember.first_name} {selectedMember.last_name}
                    </h2>
                    <p className="text-gray-400">{selectedMember.program}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleCheckIn(selectedMember)}
                    disabled={isLoading}
                    className="flex-1 bg-white text-black font-bold py-4 rounded-xl text-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Checking in...' : 'Confirm Check-In'}
                  </button>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="px-6 py-4 border-2 border-gray-700 rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="max-h-[50vh] overflow-y-auto">
                  {activeMembers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      {searchQuery
                        ? 'No members found matching your search'
                        : 'No active members'}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-800">
                      {activeMembers.map((member) => (
                        <button
                          key={member.id}
                          onClick={() => setSelectedMember(member)}
                          className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-800 transition-colors text-left"
                        >
                          <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-7 h-7 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-medium truncate">
                              {member.first_name} {member.last_name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {member.program}
                            </p>
                          </div>
                          <div className="text-gray-600">
                            <CheckCircle className="w-8 h-8" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Check-ins */}
        {recentCheckIns.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-400 mb-4">
              Recent Check-ins
            </h3>
            <div className="flex flex-wrap gap-3">
              {recentCheckIns.map((member, index) => (
                <div
                  key={`${member.id}-${index}`}
                  className="bg-gray-900 border border-gray-800 rounded-full px-4 py-2 flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="text-sm">
                    {member.first_name} {member.last_name.charAt(0)}.
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-green-400">
              {recentCheckIns.length}
            </p>
            <p className="text-gray-500 mt-1">Today&apos;s Check-ins</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-4xl font-bold">{activeMembers.length}</p>
            <p className="text-gray-500 mt-1">Active Members</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <span>The Fort Jiu-Jitsu</span>
          <span>Tap to check in</span>
        </div>
      </footer>
    </div>
  );
}
