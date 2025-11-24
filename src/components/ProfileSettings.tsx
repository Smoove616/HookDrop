import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { User, Upload, Loader2, MapPin, Globe } from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    website: '',
    location: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) {
        // If table doesn't exist yet, show a helpful message
        if (error.message.includes('schema cache')) {
          toast({ 
            title: 'Profile Loading', 
            description: 'Setting up your profile... Please refresh in a moment.',
            variant: 'default'
          });
        }
        console.error('Profile fetch error:', error);
        return;
      }
      
      if (data) {
        setFormData({
          username: data.username || '',
          full_name: data.full_name || '',
          bio: data.bio || '',
          website: data.website || '',
          location: data.location || '',
          avatar_url: data.avatar_url || ''
        });
        if (data.avatar_url) {
          setAvatarPreview(data.avatar_url);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };


  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please upload an image file', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, avatar_url: fileName }));
      setAvatarPreview(urlData.publicUrl);
      
      toast({ title: 'Success', description: 'Avatar uploaded!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
          website: formData.website,
          location: formData.location,
          avatar_url: formData.avatar_url
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Profile updated successfully!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 rounded-full p-2 cursor-pointer">
              <Upload size={16} className="text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          {uploading && <Loader2 className="animate-spin text-purple-400" />}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="username" className="text-gray-300">Username</Label>
            <Input id="username" value={formData.username} onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))} className="bg-gray-700 border-gray-600 text-white" required />
          </div>
          <div>
            <Label htmlFor="full_name" className="text-gray-300">Full Name</Label>
            <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))} className="bg-gray-700 border-gray-600 text-white" />
          </div>
        </div>

        <div>
          <Label htmlFor="bio" className="text-gray-300">Bio</Label>
          <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))} className="bg-gray-700 border-gray-600 text-white" rows={4} placeholder="Tell us about yourself..." />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="website" className="text-gray-300 flex items-center gap-2">
              <Globe size={16} /> Website
            </Label>
            <Input id="website" type="url" value={formData.website} onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))} className="bg-gray-700 border-gray-600 text-white" placeholder="https://example.com" />
          </div>
          <div>
            <Label htmlFor="location" className="text-gray-300 flex items-center gap-2">
              <MapPin size={16} /> Location
            </Label>
            <Input id="location" value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} className="bg-gray-700 border-gray-600 text-white" placeholder="City, Country" />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
        </Button>
      </form>
    </Card>
  );
};
