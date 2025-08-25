import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link } from "react-router-dom";
import Header from './Header';
import Footer from './Footer';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import "primereact/resources/themes/lara-light-cyan/theme.css";






function Senhas() {

    let empty = {
        id: null,
        name: ''
    };




    const [categoriaDialog, setCategoriaDialog] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const [submitted, setSubmitted] = useState(false);
    const [usuarios, setUsuarios] = useState([]);
    const [usuario, setUsuario] = useState(empty);
    const dt = useRef(null);
    const [senha, setSenha] = useState('');


    useEffect(() => {
        axios.get('http://localhost:8080/users')
            .then(response => setUsuarios(response.data))
            .catch(error => {
                console.error("Error al obtener categorias:", error);
            });

    }, [usuario]);



    const updateSenha = () => {
        setSubmitted(true);

        let _senha = senha
        if (senha) {
            axios.put('http://localhost:8080/senha/update/' + usuario.id, { senha })
                .then(response => {

                    toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuario Atualizado', life: 3000 });
                })
                .catch(error => {
                    console.log(error);
                });


            setUsuario(empty);
            setCategoriaDialog(false);

        } else {

            toast.current.show({ severity: 'error', summary: 'Error', detail: '', life: 3000 });

        }


    }




    const editSenha = (usuarios) => {
        setUsuario({ ...usuarios });
        setCategoriaDialog(true);

    };


    const hideDialog = () => {
        setSubmitted(false);
        setCategoriaDialog(false);
    };




    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _usuario = { ...usuario };

        _usuario[`${name}`] = val;

        setUsuario(_usuario);
    };


    const handleSenha = (event) => {
        setSenha(event.target.value);
    };

    const categoriaDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" className="btn btn-outline-danger btn-sm" icon="pi pi-times" outlined onClick={hideDialog} />
            &nbsp;
            <Button label="Salvar" className="btn btn-outline-success btn-sm" icon="pi pi-check" onClick={updateSenha} />
        </React.Fragment>
    );


    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <h4 className="display-7">redefinindo Senhas de usuarios <i className="fas fa-lock"></i></h4>
            </div>
        );
    };
    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">


            <IconField iconPosition="left" >
                <InputIcon className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </IconField>

        </div>
    );

    const actionBodyTemplate = (usuarios) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-replay" rounded outlined severity="warning" className=" btn btn-outline-warning btn-sm" onClick={() => editSenha(usuarios)} />
            </React.Fragment>
        );
    };


    const dataTable = {
        margin: "auto",
        padding: "20px",
        width: "100%",
    };



    return (

        <div>
            <Header />
             <Toast ref={toast} />

            <br />
            <br />
            <br />


            <div className="container text-center">


                <div className="row justify">
                   

                    <div className="col-sm-4">
                        <div className="card">
                            <div className="bg-image hover-overlay" data-mdb-ripple-init data-mdb-ripple-color="light">
                                <img src="https://media.istockphoto.com/id/1450730292/es/foto/candado-en-el-teclado-de-la-computadora-seguridad-de-red-seguridad-de-datos-y-protecci%C3%B3n.jpg?s=612x612&w=0&k=20&c=xLI-zMks4mGYAV5nNWQddCb46qTjscUcu0S-zK1Z8DU=" className="img-fluid" />
                                <a href="#!">
                                    <div className="mask" style={{ background: '#87CEEB' }}></div>
                                </a>
                            </div>
                            <div className="card-body">
                                <h5 className="card-title"></h5>
                                <p className="card-text"></p>

                            </div>
                        </div>


                    </div>

                    <div className="col">
                        <div className="card">

                            <div style={dataTable}>

                                <Toolbar className="mb-4" left={leftToolbarTemplate}  ></Toolbar>

                                <DataTable ref={dt} value={usuarios} dataKey="id" className="datatable-responsive" scrollable scrollHeight="350px" header={header} globalFilter={globalFilter} >


                                    <Column field="name" header="Usuario" sortable style={{ maxWidth: '100px' }}></Column>
                                    <Column field="senha" header="Senha encriptada" sortable style={{ maxWidth: '180px' }}></Column>
                                    <Column header="Redefinir" body={actionBodyTemplate} exportable={false} style={{ maxWidth: '80px' }}></Column>
                                </DataTable>

                                <div className="card">


                                </div>
                            </div>



                        </div>
                    </div>


                </div>

            </div>

            <Outlet />
            <Footer />

            <Dialog visible={categoriaDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Redefinir senha" modal className="p-fluid" footer={categoriaDialogFooter} onHide={hideDialog}>


                <div className="field">
                    <label htmlFor="name" className="font-bold">
                        Usuário:
                    </label>
                    <InputText disabled id="name" name="name" value={usuario.name} onChange={(e) => onInputChange(e, 'name')} />


                </div>
                <br />

                <div className="field">
                    <label htmlFor="senha" className="font-bold">
                        Nova senha:
                    </label>

                    <InputText required id="senha" name="senha" value={senha} onChange={handleSenha} className={classNames({ 'p-invalid': submitted && !senha })} />
                    {submitted && !senha && <small className="p-error">Senha é obligatoria.</small>}

                </div>

            </Dialog>




        </div>



    );

}

export default Senhas;
