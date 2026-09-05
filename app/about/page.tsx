'use client';
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import { useToast } from '@/components/ui/Toast';
import { Edit2, Save } from 'lucide-react';

interface AboutData {
  id: string;
  notes: string;
  versionsHistory: string;
}

export default function AboutPage() {
  const { toast } = useToast();
  const { user } = useUserInfo();
  const [about, setAbout] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<AboutData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      const res = await fetch('/api/about', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setAbout(data.data);
        setEditData(data.data);
      }
    } catch (error) {
      toast('error', 'Failed to load about content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editData || !editData.notes.trim()) {
      toast('error', 'Notes are required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/about', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) {
        setAbout(data.data);
        setEditData(data.data);
        setIsEditing(false);
        toast('success', 'About content updated successfully');
      } else {
        toast('error', data.error?.message || 'Failed to update');
      }
    } catch (error) {
      toast('error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout role={user?.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'GYM_OWNER'} userName={user?.name} title="About">
        <p className="text-sm text-gray-400">Loading...</p>
      </AppLayout>
    );
  }

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <AppLayout role={isSuperAdmin ? 'SUPER_ADMIN' : 'GYM_OWNER'} userName={user?.name} title="About">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">About</h1>
          {isSuperAdmin && (
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save'}
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                  Edit
                </>
              )}
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Notes Section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
            {isEditing ? (
              <textarea
                value={editData?.notes || ''}
                onChange={(e) => setEditData({ ...editData!, notes: e.target.value })}
                placeholder="Enter notes in markdown format..."
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none font-mono text-sm"
              />
            ) : (
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                {about?.notes || 'No notes available'}
              </div>
            )}
          </div>

          {/* Versions History Section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Versions History</h2>
            {isEditing ? (
              <textarea
                value={editData?.versionsHistory || ''}
                onChange={(e) => setEditData({ ...editData!, versionsHistory: e.target.value })}
                placeholder="Enter version history in markdown format..."
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none font-mono text-sm"
              />
            ) : (
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                {about?.versionsHistory || 'No version history available'}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
