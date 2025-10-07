import SecurityDashboard from '@/components/SecurityDashboard';

export default function SecurityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Administration</h1>
        <p className="text-gray-600">
          Monitor security metrics, alerts, and system health in real-time.
        </p>
      </div>
      
      <SecurityDashboard />
    </div>
  );
} 