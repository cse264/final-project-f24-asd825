import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Protected from './components/Protected';
import AppLayout from './components/AppLayout';
import MoviePage from './components/MoviePage';

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={ <AppLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="protected" element={<PrivateRoute><Protected /> </PrivateRoute>} />
            <Route path="/movie/:id" element={<PrivateRoute> <MoviePage /> </PrivateRoute>}/>  
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
