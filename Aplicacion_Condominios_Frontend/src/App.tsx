import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import { routes } from "./routes";
import MostrarDep from "./components/moduloDep/MostrarDep.js";
import CrearDep from "./departamento/components/CrearDepartamento.js";
import EditarDep from "./components/moduloDep/EditarDep.js";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>{routes}</Route>
        <Route path="/depas" element={<MostrarDep/>}/>
        <Route path="/crearDepartamento" element={<CrearDep/>}/>
        <Route path="/editDepartamento" element={<EditarDep/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
