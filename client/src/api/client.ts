const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

async function uploadRequest(endpoint: string, formData: FormData): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers, body: formData });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(e.error || 'Upload failed');
  }
  return res.json();
}

export const api = {
  get: (endpoint: string) => request(endpoint),
  post: (endpoint: string, data: any) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: any) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
  upload: (endpoint: string, formData: FormData) => uploadRequest(endpoint, formData),

  auth: {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, newPassword: string) => api.post('/auth/reset-password', { token, newPassword }),
  },
  products: {
    list: (params?: string) => api.get(`/products${params ? `?${params}` : ''}`),
    categories: () => api.get('/products/categories'),
    get: (id: number) => api.get(`/products/${id}`),
  },
  orders: {
    create: (data: any) => api.post('/orders', data),
    my: () => api.get('/orders/my'),
    get: (id: number) => api.get(`/orders/${id}`),
  },
  admin: {
    products: () => api.get('/admin/products'),
    createProduct: (formData: FormData) => api.upload('/admin/products', formData),
    updateProduct: (id: number, data: any) => api.put(`/admin/products/${id}`, data),
    deleteProduct: (id: number) => api.delete(`/admin/products/${id}`),
    orders: () => api.get('/admin/orders'),
    updateOrderStatus: (id: number, status: string) => api.put(`/admin/orders/${id}/status`, { status }),
  },
};