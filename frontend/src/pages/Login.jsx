import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

function Login() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        // Simulate minimum loading time for better UX
        setTimeout(async () => {
            const result = await login(username, password);
            if (!result.success) {
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
                        maxWidth: '420px', 
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
                        
                        .input-group-custom {
                            transition: all 0.3s ease;
                        }
                        
                        .input-group-custom:hover {
                            transform: translateX(5px);
                        }
                        
                        .input-group-custom:focus-within {
                            transform: translateX(5px);
                        }
                        
                        .custom-input {
                            transition: all 0.3s ease;
                            border: 2px solid transparent;
                        }
                        
                        .custom-input:focus {
                            border-color: #667eea;
                            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                        }
                        
                        .error-alert {
                            animation: shake 0.5s ease-in-out;
                        }
                        
                        @keyframes shake {
                            0%, 100% { transform: translateX(0); }
                            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                            20%, 40%, 60%, 80% { transform: translateX(5px); }
                        }
                        
                        .login-btn {
                            position: relative;
                            overflow: hidden;
                            transition: all 0.3s ease;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border: none;
                        }
                        
                        .login-btn:hover:not(:disabled) {
                            transform: translateY(-2px);
                            box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
                        }
                        
                        .login-btn:active:not(:disabled) {
                            transform: translateY(1px);
                        }
                        
                        .login-btn:disabled {
                            opacity: 0.7;
                            cursor: not-allowed;
                        }
                        
                        .login-btn.loading {
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
                    `}</style>
                    
                    <div className="card-header bg-transparent border-0 text-white text-center pt-4">
                        <div 
                            className="mb-3"
                            style={{
                                animation: 'pulse 2s infinite'
                            }}
                        >
                            <i className="fas fa-lock fa-3x"></i>
                        </div>
                        <h3 className="fw-bold">Welcome Back!</h3>
                        <p className="text-white-50">Please login to your account</p>
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
                                    <i className="fas fa-user me-2"></i>
                                    Username
                                </label>
                                <input
                                    type="text"
                                    className="form-control custom-input py-2"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder="Enter your username"
                                    style={{
                                        borderRadius: '10px'
                                    }}
                                />
                            </div>
                            
                            <div className="mb-4 input-group-custom">
                                <label className="form-label text-muted mb-2">
                                    <i className="fas fa-key me-2"></i>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    className="form-control custom-input py-2"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                    style={{
                                        borderRadius: '10px'
                                    }}
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                className={`login-btn btn text-white w-100 py-3 mb-3 ${isLoading ? 'loading' : ''}`}
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
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-sign-in-alt me-2"></i>
                                        Login
                                    </>
                                )}
                            </button>
                            
                            <div className="text-center mt-3">
                                <Link 
                                    to="/register" 
                                    className="link-custom text-decoration-none"
                                    style={{
                                        color: '#667eea',
                                        fontWeight: '500'
                                    }}
                                >
                                    <i className="fas fa-user-plus me-2"></i>
                                    Create a New Account
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Login;