import { useState, useEffect } from 'react';
import { Calendar, BookOpen, Download, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RegistrationRecord {
  id: string;
  academic_session: string;
  semester: string;
  registration_date: string;
  status: string;
  courses: {
    course_code: string;
    course_title: string;
    units: number;
  };
}

interface StudentData {
  name: string;
  matricNumber: string;
  department: string;
  level: string;
}

interface RegistrationHistoryProps {
  studentData: StudentData;
}

const RegistrationHistory = ({ studentData }: RegistrationHistoryProps) => {
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistrationHistory();
  }, []);

  const fetchRegistrationHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('course_registrations')
        .select(`
          id,
          academic_session,
          semester,
          registration_date,
          status,
          courses (
            course_code,
            course_title,
            units
          )
        `)
        .order('registration_date', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registration history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch registration history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const groupedRegistrations = registrations.reduce((acc, reg) => {
    const key = `${reg.academic_session}-${reg.semester}`;
    if (!acc[key]) {
      acc[key] = {
        session: reg.academic_session,
        semester: reg.semester,
        registrationDate: reg.registration_date,
        courses: [],
        totalUnits: 0,
      };
    }
    acc[key].courses.push(reg.courses);
    acc[key].totalUnits += reg.courses.units;
    return acc;
  }, {} as Record<string, any>);

  const downloadRegistrationSlip = (sessionKey: string) => {
    const registration = groupedRegistrations[sessionKey];
    const registrationText = `
COURSE REGISTRATION SLIP
========================

Student Information:
- Name: ${studentData.name}
- Matric Number: ${studentData.matricNumber}
- Department: ${studentData.department}
- Level: ${studentData.level}

Academic Details:
- Session: ${registration.session}
- Semester: ${registration.semester}

Registered Courses:
${registration.courses.map((course: any) => `- ${course.course_code}: ${course.course_title} (${course.units} units)`).join('\n')}

Total Units: ${registration.totalUnits}

Registration Date: ${new Date(registration.registrationDate).toLocaleDateString()}
    `.trim();

    const blob = new Blob([registrationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registration-${studentData.matricNumber}-${registration.session}-${registration.semester}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Registration History</h2>
          <p className="text-muted-foreground">Loading your course registration history...</p>
        </div>
        <Card className="academic-card">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (Object.keys(groupedRegistrations).length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Registration History</h2>
          <p className="text-muted-foreground">Your course registration history</p>
        </div>
        <Alert>
          <BookOpen className="h-4 w-4" />
          <AlertDescription>
            You haven't registered for any courses yet. Start by registering for courses in the current semester.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Registration History</h2>
        <p className="text-muted-foreground">Your complete course registration history</p>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedRegistrations).map(([sessionKey, registration]) => (
          <Card key={sessionKey} className="academic-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {registration.session} - {registration.semester} Semester
                  </CardTitle>
                  <CardDescription>
                    Registered on {new Date(registration.registrationDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">
                    {registration.totalUnits} units
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadRegistrationSlip(sessionKey)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {registration.courses.map((course: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{course.course_code}</span>
                      <Badge variant="secondary">
                        {course.units} units
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{course.course_title}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RegistrationHistory;