import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Brain, Mail, Lock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    // Simulate signup process
    setTimeout(() => {
      setIsLoading(false);
      // Login user with their data
      login({ email: formData.email, name: formData.name });
      // Navigate to dashboard
      navigate('/dashboard');
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
            <form onSubmit={handleSignup} className="space-y-3">
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
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 bg-input/60 border-border/60 h-10 rounded-lg shadow-inner text-sm"
                    required
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:bg-gradient-primary/90 shadow-lg shadow-primary/30 h-10 rounded-lg font-semibold text-sm mt-4 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isLoading}
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
            </form>
            
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
