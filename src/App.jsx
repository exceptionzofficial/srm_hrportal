
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Employees from './pages/Employees';
import Salary from './pages/Salary';
import Requests from './pages/Requests';
import ChatGroups from './pages/ChatGroups';
import AttendanceReport from './pages/AttendanceReport';
import EmployeeRules from './pages/EmployeeRules';
import './components/Layout.css'; // Load global CSS

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Employees />} />
          <Route path="salary" element={<Salary />} />
          <Route path="requests" element={<Requests />} />
          <Route path="chat" element={<ChatGroups />} />
          <Route path="attendance-report" element={<AttendanceReport />} />
          <Route path="rules" element={<EmployeeRules />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
