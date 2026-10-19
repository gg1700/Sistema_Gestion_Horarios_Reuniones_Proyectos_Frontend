import { Routes, Route } from 'react-router';
import MainMenu from '../pages/MainMenu';
import OAuthLoginPage from '../pages/OAuthLoginPage';
import OAuthCallbackPage from '../pages/OAuthCallbackPage';

function RouterPage() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/login" element={<OAuthLoginPage />} />
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />
    </Routes>
  );
}

export default RouterPage;
