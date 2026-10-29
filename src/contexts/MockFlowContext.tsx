import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { createInitialFlow, transitionFlow, type FlowState, type FlowAction } from '../mocks/flow';
import { createInitialAccount } from '../mocks/account';

const STORAGE_KEY = 'orbitia-screen-mocks-v1';
function loadMock(): FlowState {
  try {
    const stored: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');
    if (stored && typeof stored === 'object' && 'version' in stored && stored.version === 1 &&
      'profile' in stored && stored.profile && typeof stored.profile === 'object' && 'name' in stored.profile &&
      'meetings' in stored && Array.isArray(stored.meetings) && 'requests' in stored && Array.isArray(stored.requests) && 'changes' in stored && Array.isArray(stored.changes)) {
      // Migración de la tanda anterior: conservar agenda y decisiones ya revisadas.
      const initial = createInitialFlow();
      const account = 'account' in stored && stored.account && typeof stored.account === 'object' ? stored.account : {};
      return { ...stored, meetings: stored.meetings.map(meeting => ({ ...meeting, calendarId: meeting.calendarId ?? 'personal' })), requests: stored.requests.map(request => ({ ...request, calendarId: request.calendarId ?? 'personal' })), account: { ...createInitialAccount(), ...account }, calendarEvents: 'calendarEvents' in stored && Array.isArray(stored.calendarEvents) ? stored.calendarEvents : initial.calendarEvents } as FlowState;
    }
  } catch { /* Almacenamiento bloqueado o datos de una demostración antigua. */ }
  return createInitialFlow();
}

const MockFlowContext = createContext<{ state: FlowState; dispatch: (action: FlowAction) => void } | null>(null);

export function MockFlowProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(loadMock);
  const latest = useRef(state);
  const dispatch = useCallback((action: FlowAction) => {
    const next = transitionFlow(latest.current, action);
    latest.current = next;
    setState(next);
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* El flujo también funciona en memoria. */ }
  }, [state]);
  return <MockFlowContext.Provider value={{ state, dispatch }}>{children}</MockFlowContext.Provider>;
}

export function useMockFlow() {
  const context = useContext(MockFlowContext);
  if (!context) throw new Error('El flujo visual requiere MockFlowProvider.');
  return context;
}
