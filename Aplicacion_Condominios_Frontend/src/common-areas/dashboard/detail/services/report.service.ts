import { getResidents } from "../../shared/services/resident.service";
import {
  ReportCreateDTO,
  ReportReadDTO,
  ReportsResponseAPI,
} from "../interfaces/deatil";

const API_URL = "http://localhost:8000/api/";

export async function getReports(): Promise<ReportReadDTO[]> {
  const response = await fetch(`${API_URL}reports`);
  const data: ReportsResponseAPI = await response.json();
  const reports = data.data;

  if (!response.ok) {
    throw data;
  }

  const residents = await getResidents();

  const reportsWithResidents = reports.map((report) => {
    const resident = residents.find(
      (resident) => resident.id === report.id_residente
    );

    return {
      ...report,
      residentName: `${resident?.nombre_residente} ${resident?.apellidos_residente}`,
    };
  });

  return reportsWithResidents;
}

export async function createReport(report: ReportCreateDTO) {
  const response = await fetch(`${API_URL}reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(report),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}
