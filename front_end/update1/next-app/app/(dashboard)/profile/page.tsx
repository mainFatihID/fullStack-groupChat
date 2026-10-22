'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  profile_picture?: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [createdAt, setCreatedAt] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        // Note: Your backend usersGetController fetches all users. 
        // If you have a specific /api/users/me route, use that instead. Otherwise, we fetch the list and find the current user.
        const response = await fetch(`${baseUrl}/api/users`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const users = await response.json();
        if (!response.ok) throw new Error(users.error || 'Failed to fetch user profile');

        // Assuming the JWT token payload or response helps identify the current user, 
        // or if /api/users returns an array, we find the active user or handle accordingly.
        // If your token has user id, you can decode or match it. Here we pick the first or match from localStorage if stored.
        if (Array.isArray(users) && users.length > 0) {
          // Fallback example picking the first or matching decoded info if available
          const currentUser = users[0]; // Adjust if you implement a dedicated GET /api/users/me route
          setUserId(currentUser.id);
          setUsername(currentUser.username);
          setEmail(currentUser.email);
          setCreatedAt(currentUser.created_at);
          if (currentUser.profile_picture) {
            setPreviewUrl(currentUser.profile_picture);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setError('');
    setSuccessMessage('');
    setSaving(true);

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const formData = new FormData();
      formData.append('username', username);
      
      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }

      // Matches your usersPutController route: PUT /api/users/:id
      const response = await fetch(`${baseUrl}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');

      setSuccessMessage('Profile updated successfully!');
      if (data.profile_picture) {
        setPreviewUrl(data.profile_picture);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Profile</h2>
          <Link href="/chat" className="text-sm text-blue-400 hover:underline">
            Back to Chat
          </Link>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-900/50 border border-red-800 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3 text-sm text-green-400 bg-green-900/50 border border-green-800 rounded-lg">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {/* Profile Picture Upload & Preview */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-24 h-24 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs">No Photo</span>
              )}
            </div>
            <label className="cursor-pointer text-xs text-blue-400 hover:underline">
              <span>Change Profile Picture</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Email (Read-only)
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 bg-gray-800 text-gray-400 border border-gray-700 rounded-lg cursor-not-allowed"
            />
          </div>

          {createdAt && (
            <p className="text-xs text-gray-500 text-center">
              Member since: {new Date(createdAt).toLocaleDateString()}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition duration-200 disabled:opacity-50"
          >
            {saving ? 'Saving changes...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}