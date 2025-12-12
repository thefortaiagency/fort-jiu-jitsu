export default function WaiversLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400">Loading waivers...</p>
      </div>
    </div>
  );
}
