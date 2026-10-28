import { Routes, Route } from 'react-router';
import MainMenu from '../pages/MainMenu';
import RegisterPage from '../pages/RegisterPage';
import CompleteProfilePage from '../pages/CompleteProfilePage';
import PublicProfilePage from '../pages/PublicProfilePage';
import PublicLinkPage from '../pages/PublicLinkPage';
import { routePaths } from '../constants/routes';

function RouterPage() {
  return (
    <Routes>
      <Route path={routePaths.home} element={<MainMenu />} />
      <Route path={routePaths.register} element={<RegisterPage />} />
      <Route path={routePaths.completeProfile} element={<CompleteProfilePage />} />
      <Route path="/:publicHandle" element={<PublicProfilePage />} />
      <Route
        path="/perfil/enlace-publico"
        element={<PublicLinkPage />}
      />
    </Routes>
  );
}

export default RouterPage;
