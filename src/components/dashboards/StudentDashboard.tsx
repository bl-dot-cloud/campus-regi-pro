import { useState } from 'react';
import { 
  BookOpen, 
  User, 
  CreditCard, 
  FileText, 
  LogOut,
  CheckCircle,
  AlertCircle,
  Download,
  Plus,
  History
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CourseRegistration from '@/components/courses/CourseRegistration';
import RegistrationHistory from '@/components/courses/RegistrationHistory';
import ProfileManagement from '@/components/profile/ProfileManagement';

interface StudentData {
  name: string;
  matricNumber: string;
  department: string;
  level: string;
  feesPaid: boolean;
}

interface StudentDashboardProps {
  studentData: StudentData;
  onLogout: () => void;
}

const StudentDashboard = ({ studentData, onLogout }: StudentDashboardProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentStudentData, setCurrentStudentData] = useState(studentData);

  const handleProfileUpdate = (updatedData: StudentData) => {
    setCurrentStudentData(updatedData);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'courses':
        return <CourseRegistration studentData={currentStudentData} />;
      case 'history':
        return <RegistrationHistory studentData={currentStudentData} />;
      case 'profile':
        return <ProfileManagement studentData={currentStudentData} onProfileUpdate={handleProfileUpdate} />;
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="gradient-hero rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Welcome back, {studentData.name}!</h2>
              <p className="text-white/90">Ready to manage your academic journey</p>
            </div>

            {/* Status Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="academic-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Student Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Matric Number</span>
                    <p className="font-medium">{studentData.matricNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Department</span>
                    <p className="font-medium">{studentData.department}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Level</span>
                    <p className="font-medium">{studentData.level}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="academic-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Fees Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {studentData.feesPaid ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <div>
                        <p className="font-medium text-success">Paid</p>
                        <p className="text-sm text-muted-foreground">You can register for courses</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-warning" />
                        <div>
                          <p className="font-medium text-warning">Pending</p>
                          <p className="text-sm text-muted-foreground">Please pay school fees</p>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">Pay School Fees</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="academic-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Registration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Courses Registered</p>
                      <p className="font-medium">5 courses (18 units)</p>
                    </div>
                    <Badge variant="secondary" className="w-full justify-center">
                      Registration Complete
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="academic-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto p-4"
                    onClick={() => setActiveTab('courses')}
                    disabled={!studentData.feesPaid}
                  >
                    <div className="flex items-center gap-3">
                      <Plus className="h-5 w-5" />
                      <div className="text-left">
                        <p className="font-medium">Register for Courses</p>
                        <p className="text-sm text-muted-foreground">
                          {studentData.feesPaid ? 'Add or modify courses' : 'Fees payment required'}
                        </p>
                      </div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="flex items-center gap-3">
                      <Download className="h-5 w-5" />
                      <div className="text-left">
                        <p className="font-medium">Download Registration Slip</p>
                        <p className="text-sm text-muted-foreground">Get PDF copy</p>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto p-4"
                    onClick={() => setActiveTab('profile')}
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5" />
                      <div className="text-left">
                        <p className="font-medium">Update Profile</p>
                        <p className="text-sm text-muted-foreground">Manage personal info</p>
                      </div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5" />
                      <div className="text-left">
                        <p className="font-medium">View Academic Records</p>
                        <p className="text-sm text-muted-foreground">Transcripts and results</p>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-primary">Foundation Polytechnic</h1>
                <p className="text-sm text-muted-foreground">Student Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {studentData.name} ({studentData.matricNumber})
              </span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
              { id: 'courses', label: 'Course Registration', icon: Plus },
              { id: 'history', label: 'Registration History', icon: History },
              { id: 'profile', label: 'Profile', icon: User }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default StudentDashboard;