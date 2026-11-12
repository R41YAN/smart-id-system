import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getUniversityLogo } from '../utils/universityLogos';
import {
  DepartmentIcon,
  StudentsIcon,
  LockIcon,
  UnlockIcon,
  AdmitIcon,
  ArrowRightIcon,
  UniversityIcon
} from '../components/Icons';

function StatCard({ icon: Icon, label, value, subtext, colorClass, iconBg, badgeText }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-200/80 transition-all duration-200 group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`p-2.5 rounded-xl ${iconBg} group-hover:scale-105 transition-transform`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value ?? '—'}</p>
        {badgeText && (
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {badgeText}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-slate-400 mt-1.5 font-medium">{subtext}</p>}
    </div>
  );
}

export default function ClientAdminDashboard() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoMsg, setLogoMsg] = useState('');

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !university) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, SVG, WebP).');
      return;
    }
    setLogoUploading(true);
    setLogoMsg('');

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
          const res = await api.put(`/universities/${university.id}`, { logo_url: resized });
          const newLogo = res.data.logo_url;
          setUniversity((prev) => ({ ...prev, logo_url: newLogo }));
          // Update user in localStorage so sidebar reflects it
          const localUser = localStorage.getItem('user');
          if (localUser) {
            const parsed = JSON.parse(localUser);
            parsed.university_logo = newLogo;
            localStorage.setItem('user', JSON.stringify(parsed));
          }
          setLogoMsg('Logo updated!');
          setTimeout(() => setLogoMsg(''), 3000);
        } catch (err) {
          console.error('Failed to update logo:', err);
          alert('Failed to update university logo.');
        } finally {
          setLogoUploading(false);
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    Promise.all([api.get('/departments'), api.get('/students')])
      .then(([d, s]) => {
        setDepartments(d.data);
        setStudents(s.data);
      })
      .finally(() => setLoading(false));

    if (user?.university_id) {
      api.get(`/universities/${user.university_id}`).then(r => setUniversity(r.data));
    }
  }, [user]);

  const isOpen = university?.type === 'open_credit';

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Admission Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Institutional student enrollment, ID generation engine & directory
            </p>
          </div>

          {university && (
            <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
              {/* Top Row (2 Red Mark): Larger Prominent University Logo & Name */}
              <div className="flex items-center gap-3">
                <div
                  onClick={() => document.getElementById('dashboard-uni-logo-input')?.click()}
                  className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-500 hover:ring-4 hover:ring-blue-100 p-1.5 flex items-center justify-center shrink-0 shadow-sm cursor-pointer relative group transition-all"
                  title="Click to change university logo"
                >
                  {getUniversityLogo(university.name, university.logo_url) ? (
                    <img
                      src={getUniversityLogo(university.name, university.logo_url)}
                      alt={university.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <UniversityIcon className="w-6 h-6 text-blue-600" />
                  )}
                  <div className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    📷
                  </div>
                </div>

                <input
                  type="file"
                  id="dashboard-uni-logo-input"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />

                <div className="text-left lg:text-right">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    {university.name}
                  </h2>
                  {logoMsg && (
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {logoMsg}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Row (2 Green Mark): Status Badges & Quick Action Button */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isOpen
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}
                >
                  {isOpen ? 'Open Credit Model' : 'Close Credit Model'}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    university.is_locked
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {university.is_locked ? (
                    <>
                      <LockIcon className="w-3 h-3 text-rose-600" />
                      Locked
                    </>
                  ) : (
                    <>
                      <UnlockIcon className="w-3 h-3 text-emerald-600" />
                      Active Engine
                    </>
                  )}
                </span>

                <Link
                  to="/admin/admit"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer ml-1"
                >
                  <AdmitIcon className="w-4 h-4" />
                  <span>Admit Student</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Live ID Formatting Formula Pill */}
        <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200/70 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-700 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-mono font-bold text-[11px] tracking-wider shrink-0 shadow-xs">
              FORMAT RULE
            </span>
            <div className="flex items-center gap-1.5 flex-wrap font-mono font-bold text-xs text-blue-900">
              <span className="bg-white/80 border border-blue-200 px-2 py-0.5 rounded shadow-2xs">[Dept Code]</span>
              <span>+</span>
              <span className="bg-white/80 border border-blue-200 px-2 py-0.5 rounded shadow-2xs">
                {isOpen ? '[YY]' : '[Batch]'}
              </span>
              <span>+</span>
              <span className="bg-white/80 border border-blue-200 px-2 py-0.5 rounded shadow-2xs">
                {isOpen ? '[SemCode]' : '[YY]'}
              </span>
              <span>+</span>
              <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded shadow-2xs">
                [3-Digit Serial]
              </span>
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            Example: <strong className="font-mono text-slate-800">{isOpen ? 'CSE26FL001' : 'CSE5426001'}</strong>
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            icon={DepartmentIcon}
            label="Active Departments"
            value={departments.length}
            subtext="Available for student intake"
            colorClass="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            icon={StudentsIcon}
            label="Enrolled Students"
            value={students.length}
            subtext="Generated smart ID numbers"
            colorClass="text-emerald-600"
            iconBg="bg-emerald-50"
            badgeText={students.length > 0 ? 'Verified' : null}
          />
          <StatCard
            icon={university?.is_locked ? LockIcon : UnlockIcon}
            label="Admission Engine"
            value={university?.is_locked ? 'Locked' : 'Active'}
            subtext={university?.is_locked ? 'Admissions temporarily paused' : 'Sequential ID generation ready'}
            colorClass={university?.is_locked ? 'text-rose-600' : 'text-purple-600'}
            iconBg={university?.is_locked ? 'bg-rose-50' : 'bg-purple-50'}
          />
        </div>

        {/* Recent Admissions Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Student Admissions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest generated IDs in this university</p>
            </div>
            {students.length > 0 && (
              <Link
                to="/admin/students"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors"
              >
                <span>View Full Roster</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading admissions...</div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center">
              <StudentsIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No students admitted yet</p>
              <p className="text-xs text-slate-400 mt-1">Start by enrolling a student through the admission form.</p>
              <Link
                to="/admin/admit"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <AdmitIcon className="w-3.5 h-3.5" />
                <span>Admit First Student</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500">
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Student ID</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">Admission Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {students.slice(0, 8).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-1 rounded-lg">
                          {s.student_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          {s.photo ? (
                            <img
                              src={s.photo}
                              alt={s.name}
                              className="w-8 h-8 rounded-full object-cover object-center ring-2 ring-blue-100 shrink-0 border border-slate-200 select-none"
                            />
                          ) : (
                            <div
                              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 select-none"
                              title="No photo attached"
                            >
                              {(s.name || '?')[0].toUpperCase()}
                            </div>
                          )}
                          <span className="truncate">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="font-mono text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {s.department_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                        {new Date(s.admitted_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
