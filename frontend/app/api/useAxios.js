"use client";

import { useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../auth/context/AuthContext";

export function useAxios() {
  const { accessToken, setAccessToken } = useAuth();

  useEffect(() => {
    // Request Interceptor
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        if (accessToken && !config.url?.includes("/refresh-token")) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      }
    );

    // Response Interceptor
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // 1. Prevent refresh token endpoint from retrying
        if (originalRequest.url?.includes("/refresh-token")) {
          logout();
          return Promise.reject(error);
        }

        // 2. Initialize retry tracking properly
        const retryCount = originalRequest._retryCount || 0;
        const MAX_RETRIES = 2;

        // 3. Check retry count and status
        if (error.response?.status === 403 && retryCount < MAX_RETRIES) {
          originalRequest._retryCount = retryCount + 1;

          try {
            const { data } = await axiosInstance.post(
              "/api/users/refresh-token"
            );
            setAccessToken(data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, setAccessToken]);

  return axiosInstance;
}
