import React, { useState, useEffect } from 'react';

import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getReports, resolveReport } from '../services/api';

function MayorDashboard() {
    const { user, logout } = useAuth();
    const [reports, setReports] = useState([]);

    useEffect(() => {
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

    const handleResolve = async (id) => {
        try {
            await resolveReport(id);
            // Optimistically update UI or re-fetch
            setReports(reports.map(r => r.id === id ? { ...r, status: 'Resolved' } : r));
        } catch (error) {
            console.error("Failed to resolve report", error);
            alert("Failed to resolve report");
        }
    };

    return (
        <Layout>
            <nav className="navbar navbar-dark bg-dark shadow rounded mb-4 p-3">
                <span className="navbar-brand">🏛 Mayor Dashboard - {user?.region}</span>
                <button onClick={logout} className="btn btn-outline-light">
                    Logout
                </button>
            </nav>

            <div className="table-responsive shadow">
                <table className="table table-hover align-middle border">
                    <thead className="table-secondary">
                        <tr>
                            <th>Evidence</th>
                            <th>Hazard Type</th>
                            <th>Address</th>
                            <th>Coordinates</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((r) => (
                            <tr key={r.id}>
                                <td>
                                    <a href={`/${r.annotated_path}`} target="_blank" rel="noreferrer">
                                        <img
                                            src={`/${r.annotated_path}`}
                                            width="100"
                                            className="rounded border"
                                            alt="Evidence"
                                        />
                                    </a>
                                </td>
                                <td>
                                    <span className="badge bg-danger">{r.hazard_type}</span>
                                </td>
                                <td>{r.address}</td>
                                <td>
                                    <small>
                                        {r.latitude}, {r.longitude}
                                    </small>
                                </td>
                                <td>
                                    {r.status === 'Pending' ? (
                                        <span className="badge bg-warning text-dark">Pending</span>
                                    ) : (
                                        <span className="badge bg-success">Resolved</span>
                                    )}
                                </td>
                                <td>
                                    {r.status === 'Pending' ? (
                                        <button
                                            onClick={() => handleResolve(r.id)}
                                            className="btn btn-success btn-sm"
                                        >
                                            ✔ Fix Issue
                                        </button>
                                    ) : (
                                        <button className="btn btn-secondary btn-sm" disabled>
                                            Closed
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {reports.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    No active hazards in {user?.region}.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}

export default MayorDashboard;