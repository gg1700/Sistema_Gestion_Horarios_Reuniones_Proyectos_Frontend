import { BrowserRouter } from 'react-router';
import RouterPage from './routes/Index.routes';
import { AppProviders } from './contexts/AppProviders';
import { MockFlowProvider } from './contexts/MockFlowContext';

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <MockFlowProvider><RouterPage /></MockFlowProvider>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
