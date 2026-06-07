import { getInitData } from './telegram.js';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(method, path, body = null) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Telegram-Init-Data': getInitData(),
  };

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Xatolik yuz berdi' }));
    const errorMsg = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
    throw new Error(errorMsg || 'So\'rov muvaffaqiyatsiz');
  }
  return res.json();
}

export const api = {
  login: () => request('POST', '/login'),
  register: (data) => request('POST', '/register', data),

  chat: (message, session_id) => request('POST', '/chat', { message, session_id }),
  history: (limit = 50) => request('GET', `/history?limit=${limit}`),

  addGlucose: (value, meal_context, unit = 'mmol/L') =>
    request('POST', '/glucose', { value, meal_context, unit }),
  getGlucose: (days = 30) => request('GET', `/glucose?days=${days}`),

  getProfile: () => request('GET', '/profile'),
  updateProfile: (data) => request('PUT', '/profile', data),

  getReminders: () => request('GET', '/reminders'),
  addReminder: (data) => request('POST', '/reminders', data),
  toggleReminder: (id, active) => request('PUT', `/reminders/${id}`, { active }),
  deleteReminder: (id) => request('DELETE', `/reminders/${id}`),
};