'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Megaphone, Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  is_active: boolean;
  show_banner: boolean;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
  created_by: string;
}

const TYPE_OPTIONS = ['info', 'warning', 'success', 'maintenance'] as const;

const typeBadgeClasses: Record<string, string> = {
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  maintenance: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

const emptyForm = {
  title: '',
  message: '',
  type: 'info' as string,
  show_banner: false,
  starts_at: '',
  ends_at: '',
};

export default function AdminAnnouncementsPage() {
  const supabase = createClient();
  const { user } = useUser();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    const { data } = await supabase
      .from('system_announcements')
      .select('*')
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  function openNewForm() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      starts_at: new Date().toISOString().slice(0, 16),
    });
    setShowForm(true);
  }

  function openEditForm(a: Announcement) {
    setEditingId(a.id);
    setForm({
      title: a.title,
      message: a.message,
      type: a.type,
      show_banner: a.show_banner,
      starts_at: a.starts_at ? a.starts_at.slice(0, 16) : '',
      ends_at: a.ends_at ? a.ends_at.slice(0, 16) : '',
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const payload: any = {
      title: form.title,
      message: form.message,
      type: form.type,
      show_banner: form.show_banner,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : new Date().toISOString(),
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    };

    if (editingId) {
      await supabase.from('system_announcements').update(payload).eq('id', editingId);
    } else {
      payload.created_by = user.id;
      payload.is_active = true;
      const { data: inserted } = await supabase
        .from('system_announcements')
        .insert(payload)
        .select()
        .single();

      // Notify all users
      if (inserted) {
        const { data: users } = await supabase.from('profiles').select('id');
        if (users) {
          const notifications = users.map((u: any) => ({
            user_id: u.id,
            type: 'announcement',
            title: form.title,
            message: form.message.substring(0, 200),
            link: null,
            is_read: false,
            email_sent: false,
          }));
          for (let i = 0; i < notifications.length; i += 100) {
            await supabase.from('notifications').insert(notifications.slice(i, i + 100));
          }
        }
      }
    }

    setSaving(false);
    closeForm();
    fetchAnnouncements();
  }

  async function toggleActive(a: Announcement) {
    await supabase
      .from('system_announcements')
      .update({ is_active: !a.is_active })
      .eq('id', a.id);
    fetchAnnouncements();
  }

  async function handleDelete(id: string) {
    await supabase.from('system_announcements').delete().eq('id', id);
    setDeleteConfirm(null);
    fetchAnnouncements();
  }

  function formatDate(d: string | null) {
    if (!d) return '\u2014';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
          <p className="text-muted-foreground">Manage system-wide announcements and banners</p>
        </div>
        <Button onClick={showForm ? closeForm : openNewForm}>
          {showForm ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              {editingId ? 'Edit Announcement' : 'New Announcement'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Announcement title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Announcement message..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-7">
                  <input
                    type="checkbox"
                    id="show_banner"
                    checked={form.show_banner}
                    onChange={(e) => setForm({ ...form, show_banner: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="show_banner">Show on homepage banner</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="starts_at">Starts At</Label>
                  <Input
                    id="starts_at"
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ends_at">Ends At (optional)</Label>
                  <Input
                    id="ends_at"
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Announcement' : 'Create Announcement'}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No announcements yet</p>
            <p className="text-sm">Create your first system announcement</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id} className={!a.is_active ? 'opacity-60' : ''}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold">{a.title}</h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeBadgeClasses[a.type] || typeBadgeClasses.info}`}
                      >
                        {a.type}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          a.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {a.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {a.show_banner && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          Banner
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{a.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(a.starts_at)}
                      {a.ends_at ? ` \u2192 ${formatDate(a.ends_at)}` : ' \u2192 No end date'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(a)}
                      title={a.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {a.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditForm(a)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {deleteConfirm === a.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(a.id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(a.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
