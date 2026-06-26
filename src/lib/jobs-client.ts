const API_BASE_URL = import.meta.env.PUBLIC_AUTH_SERVER_URL || 'http://localhost:8080';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyUrl?: string;
  location: string;
  recruiterName?: string;
  recruiterUrl?: string;
  experienceLevel?: string;
  type?: string;
  sector?: string;
  salary?: string;
  description?: string;
  descriptionHtml?: string;
  url?: string;
  postedTime?: string;
  postedDate?: string;
  logo?: string;
  promoted: boolean;
  earlyApplicant: boolean;
  source: string;
}

export interface FetchJobsRequest {
  query: string;
  location: string;
}

export interface FetchJobsResponse {
  message: string;
  count: number;
  jobs: Job[];
}

export async function fetchAndStoreJobs(
  request: FetchJobsRequest
): Promise<FetchJobsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/fetch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch jobs' }));
    throw new Error(error.error || 'Failed to fetch jobs');
  }

  return response.json();
}

export async function getUserJobs(): Promise<Job[]> {
  const response = await fetch(`${API_BASE_URL}/api/jobs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to get jobs' }));
    throw new Error(error.error || 'Failed to get jobs');
  }

  return response.json();
}
