'use client';

import axios from 'axios';

const TOKEN_COOKIE = 'sg_access_token';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:44311',
  headers: {
    'Content-Type': 'application/json',
    'Abp.TenantId': '1',
  },
});

// Rehydrate token on module load (client-side only)
if (typeof document !== 'undefined') {
  const token = getCookieValue(TOKEN_COOKIE);
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

function getCookieValue(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getAxiosInstance() {
  return instance;
}

export function setAuthToken(token: string) {
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; SameSite=Strict`;
  instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function removeAuthToken() {
  document.cookie = `${TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  delete instance.defaults.headers.common['Authorization'];
}
