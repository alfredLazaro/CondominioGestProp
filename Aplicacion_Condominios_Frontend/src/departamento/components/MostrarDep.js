import React, { useEffect, useState } from "react";
import axios from "axios";
import './DepartamentosCss.css';

import { Link } from "react-router-dom";
import Cookies from 'universal-cookie';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, CardImg, CardBody, CardTitle , Button } from 'reactstrap';
import ModalConfirm from "./ModalConfirm";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight, faPenToSquare , faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const endpoint = 'http://localhost:8000/api';
const endpointImg = 'http://localhost:8000';
const cookies = new Cookies();
const MostrarDep = () => {
    const [departamentos, setDepartamentos] = useState ([]);
    const [switchStates, setSwitchStates] = useState({});
    const [isOpenModal1, setIsOpenModal1] = useState(false);
    const [isOpenModal2, setIsOpenModal2] = useState(false);
    const [estadoIdDepa, setEstadoIdDepa] = useState([null]);


    useEffect(() => {
        getAllDepartments();
        cookies.remove('idDepa');
    }, []);

    /* const getAllDepartments = async () => {
        const response = await axios.get(`${endpoint}/departamentos`);
        setDepartamentos(response.data);
        const initialSwitchStates = {};
        response.data.forEach(departamento => {
            initialSwitchStates[departamento.id]  = departamento.disponibilidad;
        });
        setSwitchStates(initialSwitchStates);
    } */

    const getAllDepartments = async () => {
        try {
            const response = await axios.get(`${endpoint}/departamentos`);
            const departamentos = response.data;
            setDepartamentos(departamentos);
            const initialSwitchStates = {};
            // Iterar sobre cada departamento
            for (const departamento of departamentos) {
                initialSwitchStates[departamento.id] = departamento.disponibilidad;
    
                // Obtener los contratos asociados a este departamento
                const contratosResponse = await axios.get(`${endpoint}/contratoDep/${departamento.id}`);
                // Guardar los contratos asociados a este departamento
                departamento.contratos = contratosResponse.data.contratos;

                const tieneContratos = departamento.contratos && departamento.contratos.length > 0;
                const tieneVenta = tieneContratos && departamento.contratos.some(contrato => contrato.tipo_contrato === "venta");
                // const tieneOtro = tieneContratos && departamento.contratos.some(contrato => contrato.tipo_contrato === "alquiler" || contrato.tipo_contrato === "anticretico" );
                const obtenerPropietarioyOTitular = async (contrato) => {
                    try {
                        const inquilinoResponse = await axios.get(`${endpoint}/propietario-by-contrato/${contrato.id}`);
                        console.log('Propietario:', inquilinoResponse.data);
                        const tienePropietario = inquilinoResponse.data !== null;
                        console.log('tienePropietario',tienePropietario);
                        const titularResponse = await axios.get(`${endpoint}/titular-by-contrato/${contrato.id}`);
                        const tieneTitular = titularResponse.data !== null;
                        console.log('tieneTitular',tieneTitular);
                        console.log('Titular:', titularResponse.data);
                        if (tienePropietario) {
                            contrato.residente = inquilinoResponse.data.residente;
                        } else {
                            contrato.residente = null;
                        } 
                        if (tieneTitular) {
                            contrato.titular = titularResponse.data.residente;
                        } else {
                            contrato.titular = null;
                        }
                    } catch (error) {
                        if (error.response && error.response.status === 404) {
                            // Manejar el caso en el que el propietario no existe (por ejemplo, asignar null)
                            contrato.residente = null;
                        } else {
                            // Manejar otros errores de manera adecuada
                            console.error("Error al obtener el propietario o titular:", error);
                            // Puedes lanzar nuevamente el error para que sea manejado por la función que llama a esta función
                            throw error;
                        }
                    }
                };
                for (const contrato of departamento.contratos) {
                    await obtenerPropietarioyOTitular(contrato);
                }
                
                initialSwitchStates[departamento.id] = tieneVenta;
            }
            // Guardar el estado de los interruptores y la lista de departamentos actualizada
            setSwitchStates(initialSwitchStates);
            setDepartamentos(departamentos);
        } catch (error) {
            console.error("Error al obtener departamentos:", error);
        }
    }
    
    const deleteDepartment = async (id) => {
        await axios.delete(`${endpoint}/departamento/${id}`);
        getAllDepartments();
    }

    const handleClickEditar = (idDepa) => {
        cookies.set('idDepa', idDepa);
        window.location.href = '/dashboard/editarDepa'; 
      };

    const handleClickInfo = (idDepa) => {
        cookies.set('idDepa', idDepa);
        window.location.href = '/dashboard/infoDepartamento';
    };
    
    const handleBotonSwitch = (idDepa) => {
        if (!switchStates[idDepa]) {
            //axios.put(`${endpoint}/departamentos/${idDepa}/actualizarDisp`, {
            //disponibilidad: 1,
            //});
            setEstadoIdDepa(idDepa);
            setIsOpenModal1(true);
        } else {
            //cookies.set('idDepa', idDepa);
            //window.location.href = '/dashboard/crearContrato';
            setEstadoIdDepa(idDepa);
            setIsOpenModal1(true);
        }
    }

    const handleConfirm = (idDepa) => {
        setSwitchStates(prevState => ({
            ...prevState,
            [idDepa]: !prevState[idDepa]
        }));

        if (!switchStates[idDepa]) {
            axios.put(`${endpoint}/departamentos/${idDepa}/actualizarDisp`, {
            disponibilidad: 1,
            });
        } else {
            cookies.set('idDepa', idDepa);
            window.location.href = '/dashboard/crearContrato';
        }
        setIsOpenModal1(false);
    }

    return(
        <div className="Deps">
            <ModalConfirm
                isOpen={isOpenModal1}
                toggle={() => setIsOpenModal1(false)}
                confirm={() => handleConfirm(estadoIdDepa)}
                message="¿Está seguro de que deseas cambiar el estado de este departamento?"
            />
            <h1 className="title">Departamentos</h1>
        
            <div className= "lista">
                {departamentos.map((departamento) => (
                    
                    
                    <Card className="cardDepa" key={departamento.id}>
                        
                        <CardImg
                            alt="Card image cap"
                            src={`${endpointImg}/${departamento.imagen_departamento}`}
                            top
                            width="100%"
                        />
                        <CardBody>
                            <CardTitle tag="h5">{departamento.nombre_departamento}</CardTitle>
                            {departamento.contratos && departamento.contratos.length > 0 && (
                                <div>
                                    {departamento.contratos.map(contrato => (
                                        <div key={contrato.id}>
                                            {contrato.tipo_contrato === "venta" && contrato.residente && (
                                                //console.log("Propietario: ", contrato.residente.nombre_residente);
                                               <p>Propietario: {contrato.residente.nombre_residente} {contrato.residente.apellidos_residente}</p>
                                            )}
                                            {contrato.tipo_contrato !== "venta" && contrato.titular && (
                                                <p>Titular: {contrato.residente.nombre_residente} {contrato.residente.apellidos_residente}</p>
                                            )}
                                        </div>

                                    ))}
                                </div>
                                
                            )}
                            <div className="botones">
                                <Button className="botoncard" onClick={() => deleteDepartment(departamento.id)}><FontAwesomeIcon icon={faTrashAlt} className="iconos"/></Button>
                                <Button className="botoncard" onClick={() => handleClickEditar(departamento.id)} ><FontAwesomeIcon icon={faPenToSquare} className="iconos"/></Button>
                                <Button className="botoncard" onClick={() => handleClickInfo(departamento.id)} ><FontAwesomeIcon icon={faArrowCircleRight} className="iconos"/></Button>
                                {departamento.contratos && !departamento.contratos.some(contrato => contrato.tipo_contrato === "alquiler" || contrato.tipo_contrato === "anticretico") ? (
                                <label className="switch">
                                    <input type="checkbox" checked={switchStates[departamento.id]} onChange={() => { handleBotonSwitch(departamento.id); }} />
                                    <span className="slider"></span>
                                </label>
                                ):null}
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default MostrarDep;
