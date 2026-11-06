
import { useCallback, useEffect, useState } from 'react';
import { getMeetingRequests } from '../api/meetingRequestsApi';
import type {
  MeetingRequestAction,
  MeetingRequestItem,
  MeetingRequestStatus,
} from '../types/meetingRequests';

export function useMeetingRequests(
  action: MeetingRequestAction,
  status?: MeetingRequestStatus,
  page = 1,
  limit = 20
) {
  const [requests, setRequests] = useState<MeetingRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadRequests() {
      setLoading(true);
      setError('');
      setRequests([]);

      try {
        const result = await getMeetingRequests(action, {
          status,
          page,
          limit,
        });

        if (active) {
          setRequests(result);
        }
      } catch (failure) {
        if (active) {
          setError(
            failure instanceof Error
              ? failure.message
              : 'No se pudieron consultar las solicitudes.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRequests();

    return () => {
      active = false;
    };
  }, [action, status, page, limit, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey(current => current + 1);
  }, []);

  return {
    requests,
    loading,
    error,
    refresh,
  };
}