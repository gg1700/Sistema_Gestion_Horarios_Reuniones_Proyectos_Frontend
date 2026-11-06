
import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { createInitialFlow, transitionFlow, type FlowState, type FlowAction } from '../mocks/flow';
import { createInitialAccount } from '../mocks/account';

const STORAGE_KEY = 'orbitia-screen-mocks-v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function loadMock(): FlowState {
  try {
    const stored: unknown = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) ?? 'null'
    );

    if (
      !isRecord(stored) ||
      stored.version !== 1 ||
      !isRecord(stored.profile) ||
      typeof stored.profile.name !== 'string' ||
      !Array.isArray(stored.meetings) ||
      !stored.meetings.every(isRecord) ||
      !Array.isArray(stored.requests) ||
      !stored.requests.every(isRecord)
    ) {
      return createInitialFlow();
    }

    const initial = createInitialFlow();

    const account = isRecord(stored.account)
      ? stored.account
      : {};

    const meetings = stored.meetings.map(meeting => ({
      ...meeting,
      calendarId:
        typeof meeting.calendarId === 'string'
          ? meeting.calendarId
          : 'personal'
    }));

    const requests = stored.requests.map(request => ({
      ...request,
      calendarId:
        typeof request.calendarId === 'string'
          ? request.calendarId
          : 'personal'
    }));

    return {
      ...initial,
      ...stored,
      meetings,
      requests,
      account: {
        ...createInitialAccount(),
        ...account
      },
      calendarEvents:
        Array.isArray(stored.calendarEvents)
          ? stored.calendarEvents
          : initial.calendarEvents
    } as FlowState;
  } catch {
    return createInitialFlow();
  }
}

const MockFlowContext = createContext<{
  state: FlowState;
  dispatch: (action: FlowAction) => void;
} | null>(null);

export function MockFlowProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(loadMock);
  const latest = useRef(state);

  const dispatch = useCallback((action: FlowAction) => {
    const next = transitionFlow(latest.current, action);
    latest.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
    }
  }, [state]);

  return (
    <MockFlowContext.Provider value={{ state, dispatch }}>
      {children}
    </MockFlowContext.Provider>
  );
}

export function useMockFlow() {
  const context = useContext(MockFlowContext);

  if (!context) {
    throw new Error('El flujo visual requiere MockFlowProvider.');
  }

  return context;
}