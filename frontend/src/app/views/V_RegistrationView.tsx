import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../context/AuthContext';

export function V_RegistrationView() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'common',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (formData.role !== 'common' && formData.role !== 'owner') {
      newErrors.role = 'Invalid account role selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const success = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      role: formData.role as 'common' | 'owner',
    });

    if (success) {
      navigate('/');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-[480px]">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create your account to start booking homestays</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="bg-input-background"
                />
                {errors.firstName && (
                  <p className="text-xs text-error">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="bg-input-background"
                />
                {errors.lastName && (
                  <p className="text-xs text-error">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="bg-input-background"
              />
              {errors.email && (
                <p className="text-xs text-error">{errors.email}</p>
              )}
            </div>

            {/* Phone number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                className="bg-input-background"
              />
              {errors.phoneNumber && (
                <p className="text-xs text-error">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                I want to register as a:
              </label>
              
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                {/* Bullet Option 1: Common */}
                <label className="flex items-center space-x-3 cursor-pointer rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition w-full">
                  <input
                    type="radio"
                    name="role"
                    value="common"
                    checked={formData.role === 'common'}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span className="text-sm font-medium text-gray-900">Guest / Customer</span>
                </label>

                {/* Bullet Option 2: Owner */}
                <label className="flex items-center space-x-3 cursor-pointer rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition w-full">
                  <input
                    type="radio"
                    name="role"
                    value="owner"
                    checked={formData.role === 'owner'}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span className="text-sm font-medium text-gray-900">Homestay Owner</span>
                </label>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="bg-input-background"
              />
              {errors.password && (
                <p className="text-xs text-error">{errors.password}</p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="bg-input-background"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-error">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full">
              Register
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
