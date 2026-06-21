import type {
  CreateSessionPayload,
  SessionResponse,
  NextItemResponse,
  AnswerResponse,
  ResultResponse,
} from '../pages/client/cat/types';

const API_BASE = '/api';

export const sessionService = {
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

  async getNextItem(sessionId: string): Promise<NextItemResponse> {
    const response = await fetch(`${API_BASE}/sessions/${sessionId}/next-item`);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData.error || `Failed to get next question: ${response.status}`,
      );
    }

    return response.json();
  },

  async submitAnswer(
    sessionId: string,
    answer: string,
  ): Promise<AnswerResponse> {
    const response = await fetch(`${API_BASE}/sessions/${sessionId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answer }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData.error || `Failed to submit answer: ${response.status}`,
      );
    }

    return response.json();
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
