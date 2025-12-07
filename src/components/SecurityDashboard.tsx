'use client';

import { useState, useEffect } from 'react';

interface SecurityDashboardData {
  summary: {
    criticalAlerts: number;
    highAlerts: number;
    mediumAlerts: number;
    lowAlerts: number;
    totalAlerts: number;
    securityScore: number;
  };
  alerts: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    severity: string;
    timestamp: string;
    status: string;
  }>;
  metrics: {
    totalRequests: number;
    blockedRequests: number;
    suspiciousActivities: number;
    failedLogins: number;
    successfulLogins: number;
  };
  recentEvents: Array<{
    id: string;
    eventType: string;
    severity: string;
    timestamp: string;
    description: string;
  }>;
}

export default function SecurityDashboard() {
  const [dashboard, setDashboard] = useState<SecurityDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would call SecurityMonitor.getSecurityDashboard()
        // For now, we'll use mock data
        const mockData: SecurityDashboardData = {
          summary: {
            criticalAlerts: 0,
            highAlerts: 2,
            mediumAlerts: 5,
            lowAlerts: 12,
            totalAlerts: 19,
            securityScore: 98
          },
          alerts: [
            {
              id: '1',
              title: 'Suspicious Login Attempt',
              description: 'Multiple failed login attempts detected from IP 192.168.1.100',
              category: 'authentication',
              severity: 'high',
              timestamp: new Date().toISOString(),
              status: 'active'
            },
            {
              id: '2',
              title: 'Rate Limit Exceeded',
              description: 'API rate limit exceeded for endpoint /api/transactions',
              category: 'api_security',
              severity: 'medium',
              timestamp: new Date(Date.now() - 300000).toISOString(),
              status: 'resolved'
            }
          ],
          metrics: {
            totalRequests: 15420,
            blockedRequests: 23,
            suspiciousActivities: 7,
            failedLogins: 12,
            successfulLogins: 89
          },
          recentEvents: [
            {
              id: '1',
              eventType: 'login_success',
              severity: 'low',
              timestamp: new Date().toISOString(),
              description: 'User admin@example.com logged in successfully'
            },
            {
              id: '2',
              eventType: 'api_access',
              severity: 'low',
              timestamp: new Date(Date.now() - 60000).toISOString(),
              description: 'API access to /api/transactions'
            }
          ]
        };
        
        setDashboard(mockData);
        setError(null);
      } catch (err) {
        setError('Failed to load security dashboard');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return <div>No data available</div>;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Security Dashboard</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Security Score */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Security Score</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Overall security posture</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{dashboard.summary.securityScore}%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Good</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${dashboard.summary.securityScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-400 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-400">Critical</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-300">{dashboard.summary.criticalAlerts}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-orange-400 dark:text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-400">High</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">{dashboard.summary.highAlerts}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-400 dark:text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Medium</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">{dashboard.summary.mediumAlerts}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-400 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-400">Low</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-300">{dashboard.summary.lowAlerts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Requests</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dashboard.metrics.totalRequests.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Blocked Requests</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{dashboard.metrics.blockedRequests}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Suspicious Activities</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{dashboard.metrics.suspiciousActivities}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed Logins</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{dashboard.metrics.failedLogins}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Successful Logins</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{dashboard.metrics.successfulLogins}</div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Alerts</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {dashboard.alerts.slice(0, 10).map((alert) => (
            <div key={alert.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{alert.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{alert.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    alert.status === 'active' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                  }`}>
                    {alert.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Events</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {dashboard.recentEvents.slice(0, 10).map((event) => (
            <div key={event.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                    {event.severity}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{event.eventType.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.description}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(event.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 