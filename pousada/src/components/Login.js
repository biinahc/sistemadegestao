import React, { useState } from 'react';
import { Button } from 'primereact/button';
import Logo from './login.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login({ onLogin, onAdmin }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleUsuario = (event) => {
    setUsuario(event.target.value);
  };

  const handleSenha = (event) => {
    setSenha(event.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/login', {
        name: usuario,
        senha,
      });

      if (response.status === 200) {
        // Admin
        onAdmin();
        navigate('/home');
      } else if (response.status === 202) {
        // Usuário comum
        onLogin();
        navigate('/home_user', { state: 'Usuario' });
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;

        if (status === 401) {
          toast.warning('Usuário inativo', { theme: 'colored' });
        } else if (status === 404 && usuario === '') {
          toast.warning('Campo Usuário é obrigatório', { theme: 'colored' });
        } else if (status === 404 && senha === '') {
          toast.warning('Campo Senha é obrigatório', { theme: 'colored' });
        } else if (status === 404) {
          toast.error('Usuário não encontrado.', { theme: 'colored' });
        } else if (status === 403) {
          toast.error('Senha incorreta.', { theme: 'colored' });
        }
      } else {
        toast.error('Erro ao conectar com o servidor.', { theme: 'colored' });
      }
    }
  };

  return (
    <>
      <div className="login container mb-2">
        <div className="row justify-content-center">
          <div className="col-15 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4">
            <div className="mb-4">
              <div className="text-center mb-2">
                <img
                  src={Logo}
                  alt="Logo"
                  width="150"
                  height="150"
                />
              </div>
              <h1 className="text-center mb-3">Sistema de Controle</h1>
            </div>

            <form className="form rounded-bottom border-light p-3" onSubmit={handleLogin}>
              <h4 className="p-1 text-center">Entrar</h4>
              <div className="row gy-3 overflow-hidden">
                <div className="col-12">
                  <div className="form-floating mb-2">
                    <input
                      type="text"
                      required
                      className="form-control"
                      name="usuario"
                      value={usuario}
                      onChange={handleUsuario}
                      id="usuario"
                      placeholder="Usuário"
                    />
                    <label htmlFor="usuario" className="form-label">Usuário</label>
                  </div>
                </div>

                <div className="col-12">
                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className="form-control"
                      name="senha"
                      id="senha"
                      value={senha}
                      onChange={handleSenha}
                      placeholder="Senha"
                      required
                    />
                    <label htmlFor="senha" className="form-label">Senha</label>
                  </div>
                  <div id="emailHelp" className="form-text text-danger text-center">
                    Problemas para acessar? Contato: 99968-1046!
                  </div>
                </div>

                <div className="col-12">
                  <div className="d-grid">
                    <Button
                      type="submit"
                      label="Entrar"
                      className="btn btn-primary"
                      icon="pi pi-user"
                    />
                    <ToastContainer />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
