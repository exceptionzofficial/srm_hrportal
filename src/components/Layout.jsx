
import { useState, useEffect } from 'react';
import { FiUsers, FiDollarSign, FiLogOut, FiMenu, FiFileText } from 'react-icons/fi';
import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';
import srmLogo from '../assets/srm-logo.png';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        fetchPendingRequests();
        // Poll every 30 seconds
        const interval = setInterval(fetchPendingRequests, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchPendingRequests = async () => {
        try {
            // We need to import getAllRequests properly. 
            // Since this component is inside 'components', and api is in '../services/api'
            const { getAllRequests } = await import('../services/api');
            const data = await getAllRequests('PENDING');
            if (data && data.requests) {
                setPendingCount(data.requests.length);
            }
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        }
    };

    return (
        <div className="layout">
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="logo-area">
                    <img src={srmLogo} alt="SRM Sweets" />
                    <h2>HR Portal</h2>
                </div>
                <nav>
                    <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                        <FiUsers /> Employees
                    </NavLink>
                    <NavLink to="/salary" className={({ isActive }) => isActive ? 'active' : ''}>
                        <FiDollarSign /> Salary Management
                    </NavLink>
                    <NavLink to="/requests" className={({ isActive }) => isActive ? 'active' : ''}>
                        <div className="nav-item-content">
                            <span><FiFileText /> Requests</span>
                            {pendingCount > 0 && (
                                <span className="notification-badge">{pendingCount}</span>
                            )}
                        </div>
                    </NavLink>
                </nav>
                <div className="logout">
                    <button><FiLogOut /> Logout</button>
                </div>
            </aside>
            <main className="content">
                <header className="top-bar">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="toggle-btn">
                        <FiMenu />
                    </button>
                    <span style={{ fontWeight: 500 }}>Welcome, HR Manager</span>
                </header>
                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
