import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';

import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './Boletos.css'; // Vamos criar este arquivo de CSS no próximo passo

import Header from './Header';
import Footer from './Footer';

export default function Boletos({ onLogout }) {
    let emptyBoleto = {
        id: null,
        valor: null,
        dataVencimento: null,
        descricao: ''
    };

    const [boletos, setBoletos] = useState([]);
    const [boletoDialog, setBoletoDialog] = useState(false);
    const [deleteBoletoDialog, setDeleteBoletoDialog] = useState(false);
    const [boleto, setBoleto] = useState(emptyBoleto);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef(null);
    const dt = useRef(null);

    const apiBaseUrl = 'http://localhost:8080/boletos';

    const fetchData = async () => {
        try {
            const response = await axios.get(apiBaseUrl);
            setBoletos(response.data);
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar boletos.', life: 3000 });
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openNew = () => {
        setBoleto(emptyBoleto);
        setSubmitted(false);
        setBoletoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setBoletoDialog(false);
    };

    const hideDeleteBoletoDialog = () => {
        setDeleteBoletoDialog(false);
    };

    const saveBoleto = async () => {
        setSubmitted(true);
        if (!boleto.valor || !boleto.dataVencimento || !boleto.descricao) {
            toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Por favor, preencha todos os campos obrigatórios.', life: 3000 });
            return;
        }
        try {
            if (boleto.id) {
                // Lógica para editar (a API que criamos não tem rota de edição, mas podemos adicionar no futuro)
            } else {
                await axios.post(apiBaseUrl, boleto);
                toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Boleto cadastrado!', life: 3000 });
            }
            fetchData();
            setBoletoDialog(false);
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar o boleto.', life: 3000 });
        }
    };

    const confirmDeleteBoleto = (boleto) => {
        setBoleto(boleto);
        setDeleteBoletoDialog(true);
    };

    const deleteBoleto = async () => {
        try {
            await axios.delete(`${apiBaseUrl}/${boleto.id}`);
            toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Boleto excluído!', life: 3000 });
            fetchData();
            setDeleteBoletoDialog(false);
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir o boleto.', life: 3000 });
        }
    };

    const marcarComoPago = async (boleto) => {
        try {
            await axios.put(`${apiBaseUrl}/${boleto.id}`, { dataPagamento: new Date() });
            toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Boleto marcado como pago!', life: 3000 });
            fetchData();
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar o boleto.', life: 3000 });
        }
    };

    const onInputChange = (e, name) => {
        const val = e.target.value;
        setBoleto({ ...boleto, [name]: val });
    };

    const onInputNumberChange = (e, name) => {
        const val = e.value;
        setBoleto({ ...boleto, [name]: val });
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Novo Boleto" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    const statusBodyTemplate = (rowData) => {
        const status = rowData.status;
        let severity;
        if (status === 'A Pagar') {
            severity = 'danger';
        } else if (status === 'Pago') {
            severity = 'success';
        } else {
            severity = 'warning';
        }
        return <Tag value={status} severity={severity} />;
    };

    const valorBodyTemplate = (rowData) => {
        return `R$ ${parseFloat(rowData.valor).toFixed(2)}`;
    };

    const dateBodyTemplate = (rowData, field) => {
        const date = new Date(rowData[field]);
        return date.toLocaleDateString('pt-BR');
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex flex-wrap gap-2">
                {rowData.status === 'A Pagar' && (
                    <Button icon="pi pi-check" label="Pagar" className="p-button-sm" onClick={() => marcarComoPago(rowData)} />
                )}
                <Button icon="pi pi-trash" severity="danger" className="p-button-sm" onClick={() => confirmDeleteBoleto(rowData)} />
            </div>
        );
    };

    const boletoDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-danger" onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" className="p-button-success" onClick={saveBoleto} />
        </React.Fragment>
    );

    const deleteBoletoDialogFooter = (
        <React.Fragment>
            <Button label="Não" icon="pi pi-times" className="p-button-danger" onClick={hideDeleteBoletoDialog} />
            <Button label="Sim" icon="pi pi-check" className="p-button-success" onClick={deleteBoleto} />
        </React.Fragment>
    );

    return (
        <div>
            <Header onLogout={onLogout} />
            <div className="boletos-container">
                <Toast ref={toast} />
                <div className="card">
                    <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

                    <DataTable ref={dt} value={boletos} dataKey="id"
                        paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Página {first} de {last} a {totalRecords} boletos"
                        sortField="dataVencimento" sortOrder={1}>

                        <Column field="descricao" header="Descrição" sortable></Column>
                        <Column field="valor" header="Valor" body={valorBodyTemplate} sortable></Column>
                        <Column field="dataVencimento" header="Vencimento" body={(rowData) => dateBodyTemplate(rowData, 'dataVencimento')} sortable></Column>
                        <Column field="dataPagamento" header="Data de Pagamento" body={(rowData) => rowData.dataPagamento ? dateBodyTemplate(rowData, 'dataPagamento') : '---'} sortable></Column>
                        <Column field="status" header="Status" body={statusBodyTemplate} sortable></Column>
                        <Column body={actionBodyTemplate} header="Ações"></Column>
                    </DataTable>
                </div>
            </div>
            <Footer />

            {/* Modal para adicionar/editar boleto */}
            <Dialog visible={boletoDialog} style={{ width: '450px' }} header="Detalhes do Boleto" modal className="p-fluid" footer={boletoDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="descricao" className="font-bold">Descrição</label>
                    <InputText id="descricao" value={boleto.descricao} onChange={(e) => onInputChange(e, 'descricao')} required className={classNames({ 'p-invalid': submitted && !boleto.descricao })} />
                    {submitted && !boleto.descricao && <small className="p-error">Descrição é obrigatória.</small>}
                </div>
                <div className="field">
                    <label htmlFor="valor" className="font-bold">Valor</label>
                    <InputNumber id="valor" value={boleto.valor} onValueChange={(e) => onInputNumberChange(e, 'valor')} mode="currency" currency="BRL" locale="pt-BR" required className={classNames({ 'p-invalid': submitted && !boleto.valor })} />
                    {submitted && !boleto.valor && <small className="p-error">Valor é obrigatório.</small>}
                </div>
                <div className="field">
                    <label htmlFor="dataVencimento" className="font-bold">Data de Vencimento</label>
                    <Calendar id="dataVencimento" value={boleto.dataVencimento} onChange={(e) => onInputChange(e, 'dataVencimento')} dateFormat="dd/mm/yy" mask="99/99/9999" showIcon required className={classNames({ 'p-invalid': submitted && !boleto.dataVencimento })} />
                    {submitted && !boleto.dataVencimento && <small className="p-error">Data de vencimento é obrigatória.</small>}
                </div>
            </Dialog>

            {/* Modal de confirmação de exclusão */}
            <Dialog visible={deleteBoletoDialog} style={{ width: '450px' }} header="Confirmar Exclusão" modal footer={deleteBoletoDialogFooter} onHide={hideDeleteBoletoDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {boleto && (
                        <span>Tem certeza que deseja excluir o boleto de <b>{boleto.descricao}</b>?</span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}