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
  request: FetchJobsRequest,
): Promise<FetchJobsResponse> {
  const response = await fetch(`/api/jobs/fetch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Failed to fetch jobs' }));
    throw new Error(error.error || 'Failed to fetch jobs');
  }

  const data = await response.json();
  return {
    ...data,
    jobs: data?.jobs || [],
  };
}

export async function getUserJobs(): Promise<Job[]> {
  const response = await fetch(`/api/jobs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Failed to get jobs' }));
    throw new Error(error.error || 'Failed to get jobs');
  }

  const data = await response.json();
  return data || [];
}
