import { useState, useEffect } from 'react';
import { BarChart, FileText, Download, Calendar, TrendingUp, Users, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReportData {
  students: {
    total: number;
    byDepartment: Record<string, number>;
    byLevel: Record<string, number>;
    feesPaid: number;
    feesUnpaid: number;
  };
  courses: {
    total: number;
    byDepartment: Record<string, number>;
    byLevel: Record<string, number>;
  };
  registrations: {
    total: number;
    byLevel: Record<string, number>;
    bySemester: Record<string, number>;
  };
}

interface CourseRegistrationDetail {
  student_name: string;
  matric_number: string;
  course_code: string;
  course_title: string;
  department: string;
  level: string;
  units: number;
  registration_date: string;
}

export default function ReportsSection() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [registrationDetails, setRegistrationDetails] = useState<CourseRegistrationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      const adminKey = localStorage.getItem('admin_key') || '';
      const { data, error } = await supabase.functions.invoke('admin-reports', {
        headers: { 'x-admin-key': adminKey },
      });

      if (error || !data) {
        throw new Error(error?.message || 'Failed to fetch report data');
      }

      const { profiles: students, courses, registrations } = data;

      // Process students data
      const studentsByDepartment: Record<string, number> = {};
      const studentsByLevel: Record<string, number> = {};
      let feesPaid = 0;
      let feesUnpaid = 0;

      students?.forEach((student: any) => {
        studentsByDepartment[student.department] = (studentsByDepartment[student.department] || 0) + 1;
        studentsByLevel[student.level] = (studentsByLevel[student.level] || 0) + 1;
        
        if (student.fees_paid) {
          feesPaid++;
        } else {
          feesUnpaid++;
        }
      });

      // Process courses data
      const coursesByDepartment: Record<string, number> = {};
      const coursesByLevel: Record<string, number> = {};

      courses?.forEach((course: any) => {
        coursesByDepartment[course.department] = (coursesByDepartment[course.department] || 0) + 1;
        coursesByLevel[course.level] = (coursesByLevel[course.level] || 0) + 1;
      });

      // Process registrations data
      const registrationsByLevel: Record<string, number> = {};
      const registrationsBySemester: Record<string, number> = {};
      const registrationDetailsList: CourseRegistrationDetail[] = [];

      registrations?.forEach((reg: any) => {
        const student = students?.find((p: any) => p.user_id === reg.user_id);
        const course = courses?.find((c: any) => c.id === reg.course_id);
        
        if (student && course) {
          const level = course.level;
          const semester = reg.semester;
          
          registrationsByLevel[level] = (registrationsByLevel[level] || 0) + 1;
          registrationsBySemester[semester] = (registrationsBySemester[semester] || 0) + 1;

          registrationDetailsList.push({
            student_name: student.full_name,
            matric_number: student.matric_number,
            course_code: course.course_code,
            course_title: course.course_title,
            department: course.department,
            level: course.level,
            units: course.units,
            registration_date: reg.registration_date
          });
        }
      });

      setReportData({
        students: {
          total: students?.length || 0,
          byDepartment: studentsByDepartment,
          byLevel: studentsByLevel,
          feesPaid,
          feesUnpaid
        },
        courses: {
          total: courses?.length || 0,
          byDepartment: coursesByDepartment,
          byLevel: coursesByLevel
        },
        registrations: {
          total: registrations?.length || 0,
          byLevel: registrationsByLevel,
          bySemester: registrationsBySemester
        }
      });

      setRegistrationDetails(registrationDetailsList);

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData) return;

    let csvContent = '';
    
    if (selectedReport === 'overview') {
      csvContent = `Report Type,Overview\nGenerated,${new Date().toLocaleString()}\n\n`;
      csvContent += `Summary\n`;
      csvContent += `Total Students,${reportData.students.total}\n`;
      csvContent += `Total Courses,${reportData.courses.total}\n`;
      csvContent += `Total Registrations,${reportData.registrations.total}\n`;
      csvContent += `Fees Paid,${reportData.students.feesPaid}\n`;
      csvContent += `Fees Unpaid,${reportData.students.feesUnpaid}\n\n`;
      
      csvContent += `Students by Department\n`;
      Object.entries(reportData.students.byDepartment).forEach(([dept, count]) => {
        csvContent += `${dept},${count}\n`;
      });
    } else if (selectedReport === 'registrations') {
      csvContent = `Student Name,Matric Number,Course Code,Course Title,Department,Level,Units,Registration Date\n`;
      registrationDetails.forEach(reg => {
        csvContent += `${reg.student_name},${reg.matric_number},${reg.course_code},"${reg.course_title}",${reg.department},${reg.level},${reg.units},${new Date(reg.registration_date).toLocaleDateString()}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: "Success",
      description: "Report exported successfully",
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  if (!reportData) {
    return <div className="text-center py-8">Failed to load report data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-48 input-academic">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview Report</SelectItem>
              <SelectItem value="students">Student Details</SelectItem>
              <SelectItem value="courses">Course Catalog</SelectItem>
              <SelectItem value="registrations">Registration Details</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={exportReport} className="btn-hero">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {selectedReport === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="academic-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold text-primary">{reportData.students.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="academic-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Courses</p>
                    <p className="text-2xl font-bold text-accent">{reportData.courses.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="academic-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Registrations</p>
                    <p className="text-2xl font-bold text-success">{reportData.registrations.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="academic-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-warning" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fees Paid Rate</p>
                    <p className="text-2xl font-bold text-warning">
                      {reportData.students.total > 0 
                        ? Math.round((reportData.students.feesPaid / reportData.students.total) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="academic-card">
              <CardHeader>
                <CardTitle>Students by Department</CardTitle>
                <CardDescription>Distribution of students across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(reportData.students.byDepartment).map(([dept, count]) => (
                    <div key={dept} className="flex justify-between items-center">
                      <span className="text-sm">{dept}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="academic-card">
              <CardHeader>
                <CardTitle>Students by Level</CardTitle>
                <CardDescription>Distribution of students across academic levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(reportData.students.byLevel).map(([level, count]) => (
                    <div key={level} className="flex justify-between items-center">
                      <span className="text-sm">{level}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="academic-card">
              <CardHeader>
                <CardTitle>Courses by Department</CardTitle>
                <CardDescription>Number of courses offered per department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(reportData.courses.byDepartment).map(([dept, count]) => (
                    <div key={dept} className="flex justify-between items-center">
                      <span className="text-sm">{dept}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="academic-card">
              <CardHeader>
                <CardTitle>Registration by Semester</CardTitle>
                <CardDescription>Course registrations per semester</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(reportData.registrations.bySemester).map(([semester, count]) => (
                    <div key={semester} className="flex justify-between items-center">
                      <span className="text-sm">{semester} Semester</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {selectedReport === 'registrations' && (
        <Card className="academic-card">
          <CardHeader>
            <CardTitle>Course Registration Details</CardTitle>
            <CardDescription>
              Complete list of student course registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Matric Number</TableHead>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Date Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrationDetails.map((reg, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{reg.student_name}</TableCell>
                    <TableCell>{reg.matric_number}</TableCell>
                    <TableCell className="font-mono">{reg.course_code}</TableCell>
                    <TableCell>{reg.course_title}</TableCell>
                    <TableCell>{reg.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{reg.level}</Badge>
                    </TableCell>
                    <TableCell>{reg.units}</TableCell>
                    <TableCell>{new Date(reg.registration_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}