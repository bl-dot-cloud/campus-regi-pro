import { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, FileText, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  user_id: string;
  full_name: string;
  matric_number: string;
  department: string;
  level: string;
  fees_paid: boolean;
  admin_created: boolean;
  created_at: string;
}

interface StudentManagementProps {
  onStudentUpdate?: () => void;
}

export default function StudentManagement({ onStudentUpdate }: StudentManagementProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newStudent, setNewStudent] = useState({
    fullName: '',
    matricNumber: '',
    email: '',
    department: '',
    level: '',
    tempPassword: ''
  });

  const departments = [
    'Computer Science',
    'Engineering',
    'Business Administration',
    'Science',
    'Arts',
    'General Studies'
  ];

  const levels = ['ND1', 'ND2', 'HND1', 'HND2'];

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('admin-students')
      .on('broadcast', { event: 'student_signed_up' }, () => {
        fetchStudents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const adminKey = localStorage.getItem('admin_key') || '';
      const { data, error } = await supabase.functions.invoke('admin-students', {
        body: { action: 'list' },
        headers: { 'x-admin-key': adminKey },
      });

      if (error) throw error as any;
      setStudents((data?.profiles as Student[]) || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    try {
      if (!newStudent.fullName || !newStudent.matricNumber || !newStudent.email || 
          !newStudent.department || !newStudent.level || !newStudent.tempPassword) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      const adminKey = localStorage.getItem('admin_key') || '';
      const { data, error } = await supabase.functions.invoke('admin-students', {
        body: {
          action: 'createStudent',
          payload: {
            email: newStudent.email,
            password: newStudent.tempPassword,
            fullName: newStudent.fullName,
            matricNumber: newStudent.matricNumber,
            department: newStudent.department,
            level: newStudent.level,
          },
        },
        headers: { 'x-admin-key': adminKey },
      });

      if (error || !data?.success) {
        toast({
          title: "Error",
          description: data?.error || error?.message || "Failed to create student",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Student added successfully",
      });

      setIsAddDialogOpen(false);
      setNewStudent({
        fullName: '',
        matricNumber: '',
        email: '',
        department: '',
        level: '',
        tempPassword: ''
      });
      
      fetchStudents();
      onStudentUpdate?.();
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      });
    }
  };

  const toggleFeesStatus = async (studentId: string, currentStatus: boolean) => {
    try {
      const adminKey = localStorage.getItem('admin_key') || '';
      const { data, error } = await supabase.functions.invoke('admin-students', {
        body: {
          action: 'toggleFees',
          payload: {
            id: studentId,
            fees_paid: !currentStatus,
          },
        },
        headers: { 'x-admin-key': adminKey },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Failed to update fees status');
      }

      toast({
        title: "Success",
        description: `Fees status updated`,
      });

      fetchStudents();
    } catch (error) {
      console.error('Error updating fees status:', error);
      toast({
        title: "Error",
        description: "Failed to update fees status",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.matric_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: students.length,
    feesPaid: students.filter(s => s.fees_paid).length,
    feesUnpaid: students.filter(s => !s.fees_paid).length,
    adminCreated: students.filter(s => s.admin_created).length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="academic-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="academic-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Fees Paid</p>
                <p className="text-2xl font-bold text-success">{stats.feesPaid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="academic-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Fees Unpaid</p>
                <p className="text-2xl font-bold text-warning">{stats.feesUnpaid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="academic-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Admin Added</p>
                <p className="text-2xl font-bold text-accent">{stats.adminCreated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-academic"
          />
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-hero">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Create a new student account. The student can log in with their email and temporary password.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter full name"
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({...newStudent, fullName: e.target.value})}
                  className="input-academic"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="matricNumber">Matric Number</Label>
                <Input
                  id="matricNumber"
                  placeholder="Enter matric number"
                  value={newStudent.matricNumber}
                  onChange={(e) => setNewStudent({...newStudent, matricNumber: e.target.value})}
                  className="input-academic"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  className="input-academic"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={newStudent.department} onValueChange={(value) => setNewStudent({...newStudent, department: value})}>
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

                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={newStudent.level} onValueChange={(value) => setNewStudent({...newStudent, level: value})}>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempPassword">Temporary Password</Label>
                <Input
                  id="tempPassword"
                  type="password"
                  placeholder="Enter temporary password"
                  value={newStudent.tempPassword}
                  onChange={(e) => setNewStudent({...newStudent, tempPassword: e.target.value})}
                  className="input-academic"
                />
              </div>

              <Button onClick={handleAddStudent} className="w-full btn-hero">
                Add Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Students Table */}
      <Card className="academic-card">
        <CardHeader>
          <CardTitle>Student Records</CardTitle>
          <CardDescription>
            Manage student information and fee status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading students...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Matric Number</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Fees Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.full_name}</TableCell>
                    <TableCell>{student.matric_number}</TableCell>
                    <TableCell>{student.department}</TableCell>
                    <TableCell>{student.level}</TableCell>
                    <TableCell>
                      <Badge variant={student.fees_paid ? "default" : "destructive"}>
                        {student.fees_paid ? "Paid" : "Unpaid"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.admin_created ? "secondary" : "outline"}>
                        {student.admin_created ? "Admin Created" : "Self Registered"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => toggleFeesStatus(student.id, student.fees_paid)}
                          >
                            {student.fees_paid ? "Mark Fees Unpaid" : "Mark Fees Paid"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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