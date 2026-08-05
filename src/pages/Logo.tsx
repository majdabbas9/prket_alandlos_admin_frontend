import React, { useState } from 'react';
import { api, API_BASE_URL } from '@/api';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Logo() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const currentLogoUrl = `${API_BASE_URL}/logo?timestamp=${new Date().getTime()}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('image', file); // The backend expects 'image' or 'logo'

    try {
      await api.postFormData('/logo', formData);
      setStatus('success');
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to upload logo');
    }
  };

  return (
    <div className="container-wide py-12 mt-20">
      <h1 className="text-3xl font-bold font-display text-walnut-900 mb-8">Manage Website Logo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sand-200">
          <h2 className="text-xl font-semibold mb-4 text-walnut-800">Upload New Logo</h2>
          
          <div className="mb-6">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-sand-300 rounded-xl cursor-pointer bg-sand-50 hover:bg-sand-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 text-walnut-600 mb-3" />
                <p className="mb-2 text-sm text-ink-600"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-ink-500">PNG, WEBP, SVG recommended (Transparent Background)</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>

          {previewUrl && (
            <div className="mb-6">
              <p className="text-sm font-medium text-ink-700 mb-2">Preview:</p>
              <div className="bg-walnut-800 p-4 rounded-xl flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className="max-h-24 w-auto object-contain" />
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || status === 'uploading'}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'uploading' ? 'Uploading...' : 'Save New Logo'}
          </button>

          {status === 'success' && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Logo updated successfully! (Refresh to see changes on Navbar)</span>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-walnut-800">Current Logo</h2>
          <div className="bg-walnut-800 p-8 rounded-2xl border border-sand-200 flex items-center justify-center min-h-[200px]">
            <img 
              src={status === 'success' && previewUrl ? previewUrl : currentLogoUrl} 
              alt="Current Logo" 
              className="max-h-32 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <p className="text-sm text-ink-600 mt-3 italic">
            This logo is displayed in the navigation bar and footer across the entire website.
          </p>
        </div>
      </div>
    </div>
  );
}
