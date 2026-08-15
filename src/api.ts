const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';
export const API_BASE_URL = `${SERVER_URL}/api`;

const ADMIN_BACKEND_URL = import.meta.env.VITE_ADMIN_BACKEND_URL || 'http://localhost:5001';

const getAuthHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response: Response, errorMessage: string) => {
  if (response.status === 401) {
    localStorage.removeItem('admin_token');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized session. Please login again.');
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || errorMessage);
  }
  return response.json();
};

export const api = {
  get: async (endpoint: string) => {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API Request] GET ${url}`);
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response, `GET ${endpoint} failed`);
  },
  post: async (endpoint: string, data: any) => {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API Request] POST ${url}`, data);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response, `POST ${endpoint} failed`);
  },
  postFormData: async (endpoint: string, formData: FormData) => {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API Request] POST (FormData) ${url}`, formData);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return handleResponse(response, `POST FormData ${endpoint} failed`);
  },
  putFormData: async (endpoint: string, formData: FormData) => {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API Request] PUT (FormData) ${url}`, formData);
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return handleResponse(response, `PUT FormData ${endpoint} failed`);
  },
  put: async (endpoint: string, data: any) => {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API Request] PUT ${url}`, data);
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response, `PUT ${endpoint} failed`);
  },
  delete: async (endpoint: string) => {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API Request] DELETE ${url}`);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response, `DELETE ${endpoint} failed`);
  }
};

export const authApi = {
  login: async (username: string, password: string) => {
    const url = `${ADMIN_BACKEND_URL}/auth/login`;
    console.log(`[API Request] POST ${url}`, { username });
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Login failed');
    }
    return result;
  },
  validate: async (token: string) => {
    const url = `${ADMIN_BACKEND_URL}/auth/validate`;
    console.log(`[API Request] POST ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Validation failed');
    }
    return result;
  }
};
