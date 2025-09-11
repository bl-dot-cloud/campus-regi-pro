import { useState } from 'react';
import { BookOpen, GraduationCap, Settings, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StudentLogin from '@/components/auth/StudentLogin';
import AdminLogin from '@/components/auth/AdminLogin';
import foundation from "../../images/foundation.jpg";

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin' | null>(null);

  const resetSelection = () => setSelectedRole(null);

  if (selectedRole === 'student') {
    return <StudentLogin onBack={resetSelection} />;
  }

  if (selectedRole === 'admin') {
    return <AdminLogin onBack={resetSelection} />;
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${foundation})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      <div className="max-w-4xl w-full z-10">
        {/* Hero Section */}
        <div className="text-center text-white mb-12">
          <div className="flex items-center justify-center mb-6">
            <GraduationCap className="h-16 w-16" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome To Foundation Polytechnic
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-2">
            Course Registration System
          </p>
          <p className="text-lg text-white/80">
            Welcome to our modern, streamlined course registration platform
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Card className="academic-card cursor-pointer transform hover:scale-105 transition-bounce bg-white/95" 
                onClick={() => setSelectedRole('student')}>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl text-primary">Student Portal</CardTitle>
              <CardDescription className="text-base">
                Register for courses, view your profile, and manage your academic journey
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full btn-hero">
                Continue as Student
              </Button>
              <div className="mt-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Users className="h-4 w-4" />
                  <span>Login with Matric Number</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="academic-card cursor-pointer transform hover:scale-105 transition-bounce bg-white/95" 
                onClick={() => setSelectedRole('admin')}>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Settings className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl text-primary">Admin Portal</CardTitle>
              <CardDescription className="text-base">
                Manage courses, students, and generate comprehensive reports
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full btn-hero">
                Continue as Admin
              </Button>
              <div className="mt-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Settings className="h-4 w-4" />
                  <span>Administrative Access</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12 text-white/90">
          <p className="text-sm">
            For technical support, contact the ICT department
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;