import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, GraduationCap, Briefcase, MapPin, Award, Star } from 'lucide-react';
import api from '../services/api';

export default function LawyerDirectory() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [practiceArea, setPracticeArea] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    loadLawyers();
  }, [practiceArea, roleFilter]);

  const loadLawyers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (practiceArea) params.practiceArea = practiceArea;
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;

      const res = await api.get('/lawyers', { params });
      setLawyers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load lawyers directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLawyers();
  };

  return (
    <div className="space-y-6">
      {/* Directory Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Legal Professionals & Student Directory</h2>
          <p className="text-sm text-slate-500">
            Find Bar Council verified advocates, legal aid specialists, and law students
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by advocate name, court, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nyaya-500"
          />
        </div>

        <select
          value={practiceArea}
          onChange={(e) => setPracticeArea(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nyaya-500 text-slate-700"
        >
          <option value="">All Practice Areas</option>
          <option value="Employment">Employment & Labor</option>
          <option value="Consumer">Consumer Protection</option>
          <option value="Property">Property & Real Estate</option>
          <option value="Family">Family & Matrimonial</option>
          <option value="Criminal">Criminal Defense</option>
          <option value="Corporate">Corporate & Contracts</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nyaya-500 text-slate-700"
        >
          <option value="">All Roles</option>
          <option value="LAWYER">Advocate / Lawyer</option>
          <option value="LAW_STUDENT">Law Student</option>
        </select>
      </form>

      {/* Lawyers Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="animate-spin w-8 h-8 border-4 border-nyaya-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">Searching directory...</p>
        </div>
      ) : lawyers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No legal professionals found</h3>
          <p className="text-sm text-slate-500 mt-1">Try broadening your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lawyers.map((prof) => (
            <div
              key={prof._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-nyaya-400 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                      {prof.fullName?.charAt(0) || 'L'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{prof.fullName}</h4>
                      <p className="text-xs text-nyaya-600 font-medium">{prof.title || 'Legal Professional'}</p>
                    </div>
                  </div>

                  {prof.verificationStatus === 'VERIFIED' ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {prof.professionalRole === 'LAW_STUDENT' ? 'Student' : 'Advocate'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                  {prof.bio || 'Experienced legal counsel offering assistance across judicial forums.'}
                </p>

                {prof.practiceAreas && prof.practiceAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {prof.practiceAreas.map((pa, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {pa}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {prof.location?.city || 'Delhi'}, {prof.location?.state || 'India'}
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Award className="w-3.5 h-3.5 text-nyaya-600" />
                  {prof.experienceYears || 0} yrs exp
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
