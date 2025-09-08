import { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  BookOpen, 
  BarChart3, 
  LogOut,
  GraduationCap,
  TrendingUp,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import StudentManagement from '@/components/admin/StudentManagement';
import CourseManagement from '@/components/admin/CourseManagement';
import ReportsSection from '@/components/admin/ReportsSection';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface DashboardData {
  totalStudents: number;
  totalCourses: number;
  registrationRate: number;
  activeRegistrations: number;
  feesPaid: number;
  feesUnpaid: number;
  departmentDistribution: { name: string; students: number }[];
  lastUpdated: string;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const adminKey = localStorage.getItem('admin_key');
      
      const { data, error } = await supabase.functions.invoke('admin-dashboard', {
        headers: {
          'x-admin-key': adminKey || '',
        },
      });

      if (error) throw error;
      
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
              <p className="text-white/90">
                Manage courses, students, and system operations
                {dashboardData && (
                  <span className="block text-sm text-white/70 mt-1">
                    Last updated: {new Date(dashboardData.lastUpdated).toLocaleString()}
                  </span>
                )}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading dashboard data...</span>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                  <Card className="academic-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-primary">{dashboardData?.totalStudents || 0}</p>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            Registered students
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
                          <p className="text-3xl font-bold text-primary">{dashboardData?.totalCourses || 0}</p>
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
                          <p className="text-3xl font-bold text-primary">{dashboardData?.registrationRate || 0}%</p>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            {dashboardData?.activeRegistrations || 0} active registrations
                          </div>
                        </div>
                        <BarChart3 className="h-8 w-8 text-primary/60" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="academic-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Fees Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-success">{dashboardData?.feesPaid || 0}</p>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            {dashboardData?.feesUnpaid || 0} unpaid
                          </div>
                        </div>
                        <AlertCircle className="h-8 w-8 text-success/60" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

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
            {!loading && dashboardData && (
              <Card className="academic-card">
                <CardHeader>
                  <CardTitle>Department Overview</CardTitle>
                  <CardDescription>Student distribution across departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {dashboardData.departmentDistribution.slice(0, 6).map((dept, index) => {
                      const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-destructive', 'bg-muted-foreground', 'bg-accent'];
                      const color = colors[index % colors.length];
                      
                      return (
                        <div key={dept.name} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${color}`}></div>
                            <div>
                              <p className="font-medium">{dept.name}</p>
                              <p className="text-sm text-muted-foreground">{dept.students} students</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{dept.students}</Badge>
                        </div>
                      );
                    })}
                    {dashboardData.departmentDistribution.length === 0 && (
                      <div className="col-span-3 text-center text-muted-foreground py-4">
                        No department data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
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