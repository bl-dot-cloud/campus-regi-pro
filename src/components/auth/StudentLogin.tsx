import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import StudentDashboard from '@/components/dashboards/StudentDashboard';

interface StudentLoginProps {
  onBack: () => void;
}

const StudentLogin = ({ onBack }: StudentLoginProps) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    matricNumber: '',
    department: '',
    level: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignup = async () => {
    if (!formData.email || !formData.password || !formData.fullName || !formData.matricNumber || !formData.department || !formData.level) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Check if matric number already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('matric_number')
        .eq('matric_number', formData.matricNumber)
        .single();

      if (existingProfile) {
        toast({
          title: "Error",
          description: "This matric number is already registered",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
            matric_number: formData.matricNumber,
            department: formData.department,
            level: formData.level
          }
        }
      });

      if (error) {
        toast({
          title: "Signup Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email to verify your account.",
        });
        // Broadcast student signup event to admin dashboard
        supabase.channel('admin-students').send({ type: 'broadcast', event: 'student_signed_up', payload: {} });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please enter your email and password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        toast({
          title: "Login Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup) {
      handleSignup();
    } else {
      handleLogin();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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

  // If user is authenticated and has profile data, show dashboard
  if (user && profile) {
    return <StudentDashboard 
      studentData={{
        name: profile.full_name,
        matricNumber: profile.matric_number,
        department: profile.department,
        level: profile.level,
        feesPaid: profile.fees_paid
      }} 
      onLogout={handleLogout} 
    />;
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
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 input-academic"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {isSignup && (
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
                      required={isSignup}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

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
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
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

              <Button type="submit" className="w-full btn-hero" disabled={loading}>
                {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
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