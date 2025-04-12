import { useContext } from 'react';
import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard.tsx';
import Login from './pages/Login.tsx';
import Users from './pages/Users.tsx';
import NotFound from './pages/NotFound.tsx';
import FCM from './pages/FCM.tsx';
import Schedule from './pages/Schedule.tsx';
import Blog from './pages/Blog.tsx';
import ChangePassword from './component/ChangePassword.tsx';
import Welcome from './pages/Welcome.tsx';

import { AuthContext } from './context/AuthContextInstance.tsx';

/**
 * Renders the main application routing and enforces authentication for protected routes.
 *
 * This component sets up routing using React Router. It defines a nested authentication guard that checks
 * if the current user is valid (by verifying the presence and type of the user's email). When authenticated,
 * the dashboard and its nested routes (Welcome, Blog, Schedule, Users, FCM, ChangePassword) are accessible;
 * otherwise, the user is redirected to the login page. Public routes for login and a fallback NotFound page
 * are also provided.
 *
 * @returns A JSX element representing the configured routing for the application.
 */
function App() {
  const { currentUser } = useContext(AuthContext);

  const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isValidUser = currentUser && typeof currentUser.email === "string";
    return isValidUser ? children : <Navigate to="/login" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>}>
          {/* Default Route */}
          <Route index element={<Welcome />} />
          {/* Nested Routes */}
          <Route path="blogs" element={<Blog />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="users" element={<Users />} />
          <Route path="fcm" element={<FCM />} />
          <Route path="password" element={<ChangePassword />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
