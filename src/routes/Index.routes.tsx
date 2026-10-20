import { Routes, Route } from 'react-router';
import MainMenu from '../pages/MainMenu';
import ConnectedServicesPage from '../pages/ConnectedServicesPage';

function RouterPage() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route
        path="/servicios-conectados"
        element={<ConnectedServicesPage />}
      />
    </Routes>
  );
}

export default RouterPage;
