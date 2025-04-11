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

function App() {
  const { currentUser } = useContext(AuthContext);

  const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
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
