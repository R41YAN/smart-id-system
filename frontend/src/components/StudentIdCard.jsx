import Barcode from './Barcode';
import { getUniversityLogo } from '../utils/universityLogos';

export default function StudentIdCard({
  universityName = 'SIFS ACADEMY',
  universityLogo = null,
  studentName = 'Student Full Name',
  deptCode = 'CSE',
  batchOrIntakeLabel = 'Batch',
  batchOrIntakeValue = '1st Batch',
  academicYear = null,
  studentId = 'CSE5426001',
  photo = null,
  isLivePreview = false,
  onPhotoClick = null,
  cardRef = null,
  compact = false
}) {
  const displayLogo = getUniversityLogo(universityName, universityLogo);

  if (compact) {
    return (
      <div
        ref={cardRef}
        className="w-full bg-white rounded-xl border border-slate-300 overflow-hidden text-slate-800 shadow-xs print:shadow-none print:border print:border-slate-400 select-none flex flex-col justify-between"
        style={{ height: '62mm', width: '90mm', boxSizing: 'border-box' }}
      >
        {/* Card Header Band with Navy & Gold Styling */}
        <div className="relative bg-gradient-to-r from-[#070C18] via-[#0B132B] to-[#1C2541] px-3 py-1.5 border-b border-amber-400 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded-md bg-white/10 p-0.5 flex items-center justify-center shrink-0 border border-amber-400/40">
              {displayLogo ? (
                <img src={displayLogo} alt="Logo" className="w-full h-full object-contain rounded-xs" />
              ) : (
                <svg className="w-3.5 h-3.5 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-[8px] uppercase font-bold tracking-wider text-amber-300 truncate leading-tight">
                {universityName}
              </p>
              <p className="text-[9px] font-black text-white tracking-tight leading-tight">
                STUDENT ID
              </p>
            </div>
          </div>
          <span className="text-[7px] font-mono font-bold text-amber-300 bg-amber-400/10 px-1 py-0.5 rounded border border-amber-400/30 shrink-0">
            OFFICIAL
          </span>
        </div>

        {/* Compact Card Body */}
        <div className="p-2 flex-1 flex flex-col justify-between">
          <div className="flex items-start gap-2.5">
            {/* Photo / Silhouette */}
            <div className="w-14 h-16 rounded-md bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
              {photo ? (
                <img src={photo} alt={studentName} className="w-full h-full object-cover object-center" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                  <svg className="w-6 h-6 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <span className="text-[7px] font-mono text-slate-400">PHOTO</span>
                </div>
              )}
            </div>

            {/* Info details */}
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="text-xs font-black text-slate-900 truncate leading-tight">
                {studentName}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[9px]">
                <span className="font-bold text-slate-500 uppercase">Dept:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200/50">
                  {deptCode}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[9px] truncate">
                <span className="font-bold text-slate-500">{batchOrIntakeLabel}:</span>
                <span className="font-semibold text-slate-800 truncate">
                  {batchOrIntakeValue} {academicYear ? `(${academicYear})` : ''}
                </span>
              </div>
              <div className="mt-1 bg-amber-50/60 border border-amber-200/60 rounded px-1.5 py-0.5 flex items-center justify-between">
                <span className="text-[8px] font-bold uppercase text-amber-900">ID:</span>
                <span className="font-mono text-[11px] font-black tracking-wide text-blue-800">
                  {studentId}
                </span>
              </div>
            </div>
          </div>

          {/* Barcode & Verification */}
          <div className="pt-1 border-t border-slate-100 flex items-center justify-between mt-1">
            <div className="flex-1 max-w-[170px] overflow-hidden">
              <Barcode value={studentId} height={18} width={1.2} />
            </div>
            <span className="text-[7px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 shrink-0">
              VERIFIED
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-3d-wrap w-full max-w-[340px] mx-auto select-none">
      <div
        ref={cardRef}
        className="card-3d w-full bg-white rounded-3xl shadow-xl shadow-slate-900/10 border border-slate-200/90 overflow-hidden relative print:shadow-none print:border-2"
      >
        {/* Lanyard Hole Visual */}
        <div className="w-14 h-2 bg-slate-200/90 rounded-full mx-auto mt-3 mb-1 print:hidden shadow-inner" />

        {/* Card Header Band with Navy & Gold Styling */}
        <div className="relative bg-gradient-to-r from-[#070C18] via-[#0B132B] to-[#1C2541] px-5 py-4 border-b-2 border-amber-400">
          {/* Subtle gold decorative glow */}
          <div className="absolute top-0 right-0 w-28 h-full bg-gradient-to-l from-amber-400/10 to-transparent pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-amber-400/40 p-1.5 flex items-center justify-center shrink-0 shadow-sm">
              {displayLogo ? (
                <img src={displayLogo} alt="Logo" className="w-full h-full object-contain rounded" />
              ) : (
                <svg className="w-5 h-5 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase font-bold tracking-widest text-amber-300 truncate">
                {universityName}
              </p>
              <p className="text-xs font-extrabold text-white leading-tight tracking-wide mt-0.5">
                STUDENT IDENTITY CARD
              </p>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <div className="flex gap-4 items-start mb-4">
            {/* Avatar / Photo Slot with Auto-Fit */}
            <div
              onClick={onPhotoClick}
              className={`w-20 h-24 rounded-xl bg-slate-100 border border-slate-200/90 flex flex-col items-center justify-center text-slate-400 shrink-0 relative overflow-hidden transition-all shadow-inner ${
                onPhotoClick ? 'cursor-pointer hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20 group' : ''
              }`}
              title={onPhotoClick ? 'Click to upload/change photo' : undefined}
            >
              {photo ? (
                <img
                  src={photo}
                  alt={studentName}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <>
                  <svg className="w-10 h-10 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">PHOTO</span>
                </>
              )}

              {onPhotoClick && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold">
                  <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>CHANGE</span>
                </div>
              )}
            </div>

            {/* Student Info */}
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Student Name</p>
              <p className="text-sm font-extrabold text-slate-900 truncate leading-snug mt-0.5">
                {studentName || 'Student Full Name'}
              </p>

              <div className="mt-2.5 grid grid-cols-2 gap-2 text-left">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Dept</p>
                  <p className="font-mono text-xs font-bold text-slate-800">
                    {deptCode || 'CSE'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    {batchOrIntakeLabel}
                  </p>
                  <p className="font-mono text-xs font-bold text-slate-800 truncate">
                    {batchOrIntakeValue}
                  </p>
                  {academicYear && (
                    <p className="font-mono text-[10px] font-semibold text-slate-500 leading-none mt-0.5">
                      ({academicYear})
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ID Number Box */}
          <div
            className={`p-3 rounded-2xl border text-center transition-all ${
              !isLivePreview
                ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border-amber-300 text-amber-950 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Generated Student ID
            </p>
            <p className="font-mono text-xl font-black tracking-wider mt-0.5 text-blue-700">
              {studentId}
            </p>
          </div>

          {/* Scannable Real Code 128 Barcode */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex-1 max-w-[200px] overflow-hidden">
              <Barcode value={studentId} height={32} width={1.5} />
            </div>
            <span className="text-[10px] font-mono text-emerald-600 font-bold shrink-0 ml-2 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              VERIFIED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
