import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/contexts';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Kredly</h1>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || 'User'}!
            </h2>
            <p className="text-gray-600 mt-2">Here's your dashboard overview</p>
          </div>

          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your account details and verification status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="text-base text-gray-900 mt-1">
                    {user?.name || 'Not set'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-base text-gray-900 mt-1">
                    {user?.email || 'Not set'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email Verified
                  </label>
                  <p className="mt-1">
                    {user?.emailVerified ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Not Verified
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    User ID
                  </label>
                  <p className="text-base text-gray-900 mt-1 font-mono text-sm">
                    {user?.id || 'Not set'}
                  </p>
                </div>
              </div>

              {user?.image && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Profile Picture
                  </label>
                  <div className="mt-2">
                    <img
                      src={user.image}
                      alt="Profile"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessments</CardTitle>
                <CardDescription>Take skill assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Start Assessment</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Credentials</CardTitle>
                <CardDescription>View your credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  View Credentials
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
