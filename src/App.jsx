import { useContext } from 'react';
import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Statistics from './pages/Statistics.jsx';;
import Users from './pages/Users.jsx';
import NotFound from './pages/NotFound.jsx';
import FCM from './pages/FCM.jsx';
import Schedule from './pages/Schedule.jsx';
import Blog from './pages/Blog.jsx';
import ChangePassword from './component/ChangePassword.jsx';

import { AuthContext } from './context/AuthContext.jsx';

function App() {
  const { currentUser } = useContext(AuthContext);

  const RequireAuth = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>}>
          {/* Default Route */}
          <Route index element={<Statistics />} />
          {/* Nested Routes */}
          <Route path="statistics" element={<Statistics />} />
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
