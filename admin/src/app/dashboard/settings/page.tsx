'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('key');

      if (error) {
        // If table doesn't exist, we'll handle it gracefully
        console.error('Error fetching settings:', error);
        if (error.code === 'PGRST116' || error.message.includes('relation "site_settings" does not exist')) {
            setMessage({ type: 'error', text: 'Table "site_settings" not found. Please create it in Supabase SQL editor.' });
        }
      } else {
        setSettings(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert(settings.map(s => ({ key: s.key, value: s.value })), { onConflict: 'key' });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Settings updated successfully! Changes will reflect on the live site.' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Check console for details.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Control</h1>
          <p className="text-gray-500">Control global website content, contact info, and SEO details.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchSettings}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={saveSettings}
            disabled={saving || settings.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {settings.length === 0 && !loading && !message && (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl text-center">
            <h3 className="text-yellow-800 font-bold text-lg">No Settings Found</h3>
            <p className="text-yellow-700 mt-2">Initialize your site settings by adding keys like <code>hero_title</code>, <code>contact_phone</code>, etc. to the <code>site_settings</code> table.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {settings.map((setting) => (
          <div key={setting.key} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between mb-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                {setting.key.replace(/_/g, ' ')}
              </label>
              <span className="text-xs text-gray-400">Key: {setting.key}</span>
            </div>
            
            {setting.key.includes('subtitle') || setting.key.includes('description') || setting.key.includes('address') || setting.key.includes('meta') ? (
              <textarea 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 min-h-[100px]"
                value={setting.value}
                onChange={(e) => handleUpdate(setting.key, e.target.value)}
              />
            ) : (
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900"
                value={setting.value}
                onChange={(e) => handleUpdate(setting.key, e.target.value)}
              />
            )}
            {setting.description && (
              <p className="mt-2 text-xs text-gray-500 italic">{setting.description}</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
        <h3 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
          <AlertCircle size={18} />
          Pro Tip
        </h3>
        <p className="text-blue-700 text-sm">
          These settings are cached on the live site for performance. After saving, you may need to refresh the live website to see the changes immediately.
        </p>
      </div>
    </div>
  );
}
