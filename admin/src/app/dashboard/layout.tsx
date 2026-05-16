'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, LogOut, Settings, Images, Mail } from 'lucide-react';



import { supabase } from '@/lib/supabase';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Inventory Overview';
    if (pathname === '/dashboard/add') return 'Add New Product';
    if (pathname.includes('/edit')) return 'Edit Product';
    if (pathname === '/dashboard/settings') return 'Master Site Control';
    if (pathname === '/dashboard/bulk') return 'Bulk Image Upload';
    if (pathname === '/dashboard/enquiries') return 'Customer Enquiries';
    return 'Admin Dashboard';
  };

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight">Dashboard</h1>
      </div>
      <nav className="p-4 space-y-1">
        <Link 
          href="/dashboard" 
          onClick={() => setIsMobileMenuOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${pathname === '/dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <LayoutDashboard size={20} />
          Inventory
        </Link>
        <Link 
          href="/dashboard/add" 
          onClick={() => setIsMobileMenuOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${pathname === '/dashboard/add' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <PlusCircle size={20} />
          Add Product
        </Link>
        <Link 
          href="/dashboard/bulk" 
          onClick={() => setIsMobileMenuOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${pathname === '/dashboard/bulk' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Images size={20} />
          Bulk Upload
        </Link>
        <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Site Management</div>
        <Link 
          href="/dashboard/settings" 
          onClick={() => setIsMobileMenuOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${pathname === '/dashboard/settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Settings size={20} />
          Master Control
        </Link>
        <Link 
          href="/dashboard/enquiries" 
          onClick={() => setIsMobileMenuOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${pathname === '/dashboard/enquiries' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Mail size={20} />
          Enquiries
        </Link>
      </nav>
      <div className="mt-auto p-4 border-t border-gray-200">
        <button 
          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium w-full transition-colors" 
          onClick={handleLogout}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white z-40 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 w-full">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 w-full">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h2 className="text-base lg:text-lg font-bold text-gray-800 truncate">{getPageTitle()}</h2>
          </div>
          <div className="flex items-center gap-3">
             {/* Small header actions could go here */}
          </div>
        </header>
        <main className="p-4 lg:p-8 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
