import { BrowserRouter } from 'react-router';
import RouterPage from './routes/Index.routes';
import { AppProviders } from './contexts/AppProviders';
import { MockFlowProvider } from './contexts/MockFlowContext';
import { AuthProvider } from './features/auth/AuthContext';

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AuthProvider><MockFlowProvider><RouterPage /></MockFlowProvider></AuthProvider>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
