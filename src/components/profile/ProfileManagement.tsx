import { useState, useEffect } from 'react';
import { User, Save, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StudentData {
  name: string;
  matricNumber: string;
  department: string;
  level: string;
  feesPaid: boolean;
}

interface ProfileManagementProps {
  studentData: StudentData;
  onProfileUpdate: (updatedData: StudentData) => void;
}

const ProfileManagement = ({ studentData, onProfileUpdate }: ProfileManagementProps) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState({
    fullName: studentData.name,
    matricNumber: studentData.matricNumber,
    department: studentData.department,
    level: studentData.level,
    newPassword: '',
    confirmPassword: ''
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

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!profileForm.fullName || !profileForm.matricNumber || !profileForm.department || !profileForm.level) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Validate password if provided
      if (profileForm.newPassword || profileForm.confirmPassword) {
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          toast({
            title: "Password Error",
            description: "New passwords do not match",
            variant: "destructive",
          });
          return;
        }

        if (profileForm.newPassword.length < 6) {
          toast({
            title: "Password Error", 
            description: "Password must be at least 6 characters long",
            variant: "destructive",
          });
          return;
        }
      }

      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.fullName,
          matric_number: profileForm.matricNumber,
          department: profileForm.department,
          level: profileForm.level
        })
        .eq('user_id', user.data.user.id);

      if (profileError) throw profileError;

      // Update password if provided
      if (profileForm.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: profileForm.newPassword
        });

        if (passwordError) throw passwordError;
      }

      // Update local state
      const updatedData: StudentData = {
        name: profileForm.fullName,
        matricNumber: profileForm.matricNumber,
        department: profileForm.department,
        level: profileForm.level,
        feesPaid: studentData.feesPaid
      };

      onProfileUpdate(updatedData);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      // Clear password fields
      setProfileForm(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Profile Management</h2>
        <p className="text-muted-foreground">Update your personal information and account settings</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="academic-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your basic profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                className="input-academic"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="matricNumber">Matric Number</Label>
              <Input
                id="matricNumber"
                value={profileForm.matricNumber}
                onChange={(e) => setProfileForm({...profileForm, matricNumber: e.target.value})}
                className="input-academic"
              />
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={profileForm.department} onValueChange={(value) => setProfileForm({...profileForm, department: value})}>
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
              <Select value={profileForm.level} onValueChange={(value) => setProfileForm({...profileForm, level: value})}>
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
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="academic-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Change your password (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
                  className="input-academic pr-10"
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={profileForm.confirmPassword}
                onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                className="input-academic"
                placeholder="Confirm new password"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p>• Password must be at least 6 characters long</p>
              <p>• Leave password fields empty if you don't want to change it</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="academic-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Ready to save your changes?</p>
              <p className="text-sm text-muted-foreground">
                Your profile information will be updated immediately.
              </p>
            </div>
            <Button 
              onClick={handleUpdateProfile}
              disabled={loading}
              className="btn-hero"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManagement;