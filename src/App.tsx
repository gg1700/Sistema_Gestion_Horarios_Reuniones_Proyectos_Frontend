import { BrowserRouter } from 'react-router';
import RouterPage from './routes/Index.routes';
import { AppProviders } from './contexts/AppProviders';
import { MemberIdentityProvider } from './features/github/MemberIdentityContext';

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <MemberIdentityProvider>
          <RouterPage />
        </MemberIdentityProvider>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;