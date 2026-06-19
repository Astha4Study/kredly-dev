import { createFileRoute } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_app/riwayat/')({
  component: RouteComponent,
});

interface Activity {
  id: string;
  type: 'assessment_completed' | 'credential_earned' | 'cv_updated' | 'assessment_started' | 'blockchain_verified';
  title: string;
  description: string;
  date: string;
  time: string;
  metadata?: {
    score?: number;
    txHash?: string;
    fileName?: string;
    skills?: string[];
    progress?: string;
  };
}

function RouteComponent() {
  // Mock data - nanti diganti dengan data dari API
  const activities: Activity[] = [
    {
      id: '1',
      type: 'assessment_completed',
      title: 'Assessment Selesai: React Advanced',
      description: 'Anda menyelesaikan assessment React Advanced',
      date: '15 Juni 2026',
      time: '14:30',
      metadata: {
        score: 85,
      },
    },
    {
      id: '2',
      type: 'credential_earned',
      title: 'Kredensial Baru Diterbitkan',
      description: 'Kredensial React Advanced berhasil diterbitkan ke blockchain',
      date: '15 Juni 2026',
      time: '14:35',
      metadata: {
        txHash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      },
    },
    {
      id: '3',
      type: 'blockchain_verified',
      title: 'Kredensial Diverifikasi di Blockchain',
      description: 'Kredensial React Advanced telah diverifikasi di blockchain',
      date: '15 Juni 2026',
      time: '14:36',
      metadata: {
        txHash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      },
    },
    {
      id: '4',
      type: 'assessment_started',
      title: 'Memulai Assessment: TypeScript Fundamentals',
      description: 'Assessment TypeScript Fundamentals dimulai',
      date: '14 Juni 2026',
      time: '16:00',
      metadata: {
        progress: '5/20 soal dijawab',
      },
    },
    {
      id: '5',
      type: 'assessment_completed',
      title: 'Assessment Selesai: JavaScript ES6',
      description: 'Anda menyelesaikan assessment JavaScript ES6',
      date: '10 Juni 2026',
      time: '11:45',
      metadata: {
        score: 82,
      },
    },
    {
      id: '6',
      type: 'credential_earned',
      title: 'Kredensial Baru Diterbitkan',
      description: 'Kredensial JavaScript ES6 berhasil diterbitkan ke blockchain',
      date: '10 Juni 2026',
      time: '11:50',
      metadata: {
        txHash: '0x456def789ghi012jkl345mno678pqr901stu234',
      },
    },
    {
      id: '7',
      type: 'cv_updated',
      title: 'CV Diperbarui',
      description: 'CV berhasil diperbarui dengan file baru',
      date: '9 Juni 2026',
      time: '09:15',
      metadata: {
        fileName: 'resume_v2.pdf',
        skills: ['TypeScript', 'GraphQL', 'Docker'],
      },
    },
    {
      id: '8',
      type: 'blockchain_verified',
      title: 'Kredensial Diverifikasi di Blockchain',
      description: 'Kredensial JavaScript ES6 telah diverifikasi di blockchain',
      date: '10 Juni 2026',
      time: '11:52',
      metadata: {
        txHash: '0x456def789ghi012jkl345mno678pqr901stu234',
      },
    },
  ];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'assessment_completed':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case 'credential_earned':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case 'cv_updated':
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
            </svg>
          </div>
        );
      case 'assessment_started':
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-yellow-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case 'blockchain_verified':
        return (
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
    }
  };

  const getActivityTypeBadge = (type: Activity['type']) => {
    switch (type) {
      case 'assessment_completed':
        return <Badge variant="default">Assessment</Badge>;
      case 'credential_earned':
        return <Badge className="bg-blue-500">Kredensial</Badge>;
      case 'cv_updated':
        return <Badge className="bg-purple-500">CV</Badge>;
      case 'assessment_started':
        return <Badge variant="secondary">Assessment</Badge>;
      case 'blockchain_verified':
        return <Badge className="bg-indigo-500">Blockchain</Badge>;
      default:
        return <Badge variant="outline">Lainnya</Badge>;
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Riwayat Aktivitas</h2>
            <p className="text-gray-600 mt-2">
              Timeline aktivitas Anda di platform
            </p>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {activities.length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Aktivitas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">15 Juni</p>
                <p className="text-sm text-gray-600 mt-1">Hari Paling Aktif</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">7 hari</p>
                <p className="text-sm text-gray-600 mt-1">Streak Terpanjang</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Timeline Aktivitas</CardTitle>
                <CardDescription>
                  Riwayat aktivitas Anda secara kronologis
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4">
                    {/* Icon & Line */}
                    <div className="flex flex-col items-center">
                      {getActivityIcon(activity.type)}
                      {index !== activities.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {activity.title}
                          </h4>
                          {getActivityTypeBadge(activity.type)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        {activity.date}
                      </p>

                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="mt-3 space-y-2">
                          {activity.metadata.score !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">
                                Score:
                              </span>
                              <span className="text-sm text-gray-900 font-semibold">
                                {activity.metadata.score}/100
                              </span>
                            </div>
                          )}

                          {activity.metadata.txHash && (
                            <div>
                              <span className="text-xs font-medium text-gray-500 block mb-1">
                                Blockchain TX Hash:
                              </span>
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate">
                                {activity.metadata.txHash}
                              </code>
                              <a
                                href="#"
                                className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                              >
                                View on blockchain explorer →
                              </a>
                            </div>
                          )}

                          {activity.metadata.fileName && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">
                                File:
                              </span>
                              <span className="text-sm text-gray-900">
                                {activity.metadata.fileName}
                              </span>
                            </div>
                          )}

                          {activity.metadata.skills && (
                            <div>
                              <span className="text-sm font-medium text-gray-700 block mb-1">
                                New Skills Detected:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {activity.metadata.skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {activity.metadata.progress && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">
                                Status:
                              </span>
                              <span className="text-sm text-gray-900">
                                {activity.metadata.progress}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Belum ada aktivitas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
