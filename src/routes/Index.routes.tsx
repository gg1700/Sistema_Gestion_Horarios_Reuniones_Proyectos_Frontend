import { Routes, Route } from 'react-router';
import MainMenu from '../pages/MainMenu';
import PublicProfilePage from '../pages/PublicProfilePage';
import PublicLinkPage from '../pages/PublicLinkPage';

function RouterPage() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/:publicHandle" element={<PublicProfilePage />} />
      <Route
        path="/perfil/enlace-publico"
        element={<PublicLinkPage />}
      />
    </Routes>
  );
}

export default RouterPage;
