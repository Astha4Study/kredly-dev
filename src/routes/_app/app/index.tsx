import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_app/app/')({
  component: RouteComponent,
});

interface UserProfile {
  id: string;
  userId: string;
  cvFileName: string;
  cvFilePath: string;
  experience: string;
  isStudent: boolean;
  degree?: string;
  createdAt: string;
  updatedAt: string;
}

function RouteComponent() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    // Fetch UserProfile for debugging
    async function fetchProfile() {
      try {
        console.log('Fetching profile...');
        const response = await fetch('/api/profile', {
          credentials: 'include',
        });
        console.log('Profile response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Profile data:', data);
          setUserProfile(data.profile);
        } else {
          const errorData = await response.json();
          console.error('Profile fetch error:', errorData);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfile();
  }, []);

  return (
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
                <p className="text-base text-gray-900 mt-1 font-mono">
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
                <Link to="/test-overview">
                  <Button className="w-full">Start Assessment</Button>
                </Link>
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

          {/* Debug Section - UserProfile Data */}
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader>
              <CardTitle className="text-yellow-900">
                Debug: UserProfile Data
              </CardTitle>
              <CardDescription>
                Database UserProfile information (for debugging)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading profile...
                </p>
              ) : userProfile ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        CV Filename
                      </label>
                      <p className="text-base text-gray-900 mt-1">
                        {userProfile.cvFileName}
                      </p>
                    </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Experience
                    </label>
                    <p className="text-base text-gray-900 mt-1">
                      {userProfile.experience}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Is Student
                    </label>
                    <p className="text-base text-gray-900 mt-1">
                      {userProfile.isStudent ? 'Yes' : 'No'}
                    </p>
                  </div>

                  {userProfile.degree && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Degree
                      </label>
                      <p className="text-base text-gray-900 mt-1">
                        {userProfile.degree}
                      </p>
                    </div>
                  )}
                </div>

                <details className="mt-4">
                  <summary className="text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700">
                    Show Raw JSON
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto bg-white p-3 rounded border">
                    {JSON.stringify(userProfile, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <p className="text-sm text-red-600">
                ⚠️ No UserProfile found in database
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
