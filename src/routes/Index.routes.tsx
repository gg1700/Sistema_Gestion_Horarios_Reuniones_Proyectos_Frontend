import { Routes, Route } from 'react-router';
import MainMenu from '../pages/MainMenu';
import PublicProfilePage from '../pages/PublicProfilePage';

function RouterPage() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/:publicHandle" element={<PublicProfilePage />} />
    </Routes>
  );
}

export default RouterPage;
