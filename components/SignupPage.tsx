import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

const SignupPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        setLoading(true);
        try {
            await api.signup({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                pass: formData.password,
            });
            alert('Account created successfully! Please log in.');
            navigate('/login');
        } catch (err: any) {
            setError(err.message || 'An error occurred during signup.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create a new customer account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input name="name" type="text" required className="form-input rounded-t-md" placeholder="Full Name" value={formData.name} onChange={handleChange} />
                        </div>
                        <div>
                            <input name="email" type="email" autoComplete="email" required className="form-input" placeholder="Email address" value={formData.email} onChange={handleChange} />
                        </div>
                        <div>
                            <input name="phone" type="tel" required className="form-input" placeholder="Phone Number (e.g., 2547...)" value={formData.phone} onChange={handleChange} />
                        </div>
                        <div>
                            <input name="password" type="password" required className="form-input" placeholder="Password" value={formData.password} onChange={handleChange} />
                        </div>
                        <div>
                            <input name="confirmPassword" type="password" required className="form-input rounded-b-md" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:bg-gray-400">
                            {loading ? 'Creating Account...' : 'Sign up'}
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
             <style>{`
                .form-input {
                    appearance: none;
                    position: relative;
                    display: block;
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #d1d5db;
                    placeholder-color: #6b7280;
                    color: #111827;
                }
                .form-input:focus {
                    outline: none;
                    z-index: 10;
                    --tw-ring-color: #0077b6;
                    box-shadow: 0 0 0 2px var(--tw-ring-color);
                    border-color: var(--tw-ring-color);
                }
            `}</style>
        </div>
    );
};

export default SignupPage;
