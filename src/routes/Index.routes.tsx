
import { Routes, Route } from "react-router";
import MainMenu from "../pages/MainMenu";
import RepositoriesPreview from "../pages/RepositoriesPreview";

function RouterPage() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route
        path="/repositories-preview"
        element={<RepositoriesPreview />}
      />
    </Routes>
  );
}

export default RouterPage;
