'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthTokenData } from '@/types/meli';
import { AUTH_TOKEN_KEY, TOKEN_EXPIRATION_MS } from '@/utils/constants';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokenExpiry: number | null;
  setToken: (token: string) => void;
  clearToken: () => void;
  isTokenExpired: () => boolean;
  getTimeUntilExpiry: () => number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const loadToken = () => {
      try {
        const stored = localStorage.getItem(AUTH_TOKEN_KEY);
        if (stored) {
          const data: AuthTokenData = JSON.parse(stored);

          // Check if token is expired
          if (data.expiresAt && Date.now() > data.expiresAt) {
            // Token expired, clear it
            localStorage.removeItem(AUTH_TOKEN_KEY);
            setTokenState(null);
            setTokenExpiry(null);
          } else {
            setTokenState(data.token);
            setTokenExpiry(data.expiresAt || null);
          }
        }
      } catch (error) {
        console.error('Error loading token from localStorage:', error);
        localStorage.removeItem(AUTH_TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const setToken = useCallback((newToken: string) => {
    const now = Date.now();
    const expiresAt = now + TOKEN_EXPIRATION_MS;

    const data: AuthTokenData = {
      token: newToken,
      createdAt: now,
      expiresAt,
    };

    try {
      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(data));
      setTokenState(newToken);
      setTokenExpiry(expiresAt);
    } catch (error) {
      console.error('Error saving token to localStorage:', error);
    }
  }, []);

  const clearToken = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setTokenState(null);
      setTokenExpiry(null);
    } catch (error) {
      console.error('Error clearing token from localStorage:', error);
    }
  }, []);

  const isTokenExpired = useCallback(() => {
    if (!tokenExpiry) return false;
    return Date.now() > tokenExpiry;
  }, [tokenExpiry]);

  const getTimeUntilExpiry = useCallback((): number | null => {
    if (!tokenExpiry) return null;
    const remaining = tokenExpiry - Date.now();
    return remaining > 0 ? remaining : 0;
  }, [tokenExpiry]);

  const value: AuthContextType = {
    token,
    isAuthenticated: !!token && !isTokenExpired(),
    isLoading,
    tokenExpiry,
    setToken,
    clearToken,
    isTokenExpired,
    getTimeUntilExpiry,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
