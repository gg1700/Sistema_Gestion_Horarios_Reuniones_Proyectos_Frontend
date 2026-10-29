import { BrowserRouter } from 'react-router';
import RouterPage from './routes/Index.routes';
import { AppProviders } from './contexts/AppProviders';
import { MockFlowProvider } from './contexts/MockFlowContext';
import { MemberIdentityProvider } from './features/github/MemberIdentityContext';

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <MockFlowProvider><MemberIdentityProvider><RouterPage /></MemberIdentityProvider></MockFlowProvider>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
