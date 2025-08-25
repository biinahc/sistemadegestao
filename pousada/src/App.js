import Home from './components/Home';
import Home_user from './components/Home_user';
import Users from './components/Users';
import Produtos from './components/Produtos';
import Login from './components/Login';
import Categorias from './components/Categorias';
import Senhas from './components/Senhas';
import TabelaDePreco from './components/tabela-de-preco';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';





function App() {



  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);


  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('token', isAuthenticated);
  };

  const handleAdmin = () => {
    setIsAdmin(true);
    localStorage.setItem('token', isAdmin);

  };

  useEffect(() => {
    // Verifica si el token está en localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setIsAdmin(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };





  return (
    <div>

      <Router>

        <Routes>

          <Route path="/" element={<Login onLogin={handleLogin} onAdmin={handleAdmin} onLogout={handleLogout} />} />
          <Route path="/home" element={isAdmin ? <Home /> : <Navigate to="/" />} />
          <Route path="/home_user" element={isAuthenticated ? <Home_user /> : <Navigate to="/" />} />
          <Route path="/usuarios" element={<Users />} />
          <Route path="/produtos/:flag" element={<Produtos />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/senhas" element={<Senhas />} />
          <Route path="/tabela-de-preco" element={<TabelaDePreco />} />



        </Routes>

      </Router>

    </div>
  );
}

export default App;
