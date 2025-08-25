import React, { useState, useEffect, useRef } from 'react';
import { Outlet} from "react-router-dom";
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
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import "primereact/resources/themes/lara-light-cyan/theme.css";






function Categorias() {


  const [nome, setNome] = useState('');
  const [categoriaDialog, setCategoriaDialog] = useState(false);
  const toast = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState('');
  const dt = useRef(null);
  const [deleteCategoriaDialog, setDeleteCategoriaDialog] = useState(false);
  const [products, setProducts] = useState(null);


  useEffect(() => {
    axios.get('http://localhost:8080/categorias')
      .then(response => setCategorias(response.data))
      .catch(error => {
        console.error("Error al obtener categorias:", error);
      });

  }, [categoria, nome]);


  useEffect(() => {
    axios.get('http://localhost:8080/produtos')
      .then(response => setProducts(response.data));
  }, []);


    // Función para eliminar acentos
    const removeAccents = (string) => {
        return string
            .normalize('NFD') // Normaliza el string
            .replace(/[\u0300-\u036f]/g, ''); // Elimina los caracteres de acento
      };

  // Capitalizar solo la primera letra 
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };


  


  const saveCategoria = () => {
    setSubmitted(true);
     const categoriaExiste = categorias.some(categoria => categoria.nome === nome);

    if (categoriaExiste) {
      toast.current.show({ severity: 'warn', summary: 'Observação', detail: 'Categoria já exite', life: 3000 });

    } else {
      
      if (nome) {
        const nomeSemacentos = removeAccents(nome);
        const upperNome = capitalizeFirstLetter(nomeSemacentos);
        axios.post('http://localhost:8080/categorias/create', { nome:upperNome })
          .then(response => {
            toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Categoria criada', life: 3000 });
          })
          .catch(error => {
            console.log(error);
          });

        setNome('');
        setCategoriaDialog(false);


      } else {

        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error', life: 3000 });

      }
    }
  }


  const deleteCategoria = () => {

    let _categoria = { ...categoria };
 


    const categoriaExiste = products.some(product => product.tipo_producto === _categoria.nome);

    if (categoriaExiste) {
      toast.current.show({ severity: 'warn', summary: 'Observação', detail: 'Categoria em uso ', life: 3000 });

    } else {

      axios.delete('http://localhost:8080/categorias/' + _categoria.id)
        .then(response => {

          toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Categoria excluida', life: 3000 });
        })
        .catch(error => {
          console.log(error);
        });

      setCategoria('');
      setDeleteCategoriaDialog(false);

    }

  };


  const openNew = () => {
    setSubmitted(false);
    setCategoriaDialog(true);
  };


  const link = {
    textDecoration: 'none',
    color: '#FFFFFF'
  };

  const hideDialog = () => {
    setSubmitted(false);
    setCategoriaDialog(false);
  };


  const handleNome = (event) => {
    setNome(event.target.value);

  };

  const hideDeleteCategoriaDialog = () => {
    setDeleteCategoriaDialog(false);
  };

  const confirmDeleteCategorias = (categorias) => {
    setCategoria(categorias);
    setDeleteCategoriaDialog(true);

  };


  const categoriaDialogFooter = (
    <React.Fragment>
      <Button label="Cancelar" className="btn btn-outline-danger btn-sm" icon="pi pi-times" outlined onClick={hideDialog} />
      &nbsp;
      <Button label="Salvar" className="btn btn-outline-success btn-sm" icon="pi pi-check" onClick={saveCategoria} />
    </React.Fragment>
  );

  const deleteCategoriaDialogFooter = (
    <React.Fragment>
      <Button label="Não" className="btn btn-outline-danger btn-sm" icon="pi pi-times" outlined onClick={hideDeleteCategoriaDialog} />
      &nbsp;
      <Button label="Sim" className="btn btn-outline-success btn-sm" icon="pi pi-check" severity="danger" onClick={deleteCategoria} />
    </React.Fragment>
  );


  const dataTable = {
    margin: "auto",
    padding: "10px",
    width: "100%",
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <h4 className="display-7">Categorias <i className="fas fa-list"></i></h4>
      </div>
    );
  };


  const actionBodyTemplate = (categorias) => {
    return (
      <React.Fragment>
        <Button icon="pi pi-trash" rounded outlined severity="danger" className=" btn btn-outline-danger btn-sm" onClick={() => confirmDeleteCategorias(categorias)} />
      </React.Fragment>
    );
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
                <img src="https://media.istockphoto.com/id/2153987538/es/foto/business-performance-monitoring-and-evaluation-concept-take-an-assessment-business-man-using.jpg?s=612x612&w=0&k=20&c=SMF2mivD0CKRggrWJV-bJDGKU8ToBobBtpL--e1A7Qs=" className="img-fluid" />
                <a href="#!">
                  <div className="mask" style={{ background: '#87CEEB' }}></div>
                </a>
              </div>
              <div className="card-body ">
                <h5 className="card-title"></h5>
                <p className="card-text"></p>
                <Button className="btn btn-info btn-lg" label="Criar nova Categoria" style={link} icon="pi pi-plus" severity="info" onClick={openNew} />
              </div>
            </div>
          </div>
           

          <div className="col">
            <div className="card">

              <div style={dataTable}>

                <div className="card">
                  <Toolbar className="mb-4" left={leftToolbarTemplate}  ></Toolbar>

                  <DataTable ref={dt} value={categorias} dataKey="id" className="datatable-responsive" scrollable scrollHeight="350px" >

                    <Column field="id" header="#" sortable style={{ maxWidth: '10px' }}></Column>
                    <Column field="nome" header="Categoria" sortable style={{ maxWidth: '50px' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ maxWidth: '10px' }}></Column>
                  </DataTable>

                </div>
              </div>


            </div>
          </div>


        </div>

      </div>

      <Outlet />
      <Footer />

      <Dialog visible={categoriaDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Categoria" modal className="p-fluid" footer={categoriaDialogFooter} onHide={hideDialog}>


        <div className="field">
          <label htmlFor="name" className="font-bold">
            Nome de categoria
          </label>
          <InputText required id="nome" name="nome" value={nome} onChange={handleNome} className={classNames({ 'p-invalid': submitted && !nome })} />
          {submitted && !nome && <small className="p-error">Nome é obrigatorio.</small>}

        </div>

      </Dialog>
      <Dialog visible={deleteCategoriaDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmar" modal footer={deleteCategoriaDialogFooter} onHide={hideDeleteCategoriaDialog}>
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem',color: 'red'}} />
          {categoria.nome && (
            <span>
              Tem certeza que quer a exclusão da categoria: <b>{categoria.nome}</b>?
            </span>
          )}
        </div>
      </Dialog>



    </div>



  );

}

export default Categorias;
