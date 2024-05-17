import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import "./report-Page.css";
import { getResidents } from "../../../shared/services/resident.service";
import { getEquipments } from "../../../equipment/services/equipment.service";
import { Equipment } from "../../../equipment/interfaces/equipment";
import Swal from "sweetalert2";
import { CommonArea } from "../../../common-area/interfaces/common-areas";

interface FormData {
  idUsuario: number;
  idAreaComun: number;
  idProducto: number;
  costo: number;
  costoReponer: number;
  cantidadActual: number;
  cantidadReponer: number;
  situacion: string;
  informacionAdicional: string;
}

function ReportPage() {
  const [formData, setFormData] = useState<FormData>({
    idUsuario: 0,
    idAreaComun: 0,
    idProducto: 0,
    costo: 0,
    costoReponer: 0,
    cantidadActual: 0,
    cantidadReponer: 0,
    situacion: "",
    informacionAdicional: "",
  });
  const [commonAreas, setCommonAreas] = useState<
    { id: number; name: string }[]
  >([]);
  const [residents, setResidents] = useState<
    {
      id: number;
      name: string;
    }[]
  >([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [currentEquipments, setCurrentEquipments] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );

  useEffect(() => {
    const get = async () => {
      const data = await getEquipments();
      setEquipments(data);
    };

    get();
  }, []);

  useEffect(() => {
    getResidents().then((data) => {
      const res = data.map((resident) => ({
        id: resident.id,
        name: `${resident.nombre_residente} ${resident.apellidos_residente}`,
      }));
      setResidents(res);
    });
  }, []);

  useEffect(() => {
    const getCommonAreas = async () => {
      const response = await fetch("http://localhost:8000/api/common-areas");
      const data = await response.json();
      return data;
    };
    getCommonAreas().then((response) => {
      const { data } = response;
      const { commonAreas } = data;
      const commonAreasFormatted = commonAreas.map((area: CommonArea) => ({
        id: area.id,
        name: area.name,
      }));
      setCommonAreas(commonAreasFormatted);
    });
  }, []);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "nombreProducto") {
      const equipment = equipments.find(
        (item) => item.id === parseInt(value, 10)
      );

      if (equipment) {
        setSelectedEquipment(equipment);
        setFormData((prevState) => ({
          ...prevState,
          costo: equipment.costo,
          cantidadActual: equipment.cantidad,
        }));
      }
    } else if (name === "nombreArea") {
      const nameCommonArea = commonAreas.find(
        (commonArea) => commonArea.id === parseInt(value, 10)
      )?.name;
      const currentEquipments = equipments.filter(
        (equipment) => equipment.area_comun_nombre === nameCommonArea
      );
      setSelectedEquipment(null);
      setCurrentEquipments(currentEquipments);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const element = Object.fromEntries(formData.entries());
    console.log(element);
    if (
      !(
        element.cantidadReponer ||
        element.costoReponer ||
        element.informacionAdicional ||
        element.idAreaComun ||
        element.idProducto ||
        element.idUsuario ||
        element.situacion
      )
    ) {
      Swal.fire({
        icon: "error",
        title: "Todos los datos son requeridos",
      });
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Crear Reporte</h2>
      <div className="form-group">
        <label>Nombre Residente:</label>
        <select
          name="nombreUsuario"
          value={formData.idUsuario}
          onChange={handleChange}
        >
          <option value={-1} disabled>
            Seleccione un residente
          </option>
          {residents.map((resident) => {
            return (
              <option key={resident.id} value={resident.id}>
                {resident.name}
              </option>
            );
          })}
        </select>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div className="form-group">
          <label>Nombre Área Común:</label>
          <select
            name="nombreArea"
            value={formData.idAreaComun}
            onChange={handleChange}
          >
            <option value={-1} disabled>
              Seleccione un área común
            </option>
            {commonAreas.map((area, index) => (
              <option key={index} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Nombre Producto:</label>
          <select
            name="nombreProducto"
            value={formData.idProducto}
            onChange={handleChange}
          >
            <option value={-1} disabled>
              Seleccione un producto
            </option>
            {currentEquipments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group-in-line">
        <label
          style={{
            fontWeight: "bold",
          }}
        >
          Costo:
        </label>
        <span>{selectedEquipment ? selectedEquipment.costo : ""}</span>
      </div>
      <div className="form-group-in-line">
        <label
          style={{
            fontWeight: "bold",
          }}
        >
          Cantidad Actual:
        </label>
        <p>{selectedEquipment ? selectedEquipment.cantidad : ""}</p>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div className="form-group">
          <label>Costo a Reponer:</label>
          <input
            type="number"
            name="costoReponer"
            value={formData.costoReponer}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Cantidad a Reponer:</label>
          <input
            type="number"
            name="cantidadReponer"
            value={formData.cantidadReponer}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Situación:</label>
        <select
          name="situacion"
          value={formData.situacion}
          onChange={handleChange}
        >
          <option value="roto">Roto</option>
          <option value="perdido">Perdido</option>
        </select>
      </div>
      <div className="form-group">
        <label>Información Adicional:</label>
        <textarea
          name="informacionAdicional"
          value={formData.informacionAdicional}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Reportar</button>
    </form>
  );
}

export default ReportPage;
