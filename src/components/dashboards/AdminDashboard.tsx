import { useState } from 'react';
import { 
  Settings, 
  Users, 
  BookOpen, 
  BarChart3, 
  LogOut,
  GraduationCap,
  TrendingUp,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StudentManagement from '@/components/admin/StudentManagement';
import CourseManagement from '@/components/admin/CourseManagement';
import ReportsSection from '@/components/admin/ReportsSection';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'courses':
        return <CourseManagement />;
      case 'students':
        return <StudentManagement />;
      case 'reports':
        return <ReportsSection />;
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="gradient-hero rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Administrator Dashboard</h2>
              <p className="text-white/90">Manage courses, students, and system operations</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="academic-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-primary">1,247</p>
                      <div className="flex items-center text-sm text-success mt-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +12% from last semester
                      </div>
                    </div>
                    <Users className="h-8 w-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="academic-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-primary">156</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        Across all departments
                      </div>
                    </div>
                    <BookOpen className="h-8 w-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="academic-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Registration Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-primary">87%</p>
                      <div className="flex items-center text-sm text-success mt-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Above target
                      </div>
                    </div>
                    <BarChart3 className="h-8 w-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="academic-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-warning">23</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        Require attention
                      </div>
                    </div>
                    <AlertCircle className="h-8 w-8 text-warning/60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="academic-card">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system activities and updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Course registration opened</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New student account created</p>
                      <p className="text-xs text-muted-foreground">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">System maintenance scheduled</p>
                      <p className="text-xs text-muted-foreground">6 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Database backup completed</p>
                      <p className="text-xs text-muted-foreground">8 hours ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="academic-card">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex-col"
                      onClick={() => setActiveTab('courses')}
                    >
                      <BookOpen className="h-6 w-6 mb-2" />
                      <span className="text-sm">Manage Courses</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex-col"
                      onClick={() => setActiveTab('students')}
                    >
                      <Users className="h-6 w-6 mb-2" />
                      <span className="text-sm">Manage Students</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex-col"
                      onClick={() => setActiveTab('reports')}
                    >
                      <BarChart3 className="h-6 w-6 mb-2" />
                      <span className="text-sm">View Reports</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex-col">
                      <FileText className="h-6 w-6 mb-2" />
                      <span className="text-sm">Export Data</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department Overview */}
            <Card className="academic-card">
              <CardHeader>
                <CardTitle>Department Overview</CardTitle>
                <CardDescription>Student distribution across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { name: 'Computer Science', students: 342, color: 'bg-primary' },
                    { name: 'Engineering', students: 289, color: 'bg-success' },
                    { name: 'Business Studies', students: 256, color: 'bg-warning' },
                    { name: 'Science Technology', students: 198, color: 'bg-destructive' },
                    { name: 'General Studies', students: 162, color: 'bg-muted-foreground' }
                  ].map((dept) => (
                    <div key={dept.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${dept.color}`}></div>
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-sm text-muted-foreground">{dept.students} students</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{dept.students}</Badge>
                    </div>
                  ))}
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
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-primary">Foundation Polytechnic</h1>
                <p className="text-sm text-muted-foreground">Administrator Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Admin</Badge>
              <Button variant="outline" size="sm" onClick={() => { localStorage.removeItem('admin_key'); onLogout(); }}>
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
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'courses', label: 'Courses', icon: BookOpen },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'reports', label: 'Reports', icon: FileText }
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

export default AdminDashboard;