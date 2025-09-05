import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentDashboard from '@/components/dashboards/StudentDashboard';

interface StudentLoginProps {
  onBack: () => void;
}

const StudentLogin = ({ onBack }: StudentLoginProps) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    matricNumber: '',
    password: '',
    fullName: '',
    department: '',
    level: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login/signup - in real app, this would be authentication
    if (isSignup) {
      // Signup logic
      if (formData.matricNumber && formData.password && formData.fullName && formData.department && formData.level) {
        setIsLoggedIn(true);
      }
    } else {
      // Login logic
      if (formData.matricNumber && formData.password) {
        setIsLoggedIn(true);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  if (isLoggedIn) {
    return <StudentDashboard studentData={{
      name: formData.fullName || "John Doe",
      matricNumber: formData.matricNumber,
      department: formData.department || "Computer Science",
      level: formData.level || "ND2",
      feesPaid: true
    }} onLogout={() => setIsLoggedIn(false)} />;
  }

  return (
    <div className="min-h-screen gradient-secondary flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="academic-card">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="p-2 hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                {isSignup ? (
                  <UserPlus className="h-6 w-6 text-primary" />
                ) : (
                  <BookOpen className="h-6 w-6 text-primary" />
                )}
                <span className="font-semibold text-primary">Student Portal</span>
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignup 
                ? 'Register as a new student to access course registration'
                : 'Sign in to your student account to access course registration'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="pl-10 input-academic"
                      required={isSignup}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="matricNumber">Matric Number</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="matricNumber"
                    name="matricNumber"
                    type="text"
                    placeholder="e.g., 2023/ND/CS/001"
                    value={formData.matricNumber}
                    onChange={handleInputChange}
                    className="pl-10 input-academic"
                    required
                  />
                </div>
              </div>

              {isSignup && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select onValueChange={(value) => handleSelectChange('department', value)} required>
                      <SelectTrigger className="input-academic">
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="computer-science">Computer Science</SelectItem>
                        <SelectItem value="business-administration">Business Administration</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="science-lab-tech">Science Laboratory Technology</SelectItem>
                        <SelectItem value="accountancy">Accountancy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select onValueChange={(value) => handleSelectChange('level', value)} required>
                      <SelectTrigger className="input-academic">
                        <SelectValue placeholder="Select your level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ND1">ND1</SelectItem>
                        <SelectItem value="ND2">ND2</SelectItem>
                        <SelectItem value="HND1">HND1</SelectItem>
                        <SelectItem value="HND2">HND2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignup ? "Create a password" : "Enter your password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 input-academic"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {!isSignup && (
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Button variant="link" className="p-0 h-auto font-normal text-primary">
                      Forgot password?
                    </Button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full btn-hero">
                {isSignup ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary"
              >
                {isSignup 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </Button>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Need help? Contact your department or ICT support
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentLogin;