import { Routes, Route } from 'react-router';
import MainMenu from '../pages/MainMenu';
import PublicLinkPage from '../pages/PublicLinkPage';

function RouterPage() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route
        path="/perfil/enlace-publico"
        element={<PublicLinkPage />}
      />
    </Routes>
  );
}

export default RouterPage;
