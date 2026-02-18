import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getReports, createReport } from '../services/api';

function UserDashboard() {
    const { user, logout } = useAuth();
    const [gpsMsg, setGpsMsg] = useState('⏳ Acquiring GPS Location...');
    const [gpsMsgClass, setGpsMsgClass] = useState('text-warning fw-bold');
    const [submitDisabled, setSubmitDisabled] = useState(true);
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');
    const [reports, setReports] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hazardType, setHazardType] = useState('');
    const [description, setDescription] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        // Auto-run GPS on page load
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            setGpsMsg('❌ GPS Not Supported');
        }

        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await getReports();
            setReports(response.data);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        }
    };

    const showPosition = (position) => {
        setLat(position.coords.latitude);
        setLon(position.coords.longitude);
        setGpsMsg('✅ Location Locked!');
        setGpsMsgClass('text-success fw-bold');
        setSubmitDisabled(false);
    };

    const showError = (error) => {
        setGpsMsg('❌ GPS Permission Denied.');
        setGpsMsgClass('text-danger fw-bold');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!hazardType) {
            alert("Please select a hazard type");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('lat', lat);
        formData.append('lon', lon);
        formData.append('hazard_type', hazardType);
        formData.append('description', description);
        if (selectedFile) {
            formData.append('file', selectedFile);
        }

        try {
            await createReport(formData);
            setShowSuccessModal(true);
            setTimeout(() => setShowSuccessModal(false), 3000);
            fetchReports(); // Refresh list
            e.target.reset(); // Clear form
            setSelectedFile(null);
            setHazardType('');
            setDescription('');
        } catch (error) {
            console.error("Failed to submit report", error);
            alert("Failed to submit report.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                .welcome-nav {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    animation: slideIn 0.5s ease-out;
                }
                
                .stat-card {
                    transition: all 0.3s ease;
                    cursor: pointer;
                    border: none;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                
                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.2);
                }
                
                .report-card {
                    transition: all 0.3s ease;
                    border: none;
                    border-radius: 15px;
                    overflow: hidden;
                }
                
                .report-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                }
                
                .gps-indicator {
                    animation: pulse 2s infinite;
                }
                
                .table-row {
                    transition: all 0.3s ease;
                }
                
                .table-row:hover {
                    background-color: rgba(102, 126, 234, 0.1);
                    transform: scale(1.01);
                }
                
                .status-badge {
                    transition: all 0.3s ease;
                }
                
                .status-badge:hover {
                    transform: scale(1.1);
                }
                
                .success-modal {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                    animation: slideIn 0.5s ease-out;
                }
                
                .hazard-type-btn {
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                
                .hazard-type-btn:hover {
                    transform: translateY(-2px);
                }
                
                .hazard-type-btn.selected {
                    border: 2px solid #667eea;
                    background: rgba(102, 126, 234, 0.1);
                }
            `}</style>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="success-modal alert alert-success shadow-lg d-flex align-items-center" role="alert">
                    <i className="fas fa-check-circle me-2 fa-lg"></i>
                    <div>
                        <strong>Success!</strong> Report submitted successfully.
                    </div>
                </div>
            )}

            {/* Welcome Navbar */}
            <nav className="navbar welcome-nav text-white shadow-lg rounded mb-4 p-3">
                <div className="container-fluid">
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            <i className="fas fa-user-circle fa-2x"></i>
                        </div>
                        <div>
                            <span className="h5 mb-0 d-block">Welcome back, {user?.username}!</span>
                            <small className="text-white-50">
                                <i className="fas fa-map-marker-alt me-1"></i>
                                {gpsMsg.includes('✅') ? 'Location active' : 'Location pending'}
                            </small>
                        </div>
                    </div>
                    <button onClick={logout} className="btn btn-light text-danger px-4 rounded-pill">
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Logout
                    </button>
                </div>
            </nav>

            {/* Statistics Cards */}
            <div className="row mb-4">
                <div className="col-md-4 mb-3">
                    <div className="stat-card text-white p-3 rounded-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="mb-0">Total Reports</h6>
                                <h2 className="mt-2">{reports.length}</h2>
                            </div>
                            <i className="fas fa-file-alt fa-3x opacity-50"></i>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-3">
                    <div className="stat-card text-white p-3 rounded-3" style={{ background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="mb-0">Pending</h6>
                                <h2 className="mt-2">{reports.filter(r => r.status === 'Pending').length}</h2>
                            </div>
                            <i className="fas fa-clock fa-3x opacity-50"></i>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-3">
                    <div className="stat-card text-white p-3 rounded-3" style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="mb-0">Resolved</h6>
                                <h2 className="mt-2">{reports.filter(r => r.status === 'Resolved').length}</h2>
                            </div>
                            <i className="fas fa-check-circle fa-3x opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-5">
                    <div className="card report-card shadow">
                        <div className="card-header bg-transparent border-0 pt-3">
                            <h5 className="mb-0" style={{ color: '#667eea' }}>
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                Report New Hazard
                            </h5>
                        </div>
                        <div className="card-body">
                            {/* GPS Status */}
                            <div className={`alert ${gpsMsgClass.replace('text-', 'alert-')} d-flex align-items-center mb-4`} role="alert">
                                <i className={`fas ${gpsMsg.includes('✅') ? 'fa-check-circle' : gpsMsg.includes('❌') ? 'fa-times-circle' : 'fa-spinner fa-spin'} me-2`}></i>
                                <div className="flex-grow-1">{gpsMsg}</div>
                                {!gpsMsg.includes('✅') && !gpsMsg.includes('❌') && (
                                    <div className="spinner-border spinner-border-sm text-warning" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit}>
                                <input type="hidden" name="lat" value={lat} />
                                <input type="hidden" name="lon" value={lon} />

                                {/* Hazard Type Selection */}
                                <div className="mb-3">
                                    <label className="form-label text-muted">
                                        <i className="fas fa-tag me-2" style={{ color: '#667eea' }}></i>
                                        Hazard Type
                                    </label>
                                    <select 
                                        className="form-select custom-input py-2" 
                                        value={hazardType}
                                        onChange={(e) => setHazardType(e.target.value)}
                                        required
                                        style={{ borderRadius: '10px' }}
                                    >
                                        <option value="">Select hazard type</option>
                                        <option value="Pothole">Pothole</option>
                                        <option value="Garbage">Garbage Dump</option>
                                        <option value="Street Light">Street Light Issue</option>
                                        <option value="Water Leakage">Water Leakage</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {/* Description */}
                                <div className="mb-3">
                                    <label className="form-label text-muted">
                                        <i className="fas fa-align-left me-2" style={{ color: '#667eea' }}></i>
                                        Description
                                    </label>
                                    <textarea
                                        className="form-control custom-input"
                                        rows="2"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe the issue..."
                                        style={{ borderRadius: '10px' }}
                                    ></textarea>
                                </div>

                                {/* File Upload */}
                                <div className="mb-4">
                                    <label className="form-label text-muted">
                                        <i className="fas fa-camera me-2" style={{ color: '#667eea' }}></i>
                                        Upload Evidence
                                    </label>
                                    <input
                                        type="file"
                                        name="file"
                                        className="form-control custom-input"
                                        onChange={handleFileChange}
                                        required
                                        style={{ borderRadius: '10px' }}
                                    />
                                    {selectedFile && (
                                        <small className="text-success mt-1 d-block">
                                            <i className="fas fa-check-circle me-1"></i>
                                            {selectedFile.name} selected
                                        </small>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn w-100 py-3 text-white"
                                    disabled={submitDisabled || isSubmitting}
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: '10px',
                                        fontWeight: '600',
                                        letterSpacing: '0.5px',
                                        opacity: submitDisabled || isSubmitting ? 0.7 : 1
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Submitting Report...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-paper-plane me-2"></i>
                                            Submit Report
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-7">
                    <div className="card report-card shadow">
                        <div className="card-header bg-transparent border-0 pt-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0" style={{ color: '#667eea' }}>
                                <i className="fas fa-history me-2"></i>
                                My Reports History
                            </h5>
                            <span className="badge rounded-pill" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                {reports.length} Total
                            </span>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-3">Hazard Type</th>
                                            <th>Location</th>
                                            <th>Status</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.map((r, index) => (
                                            <tr key={r.id} className="table-row" style={{ animation: `slideIn 0.3s ease-out ${index * 0.1}s` }}>
                                                <td className="ps-3">
                                                    <div className="d-flex align-items-center">
                                                        <i className="fas fa-exclamation-circle me-2" style={{ color: '#667eea' }}></i>
                                                        {r.hazard_type}
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: '0.85em' }}>
                                                    <i className="fas fa-map-pin me-1 text-muted"></i>
                                                    {r.address || 'Location recorded'}
                                                </td>
                                                <td>
                                                    {r.status === 'Pending' ? (
                                                        <span className="badge bg-warning text-dark px-3 py-2 rounded-pill status-badge">
                                                            <i className="fas fa-clock me-1"></i>
                                                            Pending
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-success px-3 py-2 rounded-pill status-badge">
                                                            <i className="fas fa-check-circle me-1"></i>
                                                            Resolved
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <button className="btn btn-sm btn-outline-primary rounded-pill px-3" style={{ borderColor: '#667eea', color: '#667eea' }}>
                                                        <i className="fas fa-eye me-1"></i>
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {reports.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center py-5">
                                                    <i className="fas fa-folder-open fa-3x text-muted mb-3 d-block"></i>
                                                    <h6 className="text-muted">No reports yet</h6>
                                                    <p className="text-muted small">Start by reporting a hazard above</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default UserDashboard;