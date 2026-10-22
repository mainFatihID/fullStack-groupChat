'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface GroupDetails {
  id: number;
  name: string;
  description?: string;
  group_picture?: string;
}

export default function GroupSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupPicture, setGroupPicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!groupId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchGroupDetails = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${baseUrl}/api/groups/${groupId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch group details');

        setName(data.name || '');
        setDescription(data.description || '');
        if (data.group_picture) {
          setPreviewUrl(data.group_picture);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setGroupPicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setSaving(true);

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      
      if (groupPicture) {
        formData.append('group_picture', groupPicture);
      }

      const response = await fetch(`${baseUrl}/api/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Failed to update group');

      setSuccessMessage('Group updated successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete group');

      router.push('/chat');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Group Settings</h2>
          <Link href={`/chat/${groupId}`} className="text-sm text-blue-400 hover:underline">
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

        <form onSubmit={handleUpdateGroup} className="space-y-4">
          {/* Group Picture Preview & Upload */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-20 h-20 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Group Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs">No Image</span>
              )}
            </div>
            <label className="cursor-pointer text-xs text-blue-400 hover:underline">
              <span>Change Group Picture</span>
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
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition duration-200 disabled:opacity-50"
          >
            {saving ? 'Saving changes...' : 'Save Changes'}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-700">
          <button
            onClick={handleDeleteGroup}
            className="w-full py-2.5 bg-red-600/80 hover:bg-red-700 text-white rounded-lg font-semibold transition duration-200 text-sm"
          >
            Delete Group
          </button>
        </div>
      </div>
    </div>
  );
}