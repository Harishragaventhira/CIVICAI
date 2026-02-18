import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('citizen');
    const [region, setRegion] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Password strength checker
    useEffect(() => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (password.match(/[a-z]/)) strength += 1;
        if (password.match(/[A-Z]/)) strength += 1;
        if (password.match(/[0-9]/)) strength += 1;
        if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
        setPasswordStrength(strength);
    }, [password]);

    const getPasswordStrengthText = () => {
        if (password.length === 0) return '';
        if (passwordStrength <= 2) return 'Weak';
        if (passwordStrength <= 3) return 'Medium';
        if (passwordStrength >= 4) return 'Strong';
        return '';
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 2) return '#dc3545';
        if (passwordStrength <= 3) return '#ffc107';
        if (passwordStrength >= 4) return '#28a745';
        return '#6c757d';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate region for mayor
        if (role === 'mayor' && !region.trim()) {
            setError('Please enter your city/region');
            return;
        }

        setIsLoading(true);
        
        // Simulate minimum loading time for better UX
        setTimeout(async () => {
            const result = await register({ username, password, role, region });
            if (result.success) {
                // Success animation before redirect
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            } else {
                setError(result.message);
            }
            setIsLoading(false);
        }, 800);
    };

    return (
        <Layout>
            <div className="container d-flex justify-content-center align-items-center min-vh-100">
                <div 
                    className="card border-0 shadow-lg mt-5" 
                    style={{ 
                        maxWidth: '450px', 
                        width: '100%',
                        borderRadius: '15px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        animation: 'slideIn 0.5s ease-out'
                    }}
                >
                    <style jsx>{`
                        @keyframes slideIn {
                            from {
                                opacity: 0;
                                transform: translateY(-30px);
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
                        
                        @keyframes shake {
                            0%, 100% { transform: translateX(0); }
                            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                            20%, 40%, 60%, 80% { transform: translateX(5px); }
                        }
                        
                        .input-group-custom {
                            transition: all 0.3s ease;
                        }
                        
                        .input-group-custom:hover {
                            transform: translateX(5px);
                        }
                        
                        .input-group-custom:focus-within {
                            transform: translateX(5px);
                        }
                        
                        .custom-input, .custom-select {
                            transition: all 0.3s ease;
                            border: 2px solid transparent;
                            border-radius: 10px;
                        }
                        
                        .custom-input:focus, .custom-select:focus {
                            border-color: #667eea;
                            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                        }
                        
                        .error-alert {
                            animation: shake 0.5s ease-in-out;
                        }
                        
                        .register-btn {
                            position: relative;
                            overflow: hidden;
                            transition: all 0.3s ease;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border: none;
                        }
                        
                        .register-btn:hover:not(:disabled) {
                            transform: translateY(-2px);
                            box-shadow: 0 7px 14px rgba(102, 126, 234, 0.2), 0 3px 6px rgba(0, 0, 0, 0.08);
                        }
                        
                        .register-btn:active:not(:disabled) {
                            transform: translateY(1px);
                        }
                        
                        .register-btn:disabled {
                            opacity: 0.7;
                            cursor: not-allowed;
                        }
                        
                        .register-btn.loading {
                            animation: pulse 1.5s infinite;
                        }
                        
                        .link-custom {
                            position: relative;
                            text-decoration: none;
                            transition: all 0.3s ease;
                        }
                        
                        .link-custom::after {
                            content: '';
                            position: absolute;
                            width: 0;
                            height: 2px;
                            bottom: -2px;
                            left: 0;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            transition: width 0.3s ease;
                        }
                        
                        .link-custom:hover::after {
                            width: 100%;
                        }
                        
                        .password-strength-bar {
                            height: 4px;
                            transition: all 0.3s ease;
                            border-radius: 2px;
                        }
                        
                        .role-selector {
                            cursor: pointer;
                            transition: all 0.3s ease;
                        }
                        
                        .role-selector:hover {
                            transform: translateY(-2px);
                        }
                        
                        .role-selector.selected {
                            border: 2px solid #667eea;
                            background-color: rgba(102, 126, 234, 0.1);
                        }
                        
                        .region-field {
                            transition: all 0.3s ease;
                            max-height: 0;
                            opacity: 0;
                            overflow: hidden;
                        }
                        
                        .region-field.show {
                            max-height: 100px;
                            opacity: 1;
                            margin-top: 1rem;
                        }
                    `}</style>
                    
                    <div className="card-header bg-transparent border-0 text-white text-center pt-4">
                        <div 
                            className="mb-3"
                            style={{
                                animation: 'pulse 2s infinite'
                            }}
                        >
                            <i className="fas fa-user-plus fa-3x"></i>
                        </div>
                        <h3 className="fw-bold">Join Our Community</h3>
                        <p className="text-white-50">Create your account to get started</p>
                    </div>
                    
                    <div className="card-body bg-white p-4" style={{ borderRadius: '15px' }}>
                        {error && (
                            <div 
                                className="alert alert-danger error-alert d-flex align-items-center" 
                                role="alert"
                                style={{
                                    borderLeft: '4px solid #dc3545',
                                    borderRadius: '8px'
                                }}
                            >
                                <i className="fas fa-exclamation-circle me-2"></i>
                                <div>{error}</div>
                                <button 
                                    type="button" 
                                    className="btn-close ms-auto" 
                                    onClick={() => setError('')}
                                    aria-label="Close"
                                ></button>
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4 input-group-custom">
                                <label className="form-label text-muted mb-2">
                                    <i className="fas fa-user me-2" style={{ color: '#667eea' }}></i>
                                    Username
                                </label>
                                <input
                                    type="text"
                                    className="form-control custom-input py-2"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder="Choose a username"
                                />
                            </div>
                            
                            <div className="mb-4 input-group-custom">
                                <label className="form-label text-muted mb-2">
                                    <i className="fas fa-key me-2" style={{ color: '#667eea' }}></i>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    className="form-control custom-input py-2"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Create a password"
                                />
                                {password && (
                                    <>
                                        <div className="d-flex align-items-center mt-2">
                                            <div className="flex-grow-1 me-2">
                                                <div className="password-strength-bar" style={{ 
                                                    width: `${(passwordStrength / 5) * 100}%`,
                                                    backgroundColor: getPasswordStrengthColor()
                                                }}></div>
                                            </div>
                                            <small style={{ color: getPasswordStrengthColor() }}>
                                                {getPasswordStrengthText()}
                                            </small>
                                        </div>
                                        <small className="text-muted">
                                            Use at least 8 characters with mix of letters, numbers & symbols
                                        </small>
                                    </>
                                )}
                            </div>
                            
                            <div className="mb-4 input-group-custom">
                                <label className="form-label text-muted mb-2">
                                    <i className="fas fa-check-circle me-2" style={{ color: '#667eea' }}></i>
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    className="form-control custom-input py-2"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Re-enter your password"
                                />
                                {confirmPassword && password !== confirmPassword && (
                                    <small className="text-danger mt-1">
                                        <i className="fas fa-times-circle me-1"></i>
                                        Passwords do not match
                                    </small>
                                )}
                            </div>
                            
                            <div className="mb-4">
                                <label className="form-label text-muted mb-2">
                                    <i className="fas fa-user-tag me-2" style={{ color: '#667eea' }}></i>
                                    I am a:
                                </label>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <div 
                                            className={`role-selector p-3 text-center rounded-3 ${role === 'citizen' ? 'selected' : 'border'}`}
                                            onClick={() => setRole('citizen')}
                                        >
                                            <i className="fas fa-user mb-2 d-block" style={{ fontSize: '1.5rem', color: role === 'citizen' ? '#667eea' : '#6c757d' }}></i>
                                            <span className={role === 'citizen' ? 'text-primary' : 'text-muted'} style={{ color: role === 'citizen' ? '#667eea' : '#6c757d' }}>Citizen</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div 
                                            className={`role-selector p-3 text-center rounded-3 ${role === 'mayor' ? 'selected' : 'border'}`}
                                            onClick={() => setRole('mayor')}
                                        >
                                            <i className="fas fa-city mb-2 d-block" style={{ fontSize: '1.5rem', color: role === 'mayor' ? '#667eea' : '#6c757d' }}></i>
                                            <span className={role === 'mayor' ? 'text-primary' : 'text-muted'} style={{ color: role === 'mayor' ? '#667eea' : '#6c757d' }}>Mayor/Authority</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`region-field ${role === 'mayor' ? 'show' : ''}`}>
                                <div className="input-group-custom">
                                    <label className="form-label text-muted mb-2">
                                        <i className="fas fa-map-marker-alt me-2" style={{ color: '#667eea' }}></i>
                                        City/Region (For Mayors)
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control custom-input py-2"
                                        placeholder="e.g., Chennai, Mumbai"
                                        value={region}
                                        onChange={(e) => setRegion(e.target.value)}
                                        required={role === 'mayor'}
                                    />
                                </div>
                            </div>
                            
                            <button 
                                type="submit" 
                                className={`register-btn btn text-white w-100 py-3 mt-4 ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading}
                                style={{
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-user-plus me-2"></i>
                                        Create Account
                                    </>
                                )}
                            </button>
                            
                            <div className="text-center mt-4">
                                <Link 
                                    to="/login" 
                                    className="link-custom text-decoration-none"
                                    style={{
                                        color: '#667eea',
                                        fontWeight: '500'
                                    }}
                                >
                                    <i className="fas fa-sign-in-alt me-2"></i>
                                    Already have an account? Login
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Register;