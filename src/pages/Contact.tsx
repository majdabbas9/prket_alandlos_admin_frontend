import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';

interface InfoData {
  showPrice: boolean;
  storeOpeningTime: string;
  email: string;
  phone: string;
  whatsappLink: string;
  location: string;
  description: string;
  showroomEyebrow: string;
  showroomTitle: string;
  showroomDescription: string;
  contactEyebrow: string;
  contactTitle: string;
  contactDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
}

export default function Contact() {
  const [data, setData] = useState<InfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await api.get('/info');
        setData(response.data);
      } catch (err) {
        console.error('Failed to load info', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    setSaving(true);
    setSuccessMsg('');
    try {
      await api.post('/info', data);
      setSuccessMsg('Information updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update info', err);
      alert('Failed to update information.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!data) return <div>Failed to load data</div>;

  return (
    <div className="container-wide py-12 mt-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-display text-walnut-900">Manage Website Information</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Contact Information */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-sand-200">
          <h2 className="text-xl font-semibold mb-6 text-walnut-800">Contact & Global Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Email Address</label>
              <input type="email" name="email" value={data.email || ''} onChange={handleChange} className="w-full rounded-xl border-sand-300 shadow-sm focus:border-walnut-500 focus:ring-walnut-500 p-3 bg-sand-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Phone Number</label>
              <input type="text" name="phone" value={data.phone || ''} onChange={handleChange} className="w-full rounded-xl border-sand-300 shadow-sm focus:border-walnut-500 focus:ring-walnut-500 p-3 bg-sand-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">WhatsApp Link</label>
              <input type="text" name="whatsappLink" value={data.whatsappLink || ''} onChange={handleChange} className="w-full rounded-xl border-sand-300 shadow-sm focus:border-walnut-500 focus:ring-walnut-500 p-3 bg-sand-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Location / Address</label>
              <input type="text" name="location" value={data.location || ''} onChange={handleChange} className="w-full rounded-xl border-sand-300 shadow-sm focus:border-walnut-500 focus:ring-walnut-500 p-3 bg-sand-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Store Opening Time</label>
              <input type="text" name="storeOpeningTime" value={data.storeOpeningTime || ''} onChange={handleChange} className="w-full rounded-xl border-sand-300 shadow-sm focus:border-walnut-500 focus:ring-walnut-500 p-3 bg-sand-50" />
            </div>
            <div className="flex items-center space-x-3 mt-8">
              <input type="checkbox" id="showPrice" name="showPrice" checked={!!data.showPrice} onChange={handleChange} className="h-5 w-5 rounded border-sand-300 text-walnut-600 focus:ring-walnut-500" />
              <label htmlFor="showPrice" className="text-sm font-medium text-ink-700">Show Prices on Website</label>
            </div>
          </div>
        </section>

        {/* Hero Copy */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-sand-200">
          <h2 className="text-xl font-semibold mb-6 text-walnut-800">Hero Section Copy</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Hero Eyebrow (e.g. Crafted in Jordan)</label>
              <input type="text" name="heroEyebrow" value={data.heroEyebrow || ''} onChange={handleChange} className="w-full rounded-xl border-sand-300 shadow-sm focus:border-walnut-500 focus:ring-walnut-500 p-3 bg-sand-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Hero Title</label>
              <input type="text" name="heroTitle" value={data.heroTitle || ''} onChange={handleChange} className="w-full rounded-xl border-sand-300 shadow-sm focus:border-walnut-500 focus:ring-walnut-500 p-3 bg-sand-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Hero Description</label>
              <textarea name="heroDescription" value={data.heroDescription || ''} onChange={handleChange} rows={3} className="w-full rounded-xl border-sand-300 shadow-sm focus:border-walnut-500 focus:ring-walnut-500 p-3 bg-sand-50" />
            </div>
          </div>
        </section>

        {/* Global Description */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-sand-200">
          <h2 className="text-xl font-semibold mb-6 text-walnut-800">Global Description (About Us)</h2>
          <textarea name="description" value={data.description || ''} onChange={handleChange} rows={4} className="w-full rounded-xl border-sand-300 shadow-sm focus:border-walnut-500 focus:ring-walnut-500 p-3 bg-sand-50" />
        </section>

        {/* Contact Page Copy */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-sand-200">
          <h2 className="text-xl font-semibold mb-6 text-walnut-800">Contact Section Copy</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Eyebrow</label>
              <input type="text" name="contactEyebrow" value={data.contactEyebrow || ''} onChange={handleChange} className="w-full rounded-xl border-sand-300 shadow-sm focus:border-walnut-500 focus:ring-walnut-500 p-3 bg-sand-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Title</label>
              <input type="text" name="contactTitle" value={data.contactTitle || ''} onChange={handleChange} className="w-full rounded-xl border-sand-300 shadow-sm focus:border-walnut-500 focus:ring-walnut-500 p-3 bg-sand-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Description</label>
              <textarea name="contactDescription" value={data.contactDescription || ''} onChange={handleChange} rows={3} className="w-full rounded-xl border-sand-300 shadow-sm focus:border-walnut-500 focus:ring-walnut-500 p-3 bg-sand-50" />
            </div>
          </div>
        </section>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-sand-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 flex justify-end px-12">
          {successMsg && (
            <div className="mr-6 flex items-center text-green-600">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {successMsg}
            </div>
          )}
          <button type="submit" disabled={saving} className="btn-primary flex items-center">
            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
        <div className="h-20"></div> {/* Spacer for fixed footer */}
      </form>
    </div>
  );
}
