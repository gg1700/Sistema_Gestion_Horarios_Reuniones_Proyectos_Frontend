
import { Routes, Route } from "react-router";
import MainMenu from "../pages/MainMenu";
import RepositoriesPreview from "../pages/RepositoriesPreview";
import RepositorySelectionPreview from "../pages/RepositorySelectionPreview";
import ProfileVisibilitySettings from "../pages/ProfileVisibilitySettings";

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
    </Routes>
  );
}

export default RouterPage;
