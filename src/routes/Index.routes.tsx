
import { Routes, Route } from "react-router";
import MainMenu from "../pages/MainMenu";
import RepositoriesPreview from "../pages/RepositoriesPreview";
import RepositorySelectionPreview from "../pages/RepositorySelectionPreview";

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
    </Routes>
  );
}

export default RouterPage;
