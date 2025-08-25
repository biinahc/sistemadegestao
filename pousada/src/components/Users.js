import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import Footer from './Footer';
import Header from './Header';




export default function ProductsDemo() {
    let emptyProduct = {
        id: null,
        name: '',
        senha: '',
        perfil: '',
        status: null
    };


    const [products, setProducts] = useState(null);
    const [productDialog, setProductDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
    const [product, setProduct] = useState(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const status_user = [
        { name: 'Activo', value: 'Activo' },
        { name: 'Inativo', value: 'Inativo' }
    ];

    const perfil_user = [
        { name: 'Admin', value: 'Admin' },
        { name: 'Usuário', value: 'Usuário' }


    ];
     
  
    useEffect(() => {
        axios.get('http://localhost:8080/users')
            .then(response => setProducts(response.data))
    }, [product]);
 


    const openNew = () => {
        setProduct(emptyProduct);
        setSubmitted(false);
        setProductDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const hideDeleteProductsDialog = () => {
        setDeleteProductsDialog(false);
    };

    const saveProduct = () => {
        setSubmitted(true);

        if (product.name.trim()) {
            let _products = [...products];
            let _product = { ...product };

         

            if (product.id) {
                axios.put('http://localhost:8080/users/update/' + product.id, _product)
                    .then(response => {
                        {/*console.log(_product);*/ }
                        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuario Atualizado', life: 3000 });
                    })
                    .catch(error => {
                        console.log(error);
                    });

            } else {
                axios.post('http://localhost:8080/users/create', _product)
                    .then(response => {
                        {/*console.log(_product);*/ }
                        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuario criado', life: 3000 });
                    })
                    .catch(error => {
                        console.log(error);
                    });


            }

            setProducts(_products);
            setProductDialog(false);
            setProduct(emptyProduct);


        }


    };

    const editProduct = (product) => {
        setProduct({ ...product });
        setProductDialog(true);

    };

    const confirmDeleteProduct = (product) => {
        setProduct(product);
        setDeleteProductDialog(true);

    };

    const deleteProduct = () => {

        let _product = { ...product };


        axios.delete('http://localhost:8080/users/' + _product.id)
            .then(response => {

                toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuário excluído', life: 3000 });
            })
            .catch(error => {
                console.log(error);
            });

        setDeleteProductDialog(false);
        setProduct(emptyProduct);
        setProduct(_product);


    };


    const deleteSelectedProducts = () => {
        let ids = [];
        ids = selectedProducts.map(item => (item.id))


        axios.delete('http://localhost:8080/items/users', { data: { ids: ids } })
            .then(response => {

                toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuários excluídos', life: 3000 });

            })
            .catch(error => console.error(error));

        setDeleteProductsDialog(false);
        setSelectedProducts(null);
        setProduct(emptyProduct);


    };



    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteProductsDialog(true);
    };


    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...product };

        _product[`${name}`] = val;

        setProduct(_product);
    };




    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button className="btn btn-outline-success btn-md" label="Criar" icon="pi pi-plus" severity="success" onClick={openNew} />
                &nbsp;  &nbsp;  &nbsp;  &nbsp;
                <Button className="btn btn-outline-danger btn-md" label="Deletar" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Export" icon="pi pi-upload" className="btn btn-outline-info btn-md" onClick={exportCSV} />;
    };

    const centerToolbarTemplate = () => {
        return <h4 class="display-7">Usuários   <i class="fas fa-users"></i></h4>
    };

    const actionBodyTemplate = (product) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className=" btn btn-outline-info btn-sm" onClick={() => editProduct(product)} />
                &nbsp;
                <Button icon="pi pi-trash" rounded outlined severity="danger" className=" btn btn-outline-danger btn-sm" onClick={() => confirmDeleteProduct(product)} />
            </React.Fragment>
        );
    };


    const statusBodyTemplate = (product) => {
        return <Tag value={product.status} severity={getSeverity(product)}></Tag>;
    };

    const getSeverity = (product) => {
        switch (product.status) {
            case 'Activo':
                return 'success';

            case 'Inativo':
                return 'danger';


            default:
                return null;
        }
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">


            <IconField iconPosition="left" >
                <InputIcon className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </IconField>

        </div>
    );
    const productDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" className="btn btn-outline-danger btn-sm" icon="pi pi-times" outlined onClick={hideDialog} />
            &nbsp;
            <Button label="Salvar" className="btn btn-outline-success btn-sm" icon="pi pi-check" onClick={saveProduct} />
        </React.Fragment>
    );
    const deleteProductDialogFooter = (
        <React.Fragment>
            <Button label="Não" className="btn btn-outline-danger btn-sm" icon="pi pi-times" outlined onClick={hideDeleteProductDialog} />
            &nbsp;
            <Button label="Sim" className="btn btn-outline-success btn-sm" icon="pi pi-check" severity="danger" onClick={deleteProduct} />
        </React.Fragment>
    );
    const deleteProductsDialogFooter = (
        <React.Fragment>
            <Button label="Não" className="btn btn-outline-danger btn-sm" icon="pi pi-times" outlined onClick={hideDeleteProductsDialog} />
            &nbsp;
            <Button label="Sim" className="btn btn-outline-success btn-sm" icon="pi pi-check" severity="danger" onClick={deleteSelectedProducts} />
        </React.Fragment>
    );

    const dataTable = {
        margin: "auto",
        padding: "10px",
        width: "100%",
      
    };
    
       

    return (
        <div>
            <Header />
         <Toast ref={toast} />
            <br />

         

            <div style={dataTable}>
              
                <div className="card">
                    <Toolbar className="mb-4" left={leftToolbarTemplate} center={centerToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable ref={dt} value={products}  resizableColumns selection={selectedProducts} stripedRows onSelectionChange={(e) => setSelectedProducts(e.value)}
                        dataKey="id" paginator rows={8} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Página {first} a {last} de {totalRecords} produtos" globalFilter={globalFilter} header={header} scrollable scrollHeight="400px" >
                        <Column selectionMode="multiple" exportable={false}></Column>
                        <Column field="id" header="#" sortable style={{ minWidth: '8rem' }}></Column>
                        <Column field="name" header="Usuario" sortable style={{ minWidth: '8rem' }}></Column>
                       
                        <Column field="createdAt" header="Criado" sortable style={{ minWidth: '8rem' }}></Column>
                        <Column field="updatedAt" header="Editado" sortable style={{ minWidth: '8rem' }}></Column>
                        <Column field="perfil" header="Perfil" sortable style={{ minWidth: '8rem' }}></Column>
                        <Column field="status" header="Status" body={statusBodyTemplate} sortable style={{ minWidth: '7rem' }}></Column>
                        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '9rem' }}></Column>
                    </DataTable>

                </div>
            </div>
   
         
            {/************************************************************** MODALES ***************************************************************** */}


            <Dialog visible={productDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Usuario" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>


                <div className="field">
                    <label htmlFor="name" className="font-bold">
                        Nome de usuário
                    </label>
                    <InputText id="name" value={product.name} onChange={(e) => onInputChange(e, 'name')} required autoFocus className={classNames({ 'p-invalid': submitted && !product.name })} />
                    {submitted && !product.name && <small className="p-error">Nome é obrigatório.</small>}
                </div>
                <div className="field">

                {product.id ?
                  <InputText hidden id="senha" value={product.senha} onChange={(e) => onInputChange(e, 'senha')} required rows={2} cols={20} />  

                  :
                  <>
                    <label htmlFor="senha" className="font-bold">
                        Senha
                    </label>
                    <InputText id="senha" value={product.senha} onChange={(e) => onInputChange(e, 'senha')} required rows={2} cols={20} />
                    </>
                  }
                </div>

                <div className="field">
                    <label htmlFor="status" className="font-bold">
                        Status
                    </label>
                    <Dropdown className="w-full md:w-14rem" id="status" options={status_user} optionLabel="name" value={product.status} onChange={(e) => onInputChange(e, 'status')}

                    />
                </div>


                <div className="field">
                    <label htmlFor="perfil" className="font-bold">
                        Perfil
                    </label>
                    <Dropdown className="w-full md:w-14rem" id="perfil" options={perfil_user} optionLabel="name" value={product.perfil} onChange={(e) => onInputChange(e, 'perfil')}

                    />
                </div>

            </Dialog>

            <Dialog visible={deleteProductDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmar" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {product && (
                        <span>
                            Tem certeza de que quer excluir o usuario : <b>{product.name}</b>?
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog visible={deleteProductsDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmar" modal footer={deleteProductsDialogFooter} onHide={hideDeleteProductsDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {product && <span>Tem certeza de que quer excluir os usuarios seleccionados?</span>}
                </div>
            </Dialog>

            <Footer />
        </div>
    );
}
