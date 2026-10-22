'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Group {
  id: number;
  name: string;
  description?: string;
  group_picture?: string;
}

export default function ChatDashboardPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        // Adjust endpoint based on your groups route configuration (e.g., /api/groups or /api/group-members)
        const response = await fetch(`${baseUrl}/api/groups`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || 'Failed to fetch groups');
        }

        setGroups(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar: Group List */}
      <div className="w-1/3 border-r border-gray-800 flex flex-col bg-gray-900">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h1 className="text-xl font-bold">Your Groups</h1>
          <div className="space-x-2">
            <Link
              href="/groups/create"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-sm rounded-lg transition"
            >
              New Group
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-600/80 hover:bg-red-700 text-sm rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Group List Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && <p className="text-gray-400 text-center">Loading groups...</p>}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          
          {!loading && !error && groups.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              <p>No groups found.</p>
              <Link href="/groups/create" className="text-blue-400 hover:underline text-sm">
                Create your first group
              </Link>
            </div>
          )}

          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/chat/${group.id}`}
              className="flex items-center space-x-3 p-3 bg-gray-800/60 hover:bg-gray-800 rounded-xl transition border border-gray-700/50"
            >
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center overflow-hidden flex-shrink-0">
                {group.group_picture ? (
                  <img src={group.group_picture} alt={group.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full text-center text-gray-400 font-bold">
                    {group.name ? group.name.charAt(0).toUpperCase() : '?'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{group.name}</h3>
                <p className="text-xs text-gray-400 truncate">
                  {group.description || 'Click to open chat'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content Area (Placeholder when no group is selected) */}
      <div className="flex-1 flex items-center justify-center bg-gray-950 text-gray-500">
        <p>Select a group from the sidebar to start chatting</p>
      </div>
    </div>
  );
}