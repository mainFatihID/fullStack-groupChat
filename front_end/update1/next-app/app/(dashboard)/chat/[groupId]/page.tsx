'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Message {
  id: number;
  user_id: number;
  username: string;
  message: string;
  created_at: string;
}

interface GroupDetails {
  id: number;
  name: string;
  description?: string;
  group_picture?: string;
}

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId;

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!groupId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        // 1. Fetch group details
        const groupRes = await fetch(`${baseUrl}/api/groups/${groupId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const groupData = await groupRes.json();
        if (!groupRes.ok) throw new Error(groupData.message || 'Failed to fetch group details');
        setGroup(groupData);

        // 2. Fetch messages for this group
        const msgRes = await fetch(`${baseUrl}/api/messages/${groupId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const msgData = await msgRes.json();
        if (!msgRes.ok) throw new Error(msgData.message || 'Failed to fetch messages');
        setMessages(msgData);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          group_id: groupId,
          message: newMessage,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send message');

      // Append new message or refresh messages list
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar Navigation / Back to Dashboard */}
      <div className="w-1/4 border-r border-gray-800 flex flex-col bg-gray-900 p-4">
        <Link
          href="/chat"
          className="text-sm text-blue-400 hover:underline mb-4 flex items-center space-x-1"
        >
          <span>← Back to Groups</span>
        </Link>
        
        {group && (
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700/50 space-y-3">
            <div className="w-16 h-16 rounded-full bg-gray-700 mx-auto overflow-hidden flex items-center justify-center">
              {group.group_picture ? (
                <img src={group.group_picture} alt={group.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-gray-400">{group.name.charAt(0)}</span>
              )}
            </div>
            <h2 className="text-center font-bold text-lg">{group.name}</h2>
            <p className="text-xs text-gray-400 text-center">{group.description || 'No description'}</p>
            
            <div className="pt-2 border-t border-gray-700 flex justify-center">
              <Link
                href={`/groups/${groupId}/settings`}
                className="text-xs text-gray-300 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition"
              >
                Group Settings
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Chat Conversation Area */}
      <div className="flex-1 flex flex-col bg-gray-950">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
          <h3 className="font-semibold text-lg">{group ? group.name : 'Loading chat...'}</h3>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && <p className="text-center text-gray-500">Loading messages...</p>}
          {error && <p className="text-center text-red-400 text-sm">{error}</p>}

          {!loading && messages.length === 0 && (
            <div className="text-center text-gray-600 mt-20">
              <p>No messages yet. Say hello!</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col space-y-1">
              <div className="flex items-baseline space-x-2">
                <span className="font-semibold text-sm text-blue-400">{msg.username}</span>
                <span className="text-[10px] text-gray-500">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="bg-gray-800 p-3 rounded-xl max-w-lg text-sm border border-gray-700/50">
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-gray-900 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-sm transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}