import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { getUniversityLogo } from '../utils/universityLogos';
import {
  UniversityIcon,
  PlusIcon,
  TrashIcon,
  LockIcon,
  UnlockIcon
} from '../components/Icons';

export default function ManageUniversities() {
  const [universities, setUniversities] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'open_credit', logo_url: '' });
  const [editingUniId, setEditingUniId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUniversities = () => {
    api.get('/universities').then(r => setUniversities(r.data));
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  // Client-side auto-resizing via Canvas for new university logo
  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, SVG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 300;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const resized = canvas.toDataURL('image/png');
        setForm((prev) => ({ ...prev, logo_url: resized }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const triggerEditLogo = (uniId) => {
    setEditingUniId(uniId);
    document.getElementById('edit-uni-logo-file-input')?.click();
  };

  // Client-side auto-resizing via Canvas for existing university logo update
  const handleEditLogoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingUniId) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const maxDim = 300;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const resized = canvas.toDataURL('image/png');

        try {
          await api.put(`/universities/${editingUniId}`, { logo_url: resized });
          fetchUniversities();
        } catch (err) {
          alert('Failed to update logo.');
        } finally {
          setEditingUniId(null);
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async (uniId) => {
    if (!window.confirm('Remove logo and revert to the default blue bank icon?')) return;
    try {
      await api.put(`/universities/${uniId}`, { logo_url: null });
      fetchUniversities();
    } catch {
      alert('Failed to revert logo.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/universities', form);
      setForm({ name: '', type: 'open_credit', logo_url: '' });
      fetchUniversities();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register university');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this university? Note: Locked universities with student admissions cannot be removed.')) return;
    try {
      await api.delete(`/universities/${id}`);
      fetchUniversities();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete university.');
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            University Tenants
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure universities and select their academic credit structure (Open Credit or Close Credit).
          </p>
        </div>

        {/* Hidden file input for editing existing logos */}
        <input
          type="file"
          id="edit-uni-logo-file-input"
          accept="image/*"
          className="hidden"
          onChange={handleEditLogoFile}
        />

        {/* Create Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PlusIcon className="w-5 h-5 text-blue-600" />
            <span>Register New University</span>
          </h2>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-medium mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col lg:flex-row items-start gap-6">
              {/* Photo-Style Frame for LOGO */}
              <div className="shrink-0 flex flex-col items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 self-start">
                  Logo <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <div
                  onClick={() => document.getElementById('new-uni-logo-input')?.click()}
                  className="w-20 h-24 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border-2 border-dashed border-slate-200 hover:border-blue-400 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 shrink-0 relative overflow-hidden transition-all cursor-pointer group shadow-2xs"
                  title="Click to upload university logo"
                >
                  {form.logo_url ? (
                    <>
                      <img
                        src={form.logo_url}
                        alt="Logo preview"
                        className="w-full h-full object-contain p-1.5"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold">
                        <span>Change</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-slate-200/70 group-hover:bg-blue-100 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors mb-1">
                        <UniversityIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-widest">LOGO</span>
                    </>
                  )}
                </div>

                <input
                  type="file"
                  id="new-uni-logo-input"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoSelect}
                />

                {form.logo_url && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, logo_url: '' })}
                    className="mt-1.5 text-[11px] text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                  >
                    ✕ Remove
                  </button>
                )}
              </div>

              {/* Form Inputs */}
              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      University Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. North South University"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Credit Model
                    </label>
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                    >
                      <option value="open_credit">Open Credit</option>
                      <option value="close_credit">Close Credit</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2.5 px-3.5 py-2 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs">
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md font-mono font-bold text-[10px] tracking-wider uppercase">
                      Format Rule
                    </span>
                    <span className="font-mono font-bold text-blue-800 text-xs sm:text-sm">
                      {form.type === 'open_credit' ? '[Dept][YY][Sem][Serial]' : '[Dept][Batch][YY][Serial]'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium hidden md:inline">
                      {form.type === 'open_credit' ? '(e.g. CSE26FL001)' : '(e.g. CSE5426001)'}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer shrink-0"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>{loading ? 'Adding...' : 'Register University'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Existing Universities */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Registered Universities</h2>
              <p className="text-xs text-slate-500 mt-0.5">{universities.length} institutions configured</p>
            </div>
          </div>

          {universities.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No universities registered yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {universities.map((u) => {
                const logo = getUniversityLogo(u.name, u.logo_url);
                return (
                  <div
                    key={u.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      {/* Uni Logo or Blue Bank Icon Fallback (NEVER SIFS) */}
                      {logo ? (
                        <div
                          onClick={() => triggerEditLogo(u.id)}
                          className="w-12 h-12 rounded-xl bg-white border border-slate-200/90 p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden cursor-pointer hover:border-blue-400 hover:ring-2 hover:ring-blue-100 transition-all relative group"
                          title="Click to change logo"
                        >
                          <img
                            src={logo}
                            alt={u.name}
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold">
                            <span>Edit</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => triggerEditLogo(u.id)}
                          className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/80 p-2.5 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs cursor-pointer hover:border-blue-400 hover:ring-2 hover:ring-blue-100 transition-all relative group"
                          title="No logo added — click to upload"
                        >
                          <UniversityIcon className="w-6 h-6" />
                          <div className="absolute inset-0 bg-blue-900/70 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold">
                            <span>+Logo</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            u.type === 'open_credit'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {u.type === 'open_credit' ? 'Open Credit Model' : 'Close Credit Model'}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            u.is_locked
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {u.is_locked ? (
                              <>
                                <LockIcon className="w-3 h-3 text-rose-600" />
                                Locked (Admissions Active)
                              </>
                            ) : (
                              <>
                                <UnlockIcon className="w-3 h-3 text-emerald-600" />
                                Active (Unlocked)
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => triggerEditLogo(u.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Upload or change university logo"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{u.logo_url ? 'Change Logo' : 'Add Logo'}</span>
                      </button>

                      {u.logo_url && (
                        <button
                          onClick={() => handleRemoveLogo(u.id)}
                          className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Revert to blue bank icon"
                        >
                          <span>Revert</span>
                        </button>
                      )}

                      <span className="text-xs text-slate-400 font-medium px-1">
                        {new Date(u.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>

                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={u.is_locked}
                        title={u.is_locked ? 'Cannot delete: student admissions have begun' : 'Delete university'}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
