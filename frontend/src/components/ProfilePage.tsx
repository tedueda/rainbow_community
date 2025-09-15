import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, Shield } from 'lucide-react';

interface Profile {
  user_id: number;
  handle: string;
  bio?: string;
  orientation_id?: number;
  gender_id?: number;
  pronoun_id?: number;
  birthday?: string;
  location?: string;
  website?: string;
  avatar_url?: string;
  banner_url?: string;
  is_profile_public: boolean;
  show_orientation: boolean;
  show_gender: boolean;
  show_pronoun: boolean;
  show_birthday: boolean;
  show_location: boolean;
  created_at: string;
  updated_at: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const { token } = useAuth();

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/profiles/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
      } else {
        setError('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/profiles/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = (field: keyof Profile, value: any) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-purple-600">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-600">Failed to load profile</p>
            <Button onClick={fetchProfile} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">Your Profile</h1>
        <p className="text-purple-600">Manage your profile information and privacy settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Profile Info
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Privacy Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Profile Information</span>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        fetchProfile();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="handle">Handle</Label>
                  <Input
                    id="handle"
                    value={profile.handle}
                    onChange={(e) => updateProfile('handle', e.target.value)}
                    disabled={!isEditing}
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location || ''}
                    onChange={(e) => updateProfile('location', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Your city or region"
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => updateProfile('bio', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="border-purple-200 focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={profile.website || ''}
                  onChange={(e) => updateProfile('website', e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://your-website.com"
                  className="border-purple-200 focus:border-purple-500"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <p className="text-sm text-gray-600">
                Control what information is visible to other users
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="profile-public">Public Profile</Label>
                  <p className="text-sm text-gray-600">Make your profile visible to everyone</p>
                </div>
                <Switch
                  id="profile-public"
                  checked={profile.is_profile_public}
                  onCheckedChange={(checked) => updateProfile('is_profile_public', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-location">Show Location</Label>
                  <p className="text-sm text-gray-600">Display your location on your profile</p>
                </div>
                <Switch
                  id="show-location"
                  checked={profile.show_location}
                  onCheckedChange={(checked) => updateProfile('show_location', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-orientation">Show Orientation</Label>
                  <p className="text-sm text-gray-600">Display your sexual orientation</p>
                </div>
                <Switch
                  id="show-orientation"
                  checked={profile.show_orientation}
                  onCheckedChange={(checked) => updateProfile('show_orientation', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-gender">Show Gender</Label>
                  <p className="text-sm text-gray-600">Display your gender identity</p>
                </div>
                <Switch
                  id="show-gender"
                  checked={profile.show_gender}
                  onCheckedChange={(checked) => updateProfile('show_gender', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-pronoun">Show Pronouns</Label>
                  <p className="text-sm text-gray-600">Display your preferred pronouns</p>
                </div>
                <Switch
                  id="show-pronoun"
                  checked={profile.show_pronoun}
                  onCheckedChange={(checked) => updateProfile('show_pronoun', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-birthday">Show Birthday</Label>
                  <p className="text-sm text-gray-600">Display your birthday (age only)</p>
                </div>
                <Switch
                  id="show-birthday"
                  checked={profile.show_birthday}
                  onCheckedChange={(checked) => updateProfile('show_birthday', checked)}
                />
              </div>

              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isSaving ? 'Saving Privacy Settings...' : 'Save Privacy Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
