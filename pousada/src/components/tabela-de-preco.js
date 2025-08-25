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
import Header from './Header';
import Header_user from './Header_user';
import Footer from './Footer';
import { useParams } from 'react-router-dom';

export default function TabelaDePreco() {
    let emptyProduct = {
        id: null,
        nome: '',
        lt_kl_unid: '',
        marca: '',
        status: '0',
        cost: '0.00',
        price_cash: '0.00',
        price_card: '0.00',
        quantidade_vendida: '',
        forma_pagamento: null
    };

    const [products, setProducts] = useState(null);
    const [precoDialog, setPrecoDialog] = useState(false);
    const [deletePrecoDialog, setDeletePrecoDialog] = useState(false);
    const [vendaDialog, setVendaDialog] = useState(false);
    const [product, setProduct] = useState(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const { flag } = useParams();

    const formas_pagamento = [
        { name: 'Dinheiro', value: 'Dinheiro' },
        { name: 'Cartão', value: 'Cartão' }
    ];

    useEffect(() => {
        axios.get('http://localhost:8080/produtos')
            .then(response => {
                const updatedProducts = response.data.map(p => ({
                    ...p,
                    cost: p.cost || '0.00',
                    price_cash: p.price_cash || '0.00',
                    price_card: p.price_card || '0.00'
                }));
                setProducts(updatedProducts);
            })
            .catch(error => {
                console.error("Erro ao buscar dados dos produtos:", error);
                toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar dados.', life: 3000 });
            });
    }, [product]);

    const hideDialog = () => {
        setSubmitted(false);
        setPrecoDialog(false);
        setDeletePrecoDialog(false);
        setVendaDialog(false);
    };

    const editPreco = (product) => {
        setProduct({ ...product });
        setPrecoDialog(true);
    };

    const savePreco = () => {
        setSubmitted(true);
        let _product = { ...product };
        if (_product.cost && _product.price_cash && _product.price_card) {
            axios.put('http://localhost:8080/produtos/update/' + _product.id, _product)
                .then(() => {
                    toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Preços atualizados!', life: 3000 });
                    setPrecoDialog(false);
                    setProduct(emptyProduct);
                    axios.get('http://localhost:8080/produtos').then(response => setProducts(response.data));
                })
                .catch(error => {
                    toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar preços.', life: 3000 });
                });
        } else {
            toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Todos os campos de preço são obrigatórios.', life: 3000 });
        }
    };

    const confirmDeletePreco = (product) => {
        setProduct(product);
        setDeletePrecoDialog(true);
    };

    const deletePreco = () => {
        let _product = { ...product, cost: '0.00', price_cash: '0.00', price_card: '0.00' };
        axios.put('http://localhost:8080/produtos/update/' + _product.id, _product)
            .then(() => {
                toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Preços excluídos!', life: 3000 });
                setDeletePrecoDialog(false);
                setProduct(emptyProduct);
                axios.get('http://localhost:8080/produtos').then(response => setProducts(response.data));
            })
            .catch(error => {
                console.log(error);
                toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir preços.', life: 3000 });
            });
    };

    const vendaProduto = (product) => {
        setProduct({ ...product, quantidade_vendida: '', forma_pagamento: null });
        setVendaDialog(true);
    };

    const saveVenda = () => {
        setSubmitted(true);
        const { quantidade_vendida, forma_pagamento, status, id } = product;

        if (quantidade_vendida === '' || forma_pagamento === null) {
            toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos.', life: 3000 });
            return;
        }

        if (parseFloat(quantidade_vendida) > parseFloat(status)) {
            toast.current.show({ severity: 'warn', summary: 'Observação', detail: 'Quantidade vendida é maior que a quantidade em estoque.', life: 4000 });
            return;
        }

        const newStatus = parseFloat(status) - parseFloat(quantidade_vendida);
        const updatedProduct = { ...product, status: newStatus.toString() };

        axios.put('http://localhost:8080/produtos/venda/' + id, updatedProduct)
            .then(() => {
                toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Venda registrada e estoque atualizado!', life: 3000 });
                setVendaDialog(false);
                setProduct(emptyProduct);
                axios.get('http://localhost:8080/produtos').then(response => setProducts(response.data));
            })
            .catch(error => {
                console.error("Erro ao registrar venda:", error);
                toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao registrar venda.', life: 3000 });
            });
    };

    const onInputChange = (e, name) => {
        const val = e.target.value;
        setProduct(prevProduct => ({ ...prevProduct, [name]: val }));
    };

    const onInputNumberChange = (e, name) => {
        const newValue = e.target.value;
        if (newValue === '' || /^\d+(\.\d{0,2})?$/.test(newValue)) {
            setProduct(prevProduct => ({ ...prevProduct, [name]: newValue }));
        }
    };

    const onInputIntegerChange = (e, name) => {
        const newValue = e.target.value;
        if (newValue === '' || /^\d+$/.test(newValue)) {
            setProduct(prevProduct => ({ ...prevProduct, [name]: newValue }));
        }
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const centerToolbarTemplate = () => {
        return <h4 className="display-7">Tabela de Preços <i className="fas fa-money-check-alt"></i></h4>;
    };

    const rightToolbarTemplate = () => {
        return <Button label="Exportar" icon="pi pi-upload" className="btn btn-outline-info btn-md" onClick={exportCSV} />;
    };

    const actionBodyTemplate = (product) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-shopping-cart" rounded outlined severity="success" className="btn btn-outline-success btn-sm mr-2" onClick={() => vendaProduto(product)} />
                <Button icon="pi pi-pencil" rounded outlined className="btn btn-outline-info btn-sm mr-2" onClick={() => editPreco(product)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" className="btn btn-outline-danger btn-sm" onClick={() => confirmDeletePreco(product)} />
            </React.Fragment>
        );
    };

    const totalCostBodyTemplate = (rowData) => {
        const total = (parseFloat(rowData.status) || 0) * (parseFloat(rowData.cost) || 0);
        return `R$ ${total.toFixed(2)}`;
    };

    const statusBodyTemplate = (product) => {
        return <Tag value={product.status} severity={getSeverity(product)}></Tag>;
    };

    const getSeverity = (product) => {
        if (parseFloat(product.status) > parseFloat(product.quantidade_minima)) {
            return 'success';
        } else if (parseFloat(product.status) <= parseFloat(product.quantidade_minima)) {
            return 'danger';
        }
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </IconField>
        </div>
    );
    
    const precoDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" className="btn btn-outline-danger btn-sm" icon="pi pi-times" outlined onClick={hideDialog} />
            &nbsp;
            <Button label="Salvar" className="btn btn-outline-success btn-sm" icon="pi pi-check" onClick={savePreco} />
        </React.Fragment>
    );

    const deletePrecoDialogFooter = (
        <React.Fragment>
            <Button label="Não" className="btn btn-outline-danger btn-sm" icon="pi pi-times" outlined onClick={hideDialog} />
            &nbsp;
            <Button label="Sim" className="btn btn-outline-success btn-sm" icon="pi pi-check" severity="danger" onClick={deletePreco} />
        </React.Fragment>
    );

    const vendaDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" className="btn btn-outline-danger btn-sm" icon="pi pi-times" outlined onClick={hideDialog} />
            &nbsp;
            <Button label="Salvar" className="btn btn-outline-success btn-sm" icon="pi pi-check" onClick={saveVenda} />
        </React.Fragment>
    );

    const dataTable = {
        margin: "auto",
        padding: "10px",
        width: '100%'
    };

    const footer = `Total de ${products ? products.length : 0} produtos cadastrados.`;

    return (
        <div>
            <Header />
             <Toast ref={toast} />
            <div style={dataTable}>
                <div className="card">
                    <Toolbar className="mb-4" center={centerToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    <DataTable ref={dt} footer={footer} value={products} stripedRows
                        dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Página {first} de {last} a {totalRecords} produtos" globalFilter={globalFilter} header={header} resizableColumns showGridlines>
                        
                        <Column body={(rowData, { rowIndex }) => rowIndex + 1} header="#" sortable style={{ minWidth: '3rem' }}></Column>
                        <Column field="nome" header="Nome" sortable style={{ minWidth: '6rem' }}></Column>
                        <Column field="marca" header="Marca" sortable style={{ minWidth: '6rem' }}></Column>
                        <Column field="status" header="Quantidade em Estoque" sortable style={{ minWidth: '6rem' }}></Column>
                        <Column field="cost" header="Custo (R$)" sortable style={{ minWidth: '6rem' }}></Column>
                        <Column field="price_cash" header="Venda (Dinheiro)" sortable style={{ minWidth: '6rem' }}></Column>
                        <Column field="price_card" header="Venda (Cartão)" sortable style={{ minWidth: '6rem' }}></Column>
                        <Column header="Valor Total Estoque" body={totalCostBodyTemplate} sortable style={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '10rem' }}></Column>
                    </DataTable>
                </div>
            </div>
            {/* ************************************************************** MODAIS ***************************************************************** */}
            <Dialog visible={precoDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Tabela de Preços" modal className="p-fluid" footer={precoDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="nome" className="font-bold">Produto:</label>
                    <InputText disabled id="nome" value={product.nome} />
                </div>
                <div className="field">
                    <label htmlFor="cost" className="font-bold">Custo de Compra (R$):</label>
                    <InputText type="number" id="cost" value={product.cost} onChange={(e) => onInputNumberChange(e, 'cost')} className={classNames({ 'p-invalid': submitted && !product.cost })} />
                    {submitted && !product.cost && <small className="p-error">Campo é obrigatório!</small>}
                </div>
                <div className="field">
                    <label htmlFor="price_cash" className="font-bold">Valor de Venda (Dinheiro):</label>
                    <InputText type="number" id="price_cash" value={product.price_cash} onChange={(e) => onInputNumberChange(e, 'price_cash')} className={classNames({ 'p-invalid': submitted && !product.price_cash })} />
                    {submitted && !product.price_cash && <small className="p-error">Campo é obrigatório!</small>}
                </div>
                <div className="field">
                    <label htmlFor="price_card" className="font-bold">Valor de Venda (Cartão):</label>
                    <InputText type="number" id="price_card" value={product.price_card} onChange={(e) => onInputNumberChange(e, 'price_card')} className={classNames({ 'p-invalid': submitted && !product.price_card })} />
                    {submitted && !product.price_card && <small className="p-error">Campo é obrigatório!</small>}
                </div>
            </Dialog>

            <Dialog visible={deletePrecoDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmar Exclusão" modal footer={deletePrecoDialogFooter} onHide={hideDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem', color: 'red' }} />
                    {product && (
                        <span>Tem certeza de que quer excluir os valores de preço do Item: <b>{product.nome}</b>?</span>
                    )}
                </div>
            </Dialog>
            
            <Dialog visible={vendaDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Registrar Venda" modal className="p-fluid" footer={vendaDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="nome" className="font-bold">Produto:</label>
                    <InputText disabled id="nome" value={product.nome} />
                </div>
                <div className="field">
                    <label htmlFor="quantidade_vendida" className="font-bold">Quantidade Vendida:</label>
                    <InputText type="number" id="quantidade_vendida" min={0} value={product.quantidade_vendida} onChange={(e) => onInputIntegerChange(e, 'quantidade_vendida')} className={classNames({ 'p-invalid': submitted && !product.quantidade_vendida })} />
                    {submitted && !product.quantidade_vendida && <small className="p-error">Campo é obrigatório!</small>}
                    {product.quantidade_vendida > product.status && <small className="p-error pi pi-exclamation-triangle mr-3"> Quantidade maior que a disponível em estoque!</small>}
                </div>
                <div className="field">
                    <label htmlFor="forma_pagamento" className="font-bold">Forma de Pagamento:</label>
                    <Dropdown
                        className="w-full md:w-14rem"
                        id="forma_pagamento"
                        options={formas_pagamento}
                        optionLabel="name"
                        value={product.forma_pagamento}
                        onChange={(e) => onInputChange(e, 'forma_pagamento')}
                        placeholder="Selecione a forma de pagamento"
                    />
                    {submitted && !product.forma_pagamento && <small className="p-error">Campo é obrigatório!</small>}
                </div>
            </Dialog>


            <Footer />
        </div>
    );
}