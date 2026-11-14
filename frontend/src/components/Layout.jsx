import Sidebar from './Sidebar';
import { PaperDecor } from './Decor';

export default function Layout({ children }) {
  return (
    <div className="sifs-paper flex min-h-screen text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      <Sidebar />
      <main className="relative flex-1 min-w-0 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <PaperDecor />
        <div className="relative z-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
