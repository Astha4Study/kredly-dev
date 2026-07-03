const API_BASE_URL =
  import.meta.env.PUBLIC_AUTH_SERVER_URL || 'http://localhost:8080';

export interface Activity {
  id: string;
  type:
    | 'user_login'
    | 'user_logout'
    | 'user_register'
    | 'onboarding_completed'
    | 'assessment_completed'
    | 'credential_earned'
    | 'cv_updated'
    | 'cv_uploaded'
    | 'cv_parsed'
    | 'assessment_started'
    | 'assessment_abandoned'
    | 'blockchain_verified'
    | 'blockchain_issued';
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

export async function getUserActivities(): Promise<Activity[]> {
  const response = await fetch(`${API_BASE_URL}/api/activities`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Failed to get activities' }));
    throw new Error(error.error || 'Failed to get activities');
  }

  return response.json();
}
