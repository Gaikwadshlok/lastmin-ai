import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Brain, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      // Login user with mock data
      login({ email, name: email.split('@')[0] });
      // Navigate to dashboard
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center p-4 sm:p-6">
      {/* Background blur overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm sm:max-w-md relative z-10"
      >
        <Card className="bg-card/95 backdrop-blur-md border-2 border-white shadow-2xl shadow-primary/25">
          <CardHeader className="text-center space-y-4 pb-6 sm:pb-8 px-6 sm:px-8 pt-6 sm:pt-8">
            <div className="flex justify-center">
              <div className="bg-gradient-primary p-3 sm:p-4 rounded-full shadow-lg shadow-primary/40">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Sign in to your LastMin AI account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-5 sm:space-y-6 px-6 sm:px-8 pb-6 sm:pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium text-sm sm:text-base">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 sm:pl-12 bg-input/60 border-border/60 h-12 sm:h-14 rounded-lg shadow-inner text-base touch-manipulation"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium text-sm sm:text-base">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 sm:pl-12 bg-input/60 border-border/60 h-12 sm:h-14 rounded-lg shadow-inner text-base touch-manipulation"
                    required
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 active:opacity-80 shadow-lg shadow-primary/30 h-12 sm:h-14 rounded-lg font-semibold text-base touch-manipulation"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="text-center mt-4">
              <Link 
                to="/" 
                className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
              >
                ← Back to home
              </Link>
            </div>
            
            <div className="text-center text-sm sm:text-base text-muted-foreground mt-6">
              Don't have an account?
            </div>
            <div className="text-center mt-3">
              <Link to="/signup">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-white/20 bg-card/60 hover:bg-card/80 active:bg-card/90 backdrop-blur-sm h-10 sm:h-12 px-6 touch-manipulation"
                >
                  Sign up
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
