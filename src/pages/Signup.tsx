import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Brain, Mail, Lock, User, Eye, EyeOff, Check, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Validate password
  const validatePassword = (password: string) => {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return errors;
  };

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push('Name is required');
    } else if (formData.name.length < 2 || formData.name.length > 50) {
      errors.push('Name must be between 2 and 50 characters');
    }
    
    if (!formData.email.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please provide a valid email');
    }
    
    const passwordErrors = validatePassword(formData.password);
    errors.push(...passwordErrors);
    
    return errors;
  };

  const handleSignup = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setError('');
    setValidationErrors([]);
    
    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return false;
    }
    
    setIsLoading(true);
    
    try {
      const result = await register(formData);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
    
    return false;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
    
    // Clear general error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSignup();
    }
  };

  return (
    <div className="h-screen bg-gradient-cosmic flex items-center justify-center p-2 overflow-hidden">
      {/* Background blur overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative z-10"
      >
        <Card className="bg-card/95 backdrop-blur-md border-2 border-white shadow-2xl shadow-primary/25">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="flex justify-center">
              <div className="bg-gradient-primary p-2 rounded-full shadow-lg shadow-primary/40">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-foreground">
              Create Account
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Start your journey with LastMin AI
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 px-6 pb-6">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-sm text-foreground font-medium">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.name}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="pl-10 bg-input/60 border-border/60 h-10 rounded-lg shadow-inner text-sm"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm text-foreground font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="pl-10 bg-input/60 border-border/60 h-10 rounded-lg shadow-inner text-sm"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm text-foreground font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="pl-10 pr-12 bg-input/60 border-border/60 h-10 rounded-lg shadow-inner text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {/* Password requirements - Only show when password field has content */}
                {formData.password && (
                  <div className="text-xs mt-2 space-y-2">
                    <div className="font-medium text-muted-foreground">Password must contain:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`flex items-center gap-2 transition-all duration-200 ${formData.password.length >= 6 ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <div className={`flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-200 ${
                          formData.password.length >= 6 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-muted-foreground/30'
                        }`}>
                          {formData.password.length >= 6 ? (
                            <Check className="w-2.5 h-2.5 text-white" />
                          ) : (
                            <X className="w-2.5 h-2.5 text-muted-foreground/50" />
                          )}
                        </div>
                        <span className={formData.password.length >= 6 ? 'font-medium' : ''}>
                          6+ characters
                        </span>
                      </div>
                      
                      <div className={`flex items-center gap-2 transition-all duration-200 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <div className={`flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-200 ${
                          /[a-z]/.test(formData.password) 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-muted-foreground/30'
                        }`}>
                          {/[a-z]/.test(formData.password) ? (
                            <Check className="w-2.5 h-2.5 text-white" />
                          ) : (
                            <X className="w-2.5 h-2.5 text-muted-foreground/50" />
                          )}
                        </div>
                        <span className={/[a-z]/.test(formData.password) ? 'font-medium' : ''}>
                          Lowercase
                        </span>
                      </div>
                      
                      <div className={`flex items-center gap-2 transition-all duration-200 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <div className={`flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-200 ${
                          /[A-Z]/.test(formData.password) 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-muted-foreground/30'
                        }`}>
                          {/[A-Z]/.test(formData.password) ? (
                            <Check className="w-2.5 h-2.5 text-white" />
                          ) : (
                            <X className="w-2.5 h-2.5 text-muted-foreground/50" />
                          )}
                        </div>
                        <span className={/[A-Z]/.test(formData.password) ? 'font-medium' : ''}>
                          Uppercase
                        </span>
                      </div>
                      
                      <div className={`flex items-center gap-2 transition-all duration-200 ${/\d/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <div className={`flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-200 ${
                          /\d/.test(formData.password) 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-muted-foreground/30'
                        }`}>
                          {/\d/.test(formData.password) ? (
                            <Check className="w-2.5 h-2.5 text-white" />
                          ) : (
                            <X className="w-2.5 h-2.5 text-muted-foreground/50" />
                          )}
                        </div>
                        <span className={/\d/.test(formData.password) ? 'font-medium' : ''}>
                          Number
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {validationErrors.length > 0 && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-600 text-sm font-medium mb-1">Please fix the following:</p>
                  <ul className="text-yellow-600 text-sm space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-yellow-500 mt-0.5">•</span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
              
              <Button
                type="button"
                onClick={handleSignup}
                className="w-full bg-gradient-primary hover:bg-gradient-primary/90 shadow-lg shadow-primary/30 h-10 rounded-lg font-semibold text-sm mt-4 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isLoading || validationErrors.length > 0}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
            
            <div className="text-center mt-3">
              <Link 
                to="/" 
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to home
              </Link>
            </div>
            
            <div className="text-center text-xs text-muted-foreground mt-3">
              Already have an account?
            </div>
            <div className="text-center mt-1">
              <Link to="/login">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-white/20 bg-card/60 hover:bg-card/80 backdrop-blur-sm text-xs h-8"
                >
                  Sign in
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
