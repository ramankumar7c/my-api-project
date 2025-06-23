// API Configuration
// Update this URL to point to your deployed API
export const API_BASE_URL = process.env.API_BASE_URL || 'https://my-api-project-nu.vercel.app/';

// API Endpoints
export const API_ENDPOINTS = {
  TASKS: `${API_BASE_URL}/api/tasks`,
  TASK_BY_ID: (id: string) => `${API_BASE_URL}/api/tasks/${id}`,
};

// Test Configuration
export const TEST_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  DELAY_BETWEEN_REQUESTS: 100, // 100ms
}; 