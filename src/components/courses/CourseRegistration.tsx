import { useState, useEffect } from 'react';
import { BookOpen, Plus, X, AlertCircle, CheckCircle, FileDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StudentData {
  name: string;
  matricNumber: string;
  department: string;
  level: string;
  feesPaid: boolean;
}

interface Course {
  id: string;
  course_code: string;
  course_title: string;
  units: number;
  department: string;
  level: string;
  semester: string;
  description?: string;
  academic_session?: string;
}

interface CourseRegistrationProps {
  studentData: StudentData;
}

const CourseRegistration = ({ studentData }: CourseRegistrationProps) => {
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(studentData.level);
  const [selectedDepartment, setSelectedDepartment] = useState(studentData.department);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [showCourses, setShowCourses] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const { toast } = useToast();

  const fetchAvailableCourses = async () => {
    try {
      setLoadingCourses(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('department', selectedDepartment)
        .eq('level', selectedLevel)
        .eq('semester', selectedSemester === 'first' ? 'First' : 'Second')
        .eq('academic_session', selectedSession);

      if (error) throw error;
      setAvailableCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available courses",
        variant: "destructive",
      });
    } finally {
      setLoadingCourses(false);
    }
  };

  const totalUnits = selectedCourses.reduce((sum, course) => sum + course.units, 0);
  const maxUnits = 24;
  const minUnits = 12;

  const handleSelectionSubmit = () => {
    if (selectedSession && selectedSemester && selectedLevel && selectedDepartment) {
      fetchAvailableCourses();
      setShowCourses(true);
    }
  };

  const addCourse = (course: Course) => {
    if (totalUnits + course.units <= maxUnits && !selectedCourses.find(c => c.id === course.id)) {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const removeCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter(c => c.id !== courseId));
  };

  const canSubmitRegistration = totalUnits >= minUnits && totalUnits <= maxUnits && studentData.feesPaid;

  if (!studentData.feesPaid) {
    return (
      <div className="space-y-6">
        <Alert className="border-warning bg-warning/5">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning">
            You need to pay your school fees before you can register for courses.
          </AlertDescription>
        </Alert>
        <Card className="academic-card">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fees Payment Required</h3>
              <p className="text-muted-foreground">
                Please complete your fees payment to unlock the course registration system.
              </p>
            </div>
            <Button className="btn-hero">Pay School Fees</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!showCourses) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Course Registration</h2>
          <p className="text-muted-foreground">Select your academic details to view available courses</p>
        </div>

        <Card className="academic-card">
          <CardHeader>
            <CardTitle>Academic Session Details</CardTitle>
            <CardDescription>Please select your current academic session information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Academic Session</label>
                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023/2024">2023/2024</SelectItem>
                    <SelectItem value="2024/2025">2024/2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Semester</label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">First Semester</SelectItem>
                    <SelectItem value="second">Second Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Level</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ND1">ND1</SelectItem>
                    <SelectItem value="ND2">ND2</SelectItem>
                    <SelectItem value="HND1">HND1</SelectItem>
                    <SelectItem value="HND2">HND2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Business Studies">Business Studies</SelectItem>
                    <SelectItem value="Science Technology">Science Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleSelectionSubmit} 
              className="w-full btn-hero"
              disabled={!selectedSession || !selectedSemester || !selectedLevel || !selectedDepartment || loadingCourses}
            >
              {loadingCourses ? 'Loading Courses...' : 'View Available Courses'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Registration</h2>
          <p className="text-muted-foreground">
            {selectedDepartment} • {selectedLevel} • {selectedSession} • {selectedSemester === 'first' ? 'First' : 'Second'} Semester
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowCourses(false)}>
          Change Selection
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Available Courses */}
        <Card className="academic-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Available Courses
            </CardTitle>
            <CardDescription>Select courses to add to your registration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingCourses ? (
              <p className="text-muted-foreground text-center py-4">Loading courses...</p>
            ) : availableCourses.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No courses available for selected criteria</p>
            ) : (
              availableCourses
                .filter(course => !selectedCourses.find(c => c.id === course.id))
                .map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{course.course_code}</span>
                        <Badge variant="default">
                          {course.units} units
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{course.course_title}</p>
                      <p className="text-xs text-muted-foreground">{course.department} • {course.level}</p>
                      {course.description && (
                        <p className="text-xs text-muted-foreground mt-1">{course.description}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addCourse(course)}
                      disabled={totalUnits + course.units > maxUnits}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Selected Courses */}
        <Card className="academic-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Courses</span>
              <Badge variant={totalUnits > maxUnits ? 'destructive' : totalUnits >= minUnits ? 'default' : 'secondary'}>
                {totalUnits}/{maxUnits} units
              </Badge>
            </CardTitle>
            <CardDescription>Your course registration summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedCourses.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No courses selected yet</p>
            ) : (
              <>
                {selectedCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{course.course_code}</span>
                        <Badge variant="default">
                          {course.units} units
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{course.course_title}</p>
                      <p className="text-xs text-muted-foreground">{course.department}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCourse(course.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Units:</span>
                    <span>{totalUnits}</span>
                  </div>
                  {totalUnits < minUnits && (
                    <p className="text-sm text-warning mt-1">
                      Minimum {minUnits} units required
                    </p>
                  )}
                  {totalUnits > maxUnits && (
                    <p className="text-sm text-destructive mt-1">
                      Maximum {maxUnits} units allowed
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Registration Actions */}
      <Card className="academic-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Ready to submit your registration?</p>
              <p className="text-sm text-muted-foreground">
                {canSubmitRegistration 
                  ? 'All requirements met. You can submit your course registration.'
                  : 'Please ensure you have selected the required number of units and paid your fees.'
                }
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                Preview Registration
              </Button>
              <Button 
                className="btn-hero"
                disabled={!canSubmitRegistration}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Registration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseRegistration;