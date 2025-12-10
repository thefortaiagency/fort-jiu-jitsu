'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, Printer, QrCode, Search, Check, X, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  program: string;
  qr_code: string | null;
}

interface QRCodeData {
  code: string;
  dataUrl: string;
  assigned: boolean;
  memberId?: string;
  memberName?: string;
}

export default function QRCodeManagement() {
  const [members, setMembers] = useState<Member[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchSize, setBatchSize] = useState(10);
  const [prefix, setPrefix] = useState('FORT');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      const res = await fetch('/api/members?status=all');
      const data = await res.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  }

  // Generate a unique QR code string
  function generateCodeString(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  // Generate QR code image
  async function generateQRCodeImage(code: string): Promise<string> {
    try {
      const dataUrl = await QRCode.toDataURL(code, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return dataUrl;
    } catch (err) {
      console.error('Error generating QR code:', err);
      return '';
    }
  }

  // Generate a batch of new QR codes
  async function generateBatch() {
    setIsGenerating(true);
    const newCodes: QRCodeData[] = [];

    for (let i = 0; i < batchSize; i++) {
      const code = generateCodeString();
      const dataUrl = await generateQRCodeImage(code);
      newCodes.push({
        code,
        dataUrl,
        assigned: false,
      });
    }

    setQrCodes((prev) => [...prev, ...newCodes]);
    setIsGenerating(false);
    setMessage({ type: 'success', text: `Generated ${batchSize} new QR codes!` });
    setTimeout(() => setMessage(null), 3000);
  }

  // Assign QR code to member
  async function assignQRCode() {
    if (!selectedMember || !selectedCode) return;

    try {
      const res = await fetch(`/api/members/${selectedMember.id}/qr-code`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: selectedCode }),
      });

      if (res.ok) {
        // Update local state
        setQrCodes((prev) =>
          prev.map((qr) =>
            qr.code === selectedCode
              ? {
                  ...qr,
                  assigned: true,
                  memberId: selectedMember.id,
                  memberName: `${selectedMember.first_name} ${selectedMember.last_name}`,
                }
              : qr
          )
        );
        setMembers((prev) =>
          prev.map((m) =>
            m.id === selectedMember.id ? { ...m, qr_code: selectedCode } : m
          )
        );
        setMessage({ type: 'success', text: `QR code assigned to ${selectedMember.first_name}!` });
        setSelectedMember(null);
        setSelectedCode(null);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to assign QR code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
    setTimeout(() => setMessage(null), 3000);
  }

  // Remove QR code from member
  async function removeQRCode(memberId: string) {
    try {
      const res = await fetch(`/api/members/${memberId}/qr-code`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const member = members.find((m) => m.id === memberId);
        if (member?.qr_code) {
          setQrCodes((prev) =>
            prev.map((qr) =>
              qr.code === member.qr_code
                ? { ...qr, assigned: false, memberId: undefined, memberName: undefined }
                : qr
            )
          );
        }
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, qr_code: null } : m))
        );
        setMessage({ type: 'success', text: 'QR code removed from member' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove QR code' });
    }
    setTimeout(() => setMessage(null), 3000);
  }

  // Print QR codes
  function printQRCodes() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const unassignedCodes = qrCodes.filter((qr) => !qr.assigned);

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes - The Fort</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
            }
            .qr-item {
              text-align: center;
              padding: 10px;
              border: 1px dashed #ccc;
              break-inside: avoid;
            }
            .qr-item img {
              width: 150px;
              height: 150px;
            }
            .code {
              font-family: monospace;
              font-size: 10px;
              margin-top: 5px;
            }
            @media print {
              .qr-item {
                border: 1px dashed #999;
              }
            }
          </style>
        </head>
        <body>
          <h1>The Fort - Member QR Codes</h1>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
          <div class="grid">
            ${unassignedCodes
              .map(
                (qr) => `
              <div class="qr-item">
                <img src="${qr.dataUrl}" alt="${qr.code}" />
                <div class="code">${qr.code}</div>
              </div>
            `
              )
              .join('')}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  }

  // Download all QR codes as individual images
  function downloadQRCodes() {
    const unassignedCodes = qrCodes.filter((qr) => !qr.assigned);
    unassignedCodes.forEach((qr, index) => {
      const link = document.createElement('a');
      link.download = `qr-${qr.code}.png`;
      link.href = qr.dataUrl;
      link.click();
    });
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

  const membersWithoutQR = filteredMembers.filter((m) => !m.qr_code);
  const membersWithQR = filteredMembers.filter((m) => m.qr_code);
  const unassignedCodes = qrCodes.filter((qr) => !qr.assigned);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">QR Code Management</h1>
              <p className="text-gray-400">Generate and assign QR codes to members</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-900/50 border border-green-500 text-green-200'
                : 'bg-red-900/50 border border-red-500 text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Generate QR Codes */}
          <div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <QrCode className="w-6 h-6" />
                Generate QR Codes
              </h2>
              <p className="text-gray-400 mb-4">
                Generate unique QR codes that you can laser onto keychains. Each code is unique and
                can be assigned to a member.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Prefix</label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Batch Size</label>
                  <select
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg"
                  >
                    <option value={5}>5 codes</option>
                    <option value={10}>10 codes</option>
                    <option value={20}>20 codes</option>
                    <option value={50}>50 codes</option>
                  </select>
                </div>
              </div>

              <button
                onClick={generateBatch}
                disabled={isGenerating}
                className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    Generate {batchSize} QR Codes
                  </>
                )}
              </button>
            </div>

            {/* Unassigned QR Codes */}
            {unassignedCodes.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">
                    Unassigned Codes ({unassignedCodes.length})
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={printQRCodes}
                      className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                    <button
                      onClick={downloadQRCodes}
                      className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto">
                  {unassignedCodes.map((qr) => (
                    <button
                      key={qr.code}
                      onClick={() => setSelectedCode(qr.code)}
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        selectedCode === qr.code
                          ? 'border-white bg-gray-800'
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <img src={qr.dataUrl} alt={qr.code} className="w-full rounded" />
                      <p className="text-xs font-mono mt-1 truncate">{qr.code}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Assign to Members */}
          <div>
            {/* Assignment Panel */}
            {selectedCode && (
              <div className="bg-gray-900 border-2 border-white rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">Assign QR Code</h3>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={qrCodes.find((qr) => qr.code === selectedCode)?.dataUrl}
                    alt={selectedCode}
                    className="w-24 h-24 rounded-lg"
                  />
                  <div>
                    <p className="font-mono text-lg">{selectedCode}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {selectedMember
                        ? `Assign to: ${selectedMember.first_name} ${selectedMember.last_name}`
                        : 'Select a member below'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={assignQRCode}
                    disabled={!selectedMember}
                    className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Assign
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCode(null);
                      setSelectedMember(null);
                    }}
                    className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Members Without QR */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">
                Members Without QR Code ({membersWithoutQR.length})
              </h3>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search members..."
                  className="w-full pl-10 pr-4 py-2 bg-black border border-gray-700 rounded-lg"
                />
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {membersWithoutQR.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {searchQuery ? 'No members found' : 'All members have QR codes!'}
                  </p>
                ) : (
                  membersWithoutQR.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        selectedMember?.id === member.id
                          ? 'border-white bg-gray-800'
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <p className="font-medium">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-sm text-gray-400">{member.program}</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Members With QR */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">
                Members With QR Code ({membersWithQR.length})
              </h3>

              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {membersWithQR.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No members have QR codes yet</p>
                ) : (
                  membersWithQR.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 rounded-lg border border-gray-700 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-xs font-mono text-gray-400">{member.qr_code}</p>
                      </div>
                      <button
                        onClick={() => removeQRCode(member.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
                        title="Remove QR code"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
