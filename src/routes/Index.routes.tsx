import { Routes, Route } from 'react-router';
import MainMenu from '../pages/MainMenu';
import RegisterPage from '../pages/RegisterPage';
import { routePaths } from '../constants/routes';

function RouterPage() {
  return (
    <Routes>
      <Route path={routePaths.home} element={<MainMenu />} />
      <Route path={routePaths.register} element={<RegisterPage />} />
    </Routes>
  );
}

export default RouterPage;
