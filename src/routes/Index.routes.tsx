
import { Routes, Route } from "react-router";
import MainMenu from "../pages/MainMenu";
import RepositoriesPreview from "../pages/RepositoriesPreview";
import RepositorySelectionPreview from "../pages/RepositorySelectionPreview";
import ProfileVisibilitySettings from "../pages/ProfileVisibilitySettings";
import ProfilePreview from "../pages/ProfilePreview";
import PublicProfilePage from '../pages/PublicProfilePage';
import PublicLinkPage from '../pages/PublicLinkPage';

function RouterPage() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route
        path="/repositories-preview"
        element={<RepositoriesPreview />}
      />
      <Route
        path="/repository-selection-preview"
        element={<RepositorySelectionPreview />}
      />
      <Route
        path="/profile-visibility"
        element={<ProfileVisibilitySettings />}
      />
      <Route
        path="/profile-preview"
        element={<ProfilePreview />}
      />
      <Route 
        path="/:publicHandle" element={<PublicProfilePage />} />
      <Route
        path="/perfil/enlace-publico"
        element={<PublicLinkPage />}
      />
    </Routes>
  );
}

export default RouterPage;
