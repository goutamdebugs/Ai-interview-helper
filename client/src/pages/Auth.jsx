// pages/Auth.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword, validateName } from '../utils/validators';
import '../styles/Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, loading, error, clearError } = useAuth();
  
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/interview');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when switching tabs
  useEffect(() => {
    clearError();
    setFormErrors({});
  }, [activeTab, clearError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (activeTab === 'register') {
      if (!validateName(formData.name)) {
        errors.name = 'Name must be at least 2 characters';
      }
      
      if (!validateEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
      
      if (!validatePassword(formData.password)) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else {
      if (!validateEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
      
      if (!formData.password) {
        errors.password = 'Password is required';
      }
    }

    return errors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitLoading(false);
      return;
    }
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/interview');
    }
    
    setSubmitLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitLoading(false);
      return;
    }
    
    const result = await register(formData.name, formData.email, formData.password);
    
    if (result.success) {
      navigate('/interview');
    }
    
    setSubmitLoading(false);
  };

  const handleSubmit = (e) => {
    if (activeTab === 'login') {
      handleLogin(e);
    } else {
      handleRegister(e);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-loading">
          <div className="loader"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>AI Interview Coach</h1>
          <p>Practice makes perfect. Get AI-powered feedback on your interview skills.</p>
        </div>

        <div className="auth-tabs">
          <div
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </div>
          <div
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </div>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {activeTab === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={formErrors.name ? 'error' : ''}
                disabled={submitLoading}
              />
              {formErrors.name && (
                <div className="error-message">{formErrors.name}</div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className={formErrors.email ? 'error' : ''}
              disabled={submitLoading}
            />
            {formErrors.email && (
              <div className="error-message">{formErrors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className={formErrors.password ? 'error' : ''}
              disabled={submitLoading}
            />
            {formErrors.password && (
              <div className="error-message">{formErrors.password}</div>
            )}
          </div>

          {activeTab === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className={formErrors.confirmPassword ? 'error' : ''}
                disabled={submitLoading}
              />
              {formErrors.confirmPassword && (
                <div className="error-message">{formErrors.confirmPassword}</div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={submitLoading}
          >
            {submitLoading ? 'Processing...' : activeTab === 'login' ? 'Login' : 'Register'}
          </button>

          <div className="auth-links">
            {activeTab === 'login' ? (
              <p>
                Don't have an account?{' '}
                <a href="#" onClick={() => setActiveTab('register')}>
                  Register here
                </a>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <a href="#" onClick={() => setActiveTab('login')}>
                  Login here
                </a>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;