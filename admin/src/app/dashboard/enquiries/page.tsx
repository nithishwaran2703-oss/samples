'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, User, Phone, Calendar, CheckCircle, MessageSquare, Clock } from 'lucide-react';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEnquiries(data || []);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      fetchEnquiries();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Enquiries</p>
              <h4 className="text-2xl font-bold text-gray-900">{enquiries.length}</h4>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-50 p-3 rounded-xl text-yellow-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">New Leads</p>
              <h4 className="text-2xl font-bold text-gray-900">{enquiries.filter(e => e.status === 'New').length}</h4>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-xl text-green-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Completed</p>
              <h4 className="text-2xl font-bold text-gray-900">{enquiries.filter(e => e.status === 'Completed').length}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {enquiries.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <Mail size={48} className="mx-auto text-gray-300 mb-4" />
            <h4 className="text-lg font-bold text-gray-900">No enquiries yet</h4>
            <p className="text-gray-500">Messages from your contact form will appear here.</p>
          </div>
        ) : (
          enquiries.map((enquiry) => (
            <div key={enquiry.id} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      enquiry.status === 'New' ? 'bg-blue-100 text-blue-700' : 
                      enquiry.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      {enquiry.status}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(enquiry.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900">{enquiry.subject || 'Inquiry about products'}</h3>
                  
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-xl italic leading-relaxed">
                    "{enquiry.message}"
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User size={16} className="text-blue-500" />
                      <span className="font-medium">{enquiry.name}</span>
                    </div>
                    {enquiry.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={16} className="text-blue-500" />
                        <span className="font-medium">{enquiry.email}</span>
                      </div>
                    )}
                    {enquiry.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={16} className="text-blue-500" />
                        <span className="font-medium">{enquiry.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 justify-end">
                  <button 
                    onClick={() => updateStatus(enquiry.id, 'In Progress')}
                    className="px-4 py-2 text-sm font-bold text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                  >
                    Mark In Progress
                  </button>
                  <button 
                    onClick={() => updateStatus(enquiry.id, 'Completed')}
                    className="px-4 py-2 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
