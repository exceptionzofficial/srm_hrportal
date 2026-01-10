
import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiMapPin, FiSearch, FiCreditCard, FiUpload, FiImage } from 'react-icons/fi';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getBranches, deleteFaceRegistration } from '../services/api';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        employeeId: '',
        name: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        branchId: '',
        workMode: 'OFFICE',
        // Documents
        panNumber: '',
        aadharNumber: '',
        // Statutory & Bank
        uan: '',
        esicIP: '',
        bankAccount: '',
        ifscCode: '',
        paymentMode: 'CASH',

        fixedSalary: '',
        joinedDate: '',
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [empResponse, branchResponse] = await Promise.all([
                getEmployees(),
                getBranches().catch(() => ({ branches: [] })),
            ]);
            setEmployees(empResponse.employees || []);
            setBranches(branchResponse.branches || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter and Sort Employees
    const filteredEmployees = employees
        .filter(emp => {
            const searchLower = searchTerm.toLowerCase();
            return (
                emp.name?.toLowerCase().includes(searchLower) ||
                emp.employeeId?.toLowerCase().includes(searchLower)
            );
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    const openModal = (employee = null) => {
        if (employee) {
            setEditingEmployee(employee);
            setFormData({
                employeeId: employee.employeeId,
                name: employee.name || '',
                email: employee.email || '',
                phone: employee.phone || '',
                department: employee.department || '',
                designation: employee.designation || '',
                branchId: employee.branchId || '',
                workMode: employee.workMode || 'OFFICE',
                panNumber: employee.panNumber || '',
                aadharNumber: employee.aadharNumber || '',
                uan: employee.uan || '',
                esicIP: employee.esicIP || '',
                bankAccount: employee.bankAccount || '',
                ifscCode: employee.ifscCode || '',
                paymentMode: employee.paymentMode || 'CASH',
                fixedSalary: employee.fixedSalary || '',
                joinedDate: employee.joinedDate ? employee.joinedDate.split('T')[0] : '',
            });
            setPhotoPreview(employee.photoUrl || null);
        } else {
            setEditingEmployee(null);
            setFormData({
                employeeId: '',
                name: '',
                email: '',
                phone: '',
                department: '',
                designation: '',
                branchId: branches.length > 0 ? branches[0].branchId : '',
                workMode: 'OFFICE',
                panNumber: '',
                aadharNumber: '',
                uan: '',
                esicIP: '',
                bankAccount: '',
                ifscCode: '',
                paymentMode: 'CASH',
                paymentMode: 'CASH',
                fixedSalary: '',
                joinedDate: '',
            });
            setPhotoPreview(null);
        }
        setPhotoFile(null);
        setShowModal(true);
        setError('');
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingEmployee(null);
        setPhotoFile(null);
        setPhotoPreview(null);
        setError('');
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.employeeId || !formData.name) {
            setError('Employee ID and Name are required');
            return;
        }

        if (!formData.branchId && branches.length > 0) {
            setError('Please select a branch');
            return;
        }

        try {
            // Build FormData if there's a photo file
            let dataToSend;
            if (photoFile) {
                dataToSend = new FormData();
                Object.entries(formData).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        dataToSend.append(key, value);
                    }
                });
                dataToSend.append('photo', photoFile);
            } else {
                dataToSend = formData;
            }

            if (editingEmployee) {
                await updateEmployee(editingEmployee.employeeId, dataToSend);
                setSuccess('Employee updated successfully');
            } else {
                await createEmployee(dataToSend);
                setSuccess('Employee created successfully');
            }
            closeModal();
            loadData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Error saving employee');
        }
    };

    const handleDelete = async (employeeId) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;

        try {
            await deleteEmployee(employeeId);
            setSuccess('Employee deleted successfully');
            loadData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Error deleting employee');
        }
    };

    const getBranchName = (branchId) => {
        const branch = branches.find(b => b.branchId === branchId);
        return branch?.name || '-';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="employees-page">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Employees</h1>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="search-box" style={{ background: 'white', padding: '8px 12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', width: '300px' }}>
                        <FiSearch style={{ marginRight: '8px', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            style={{ border: 'none', outline: 'none', fontSize: '14px', width: '100%', background: 'transparent' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        <FiPlus /> Add Employee
                    </button>
                </div>
            </div>

            {success && <div className="badge badge-success" style={{ display: 'block', marginBottom: '10px', padding: '10px' }}>{success}</div>}
            {error && <div className="badge badge-danger" style={{ display: 'block', marginBottom: '10px', padding: '10px' }}>{error}</div>}

            {/* Employees Table */}
            <div className="card">
                {filteredEmployees.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Name</th>
                                    <th>Work Mode</th>
                                    <th>Details</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp.employeeId}>
                                        <td>
                                            <strong>{emp.employeeId}</strong>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {emp.photoUrl ? (
                                                    <img src={emp.photoUrl} alt={emp.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ background: '#F5F5F5', borderRadius: '50%', padding: '8px', color: 'var(--primary)' }}><FiUser /></div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>{emp.name}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{emp.designation || '-'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {emp.workMode === 'FIELD_SALES' || emp.workMode === 'REMOTE' ? (
                                                <span className="badge badge-warning">On Duty / Travel</span>
                                            ) : (
                                                <span className="badge badge-secondary">Office</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                                                    <FiMapPin size={12} /> {getBranchName(emp.branchId)}
                                                </div>
                                                {emp.bankAccount && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--success)', fontSize: '11px' }}>
                                                        <FiCreditCard size={12} /> {emp.bankAccount}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${emp.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="action-btn edit" onClick={() => openModal(emp)}>
                                                    <FiEdit2 />
                                                </button>
                                                <button className="action-btn delete" onClick={() => handleDelete(emp.employeeId)}>
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="empty-message" style={{ textAlign: 'center', padding: '20px', color: '#777' }}>No employees found.</p>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
                            </h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {error && <div className="badge badge-danger" style={{ display: 'block', marginBottom: '15px' }}>{error}</div>}

                            {/* Section 1: Basic Info */}
                            <h4 style={{ color: 'var(--primary)', fontSize: '14px', marginBottom: '15px', textTransform: 'uppercase' }}>Basic Information</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label">Employee ID *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.employeeId}
                                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                                        placeholder="e.g., SRM001"
                                        disabled={editingEmployee}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Email address"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Phone number"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        placeholder="Department"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Designation</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        placeholder="Job title"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Work Mode</label>
                                    <select
                                        className="form-input"
                                        value={formData.workMode}
                                        onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                                    >
                                        <option value="OFFICE">Office Based (Geofenced)</option>
                                        <option value="FIELD_SALES">Field Sales (On Duty Allowed)</option>
                                        <option value="REMOTE">Remote / WFH</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Branch *</label>
                                    <select
                                        className="form-input"
                                        value={formData.branchId}
                                        onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                    >
                                        <option value="">Select a branch</option>
                                        {branches.map((branch) => (
                                            <option key={branch.branchId} value={branch.branchId}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date of Joining</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.joinedDate}
                                        onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Section 2: Employee Documents */}
                            <h4 style={{ color: 'var(--primary)', fontSize: '14px', margin: '20px 0 15px', textTransform: 'uppercase', borderTop: '1px solid #eee', paddingTop: '20px' }}>Employee Documents</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label"><FiCreditCard style={{ marginRight: '6px' }} />PAN Number</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.panNumber}
                                        onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                                        placeholder="e.g., ABCDE1234F"
                                        maxLength={10}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><FiCreditCard style={{ marginRight: '6px' }} />Aadhar Number</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.aadharNumber}
                                        onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value.replace(/\D/g, '') })}
                                        placeholder="e.g., 123456789012"
                                        maxLength={12}
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '15px' }}>
                                <label className="form-label"><FiImage style={{ marginRight: '6px' }} />Employee Photo</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    {photoPreview ? (
                                        <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                                            <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', border: '1px solid #ddd' }} />
                                            <button
                                                type="button"
                                                onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                                                style={{ position: 'absolute', top: '-8px', right: '-8px', width: '20px', height: '20px', borderRadius: '50%', background: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                                            >×</button>
                                        </div>
                                    ) : (
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', border: '2px dashed #ddd', cursor: 'pointer', background: '#fafafa' }}>
                                            <FiUpload /> <span>Upload Photo</span>
                                            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Section 3: Statutory & Bank */}
                            <h4 style={{ color: 'var(--primary)', fontSize: '14px', margin: '20px 0 15px', textTransform: 'uppercase', borderTop: '1px solid #eee', paddingTop: '20px' }}>Statutory & Bank Details</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label">UAN (PF)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.uan}
                                        onChange={(e) => setFormData({ ...formData, uan: e.target.value })}
                                        placeholder="Universal Account Number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">ESIC IP No</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.esicIP}
                                        onChange={(e) => setFormData({ ...formData, esicIP: e.target.value })}
                                        placeholder="Insurance Number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Bank Account No</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.bankAccount}
                                        onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                                        placeholder="Enter Account Number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">IFSC Code</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.ifscCode}
                                        onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                                        placeholder="Enter IFSC Code"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Payment Mode</label>
                                    <select
                                        className="form-input"
                                        value={formData.paymentMode}
                                        onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                                    >
                                        <option value="CASH">CASH</option>
                                        <option value="BANK">BANK TRANSFER</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Fixed Salary (₹)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.fixedSalary}
                                        onChange={(e) => setFormData({ ...formData, fixedSalary: e.target.value })}
                                        placeholder="E.g. 25000"
                                    />
                                </div>
                            </div>

                            {/* Face Registration Reset (Only for Editing) */}
                            {editingEmployee && (
                                <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #eee' }}>
                                    <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>Face Registration</h5>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ fontSize: '13px', color: '#666' }}>
                                            {editingEmployee.faceId ?
                                                <span style={{ color: 'green' }}>✅ Face Registered</span> :
                                                <span style={{ color: '#999' }}>Click the button to reset if user needs to re-register.</span>
                                            }
                                        </div>
                                        {editingEmployee.faceId && (
                                            <button
                                                type="button"
                                                className="btn btn-danger-outline"
                                                style={{ fontSize: '12px', padding: '6px 12px', borderColor: '#d32f2f', color: '#d32f2f', background: 'transparent' }}
                                                onClick={async () => {
                                                    if (!confirm('Are you sure you want to RESET face registration? The employee will need to register again.')) return;
                                                    try {
                                                        await deleteFaceRegistration(editingEmployee.employeeId);
                                                        alert('Face registration reset successfully!');
                                                        loadData(); // Reload to update UI
                                                        closeModal();
                                                    } catch (err) {
                                                        alert('Failed to reset face: ' + (err.response?.data?.message || err.message));
                                                    }
                                                }}
                                            >
                                                Reset Face ID
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingEmployee ? 'Update' : 'Create'} Employee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
