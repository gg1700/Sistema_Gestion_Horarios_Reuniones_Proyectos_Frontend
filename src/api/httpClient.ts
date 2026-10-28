import axios from 'axios';
import { ApiError } from '../types/api';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  timeout: 15000,
  withCredentials: true,
});

interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
}

function buildApiError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return new ApiError('Ocurrió un error inesperado. Intenta nuevamente.', 0);
  }
  if (!error.response) {
    return new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.', 0);
  }
  const responseMessage = error.response.data?.message;
  const message =
    typeof responseMessage === 'string'
      ? responseMessage
      : 'Ocurrió un error inesperado. Intenta nuevamente.';
  return new ApiError(message, error.response.status);
}

export async function sendRequest<ResponseBody>(path: string, options: RequestOptions) {
  try {
    const response = await apiClient.request<ResponseBody>({
      url: path,
      method: options.method,
      data: options.body,
    });
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
}
