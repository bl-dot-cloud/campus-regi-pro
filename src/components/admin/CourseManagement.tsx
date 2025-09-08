import { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Course {
  id: string;
  course_code: string;
  course_title: string;
  units: number;
  semester: string;
  level: string;
  department: string;
  description?: string;
  created_at: string;
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  const [courseForm, setCourseForm] = useState({
    courseCode: '',
    courseTitle: '',
    units: '',
    semester: '',
    level: '',
    department: '',
    description: '',
    academicSession: ''
  });

  const departments = [
    'Computer Science',
    'Engineering',
    'Business Administration',
    'Science',
    'Mathematics',
    'General Studies'
  ];

  const levels = ['ND1', 'ND2', 'HND1', 'HND2'];
  const semesters = ['First', 'Second'];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('course_code', { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCourseForm({
      courseCode: '',
      courseTitle: '',
      units: '',
      semester: '',
      level: '',
      department: '',
      description: '',
      academicSession: ''
    });
  };

  const handleAddCourse = async () => {
    try {
      setSubmitting(true);
      if (!courseForm.courseCode || !courseForm.courseTitle || !courseForm.units || 
          !courseForm.semester || !courseForm.level || !courseForm.department || !courseForm.academicSession) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const adminKey = localStorage.getItem('admin_key') || '';
      const { data, error } = await supabase.functions.invoke('admin-courses', {
        body: {
          action: 'insert',
          payload: {
            course_code: courseForm.courseCode.toUpperCase(),
            course_title: courseForm.courseTitle,
            units: parseInt(courseForm.units),
            semester: courseForm.semester,
            level: courseForm.level,
            department: courseForm.department,
            description: courseForm.description || null,
            academic_session: courseForm.academicSession
          },
        },
        headers: { 'x-admin-key': adminKey },
      });

      if (error || !data?.success) {
        const errorMsg = data?.error || error?.message || 'Failed to add course';
        toast({
          title: "Error",
          description: errorMsg.includes('unique') ? "A course with this code already exists" : errorMsg,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Course added successfully",
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error('Error adding course:', error);
      toast({
        title: "Error",
        description: "Failed to add course",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourse) return;

    try {
      setSubmitting(true);
      if (!courseForm.courseCode || !courseForm.courseTitle || !courseForm.units || 
          !courseForm.semester || !courseForm.level || !courseForm.department || !courseForm.academicSession) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const adminKey = localStorage.getItem('admin_key') || '';
      const { data, error } = await supabase.functions.invoke('admin-courses', {
        body: {
          action: 'update',
          payload: {
            id: editingCourse.id,
            course_code: courseForm.courseCode.toUpperCase(),
            course_title: courseForm.courseTitle,
            units: parseInt(courseForm.units),
            semester: courseForm.semester,
            level: courseForm.level,
            department: courseForm.department,
            description: courseForm.description || null,
            academic_session: courseForm.academicSession
          },
        },
        headers: { 'x-admin-key': adminKey },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Failed to update course');
      }

      toast({
        title: "Success",
        description: "Course updated successfully",
      });

      setEditingCourse(null);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const adminKey = localStorage.getItem('admin_key') || '';
      const { data, error } = await supabase.functions.invoke('admin-courses', {
        body: {
          action: 'delete',
          payload: { id: courseId },
        },
        headers: { 'x-admin-key': adminKey },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Failed to delete course');
      }

      toast({
        title: "Success",
        description: "Course deleted successfully",
      });

      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      courseCode: course.course_code,
      courseTitle: course.course_title,
      units: course.units.toString(),
      semester: course.semester,
      level: course.level,
      department: course.department,
      description: course.description || '',
      academicSession: (course as any).academic_session || ''
    });
  };

  const filteredCourses = courses.filter(course =>
    course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: courses.length,
    byLevel: {
      ND1: courses.filter(c => c.level === 'ND1').length,
      ND2: courses.filter(c => c.level === 'ND2').length,
      HND1: courses.filter(c => c.level === 'HND1').length,
      HND2: courses.filter(c => c.level === 'HND2').length,
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="academic-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {Object.entries(stats.byLevel).map(([level, count]) => (
          <Card key={level} className="academic-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">{level}</p>
                  <p className="text-xl font-bold text-accent">{count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-academic"
          />
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-hero">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
              <DialogDescription>
                Create a new course offering for students to register.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseCode">Course Code</Label>
                  <Input
                    id="courseCode"
                    placeholder="e.g., CSC101"
                    value={courseForm.courseCode}
                    onChange={(e) => setCourseForm({...courseForm, courseCode: e.target.value})}
                    className="input-academic"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">Units</Label>
                  <Input
                    id="units"
                    type="number"
                    min="1"
                    max="6"
                    placeholder="3"
                    value={courseForm.units}
                    onChange={(e) => setCourseForm({...courseForm, units: e.target.value})}
                    className="input-academic"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseTitle">Course Title</Label>
                <Input
                  id="courseTitle"
                  placeholder="Introduction to Computer Science"
                  value={courseForm.courseTitle}
                  onChange={(e) => setCourseForm({...courseForm, courseTitle: e.target.value})}
                  className="input-academic"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={courseForm.level} onValueChange={(value) => setCourseForm({...courseForm, level: value})}>
                    <SelectTrigger className="input-academic">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select value={courseForm.semester} onValueChange={(value) => setCourseForm({...courseForm, semester: value})}>
                    <SelectTrigger className="input-academic">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((semester) => (
                        <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={courseForm.department} onValueChange={(value) => setCourseForm({...courseForm, department: value})}>
                    <SelectTrigger className="input-academic">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Academic Session</Label>
                <Select value={courseForm.academicSession} onValueChange={(value) => setCourseForm({...courseForm, academicSession: value})}>
                  <SelectTrigger className="input-academic">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023/2024">2023/2024</SelectItem>
                    <SelectItem value="2024/2025">2024/2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Course description..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                  className="input-academic"
                  rows={3}
                />
              </div>

              <Button onClick={handleAddCourse} disabled={submitting} className="w-full btn-hero">
                {submitting ? 'Adding...' : 'Add Course'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Course Dialog */}
      <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update course information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Same form fields as Add Course */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editCourseCode">Course Code</Label>
                <Input
                  id="editCourseCode"
                  placeholder="e.g., CSC101"
                  value={courseForm.courseCode}
                  onChange={(e) => setCourseForm({...courseForm, courseCode: e.target.value})}
                  className="input-academic"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editUnits">Units</Label>
                <Input
                  id="editUnits"
                  type="number"
                  min="1"
                  max="6"
                  placeholder="3"
                  value={courseForm.units}
                  onChange={(e) => setCourseForm({...courseForm, units: e.target.value})}
                  className="input-academic"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editCourseTitle">Course Title</Label>
              <Input
                id="editCourseTitle"
                placeholder="Introduction to Computer Science"
                value={courseForm.courseTitle}
                onChange={(e) => setCourseForm({...courseForm, courseTitle: e.target.value})}
                className="input-academic"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={courseForm.level} onValueChange={(value) => setCourseForm({...courseForm, level: value})}>
                  <SelectTrigger className="input-academic">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Semester</Label>
                <Select value={courseForm.semester} onValueChange={(value) => setCourseForm({...courseForm, semester: value})}>
                  <SelectTrigger className="input-academic">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={courseForm.department} onValueChange={(value) => setCourseForm({...courseForm, department: value})}>
                  <SelectTrigger className="input-academic">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDescription">Description (Optional)</Label>
              <Textarea
                id="editDescription"
                placeholder="Course description..."
                value={courseForm.description}
                onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                className="input-academic"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleEditCourse} className="flex-1 btn-hero">
                Update Course
              </Button>
              <Button variant="outline" onClick={() => setEditingCourse(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Courses Table */}
      <Card className="academic-card">
        <CardHeader>
          <CardTitle>Course Catalog</CardTitle>
          <CardDescription>
            Manage course offerings and requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading courses...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-mono font-bold">{course.course_code}</TableCell>
                    <TableCell className="font-medium">{course.course_title}</TableCell>
                    <TableCell>{course.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.level}</Badge>
                    </TableCell>
                    <TableCell>{course.semester}</TableCell>
                    <TableCell>{course.units}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(course)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}