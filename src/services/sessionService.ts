import type {
  CreateSessionPayload,
  SessionResponse,
  SessionDetails,
  NextItemResponse,
  AnswerResponse,
  ResultResponse,
} from '../pages/client/cat/types';

const API_BASE = '/api';

export const sessionService = {
  async getSession(sessionId: string): Promise<SessionDetails> {
    const response = await fetch(`${API_BASE}/sessions/${sessionId}`);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData.error || `Failed to fetch session details: ${response.status}`,
      );
    }

    return response.json();
  },

  async createSession(data: CreateSessionPayload): Promise<SessionResponse> {
    const response = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData.error || `Failed to create session: ${response.status}`,
      );
    }

    return response.json();
  },

  async getNextItem(
    sessionId: string,
    retryCount = 0,
    maxRetries = 3,
  ): Promise<NextItemResponse> {
    try {
      const response = await fetch(
        `${API_BASE}/sessions/${sessionId}/next-item`,
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));

        // Retry on 500 or 429 errors
        if (
          (response.status === 500 || response.status === 429) &&
          retryCount < maxRetries
        ) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.getNextItem(sessionId, retryCount + 1, maxRetries);
        }

        throw new Error(
          errData.error || `Failed to get next question: ${response.status}`,
        );
      }

      return response.json();
    } catch (err) {
      // Retry on network errors
      if (retryCount < maxRetries && err instanceof TypeError) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.getNextItem(sessionId, retryCount + 1, maxRetries);
      }
      throw err;
    }
  },

  async submitAnswer(
    sessionId: string,
    answer: string,
    retryCount = 0,
    maxRetries = 3,
  ): Promise<AnswerResponse> {
    try {
      const response = await fetch(
        `${API_BASE}/sessions/${sessionId}/answer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answer }),
        },
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));

        // Retry on 500 or 429 errors
        if (
          (response.status === 500 || response.status === 429) &&
          retryCount < maxRetries
        ) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.submitAnswer(sessionId, answer, retryCount + 1, maxRetries);
        }

        throw new Error(
          errData.error || `Failed to submit answer: ${response.status}`,
        );
      }

      return response.json();
    } catch (err) {
      // Retry on network errors
      if (retryCount < maxRetries && err instanceof TypeError) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.submitAnswer(sessionId, answer, retryCount + 1, maxRetries);
      }
      throw err;
    }
  },

  async getResult(sessionId: string): Promise<ResultResponse> {
    const response = await fetch(`${API_BASE}/sessions/${sessionId}/result`);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData.error || `Failed to retrieve result: ${response.status}`,
      );
    }

    return response.json();
  },

  async abandonSession(sessionId: string): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE}/sessions/${sessionId}/abandon`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData.error || `Failed to abandon session: ${response.status}`,
      );
    }

    return response.json();
  },
};
