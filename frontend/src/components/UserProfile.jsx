import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, GraduationCap, MapPin, Award, BookOpen, Save, RefreshCw, Users, ShieldAlert, Search } from 'lucide-react';
import api from '../services/api';

export default function UserProfile({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [practiceAreas, setPracticeAreas] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [education, setEducation] = useState('');
  const [barRegNumber, setBarRegNumber] = useState('');
  const [institution, setInstitution] = useState('');

  // Networking state
  const [networkingTab, setNetworkingTab] = useState('profile'); // profile | network
  const [networkUsers, setNetworkUsers] = useState([]);
  const [loadingNetwork, setLoadingNetwork] = useState(false);
  const [netSearch, setNetSearch] = useState('');
  const [connectedUsers, setConnectedUsers] = useState({});

  const isProfessional = user?.role === 'LAWYER' || user?.role === 'LAW_STUDENT';

  useEffect(() => {
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (networkingTab === 'network') {
      loadNetwork();
    }
  }, [networkingTab]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      let res;
      if (user.role === 'CITIZEN') {
        res = await api.get('/profiles/citizen');
      } else {
        res = await api.get('/profiles/professional');
      }
      const data = res.data.data;
      setProfile(data);
      if (data) {
        setFullName(data.fullName || '');
        setPhone(data.contactInfo?.phone || user.phone || '');
        setBio(data.bio || '');
        setCity(data.location?.city || '');
        setState(data.location?.state || '');
        setPracticeAreas(data.practiceAreas ? data.practiceAreas.join(', ') : '');
        setExperienceYears(data.experienceYears || 0);
        setEducation(data.education ? data.education.join(', ') : '');
        setBarRegNumber(data.barCouncilRegistration?.registrationNumber || '');
        setInstitution(data.lawStudentDetails?.institution || '');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // Profile not created yet
        setProfile({});
      } else {
        setError('Failed to load profile. Please verify your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadNetwork = async () => {
    try {
      setLoadingNetwork(true);
      const res = await api.get('/lawyers');
      setNetworkUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load network directory:', err);
    } finally {
      setLoadingNetwork(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const payload = {
        fullName,
        bio,
        location: { city, state },
      };

      if (user.role === 'CITIZEN') {
        payload.contactInfo = { phone };
        await api.put('/profiles/citizen', payload);
      } else {
        payload.practiceAreas = practiceAreas.split(',').map((s) => s.trim()).filter(Boolean);
        payload.experienceYears = parseInt(experienceYears) || 0;
        payload.education = education.split(',').map((s) => s.trim()).filter(Boolean);
        if (user.role === 'LAWYER') {
          payload.barCouncilRegistration = { registrationNumber: barRegNumber };
        } else if (user.role === 'LAW_STUDENT') {
          payload.lawStudentDetails = { institution };
        }
        await api.put('/profiles/professional', payload);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      loadProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleConnect = (id) => {
    setConnectedUsers((prev) => ({
      ...prev,
      [id]: prev[id] === 'connected' ? 'none' : prev[id] === 'pending' ? 'none' : 'pending',
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <RefreshCw className="animate-spin w-8 h-8 text-nyaya-600 mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading your profile...</p>
      </div>
    );
  }

  const filteredNetwork = networkUsers.filter(u => 
    u._id !== profile?.user && 
    (u.fullName?.toLowerCase().includes(netSearch.toLowerCase()) || 
     u.title?.toLowerCase().includes(netSearch.toLowerCase()) || 
     u.location?.city?.toLowerCase().includes(netSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Legal Nexus User Center</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Manage your personal profile details, set professional credentials, and build your legal networks.
          </p>
        </div>
      </div>

      {/* Navigation tabs if professional */}
      {isProfessional && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-medium">
          <button
            onClick={() => setNetworkingTab('profile')}
            className={`px-4 py-2 rounded-xl transition ${
              networkingTab === 'profile'
                ? 'bg-nyaya-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            My Profile Settings
          </button>
          <button
            onClick={() => setNetworkingTab('network')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              networkingTab === 'network'
                ? 'bg-nyaya-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Professional Network Hub
          </button>
        </div>
      )}

      {networkingTab === 'profile' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Profile Overview Card (4 columns) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl relative shadow-md">
              {fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              {profile?.barCouncilRegistration?.isVerified && (
                <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-white text-xs" title="Verified Professional">
                  ✓
                </span>
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{fullName || 'New User'}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 bg-nyaya-50 text-nyaya-800 text-[10px] font-bold rounded-full border border-nyaya-100 uppercase tracking-wider">
                {user?.role}
              </span>
            </div>

            <div className="w-full border-t border-slate-100 pt-4 text-left text-xs space-y-3 text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{user?.email}</span>
              </div>
              {phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{phone}</span>
                </div>
              )}
              {city && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{city}, {state || 'India'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Form (8 columns) */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <form onSubmit={handleSave} className="space-y-6">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-nyaya-600" />
                Profile Information
              </h3>

              {success && (
                <div className="p-3 text-xs bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2">
                  ✓ Profile updated successfully!
                </div>
              )}

              {error && (
                <div className="p-3 text-xs bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
                    placeholder="e.g. Adv. Rakesh Gupta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
                    placeholder="Delhi"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
                    placeholder="Delhi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Professional Summary</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none resize-none"
                  placeholder="Provide a brief background..."
                />
              </div>

              {/* Professional Specific Fields */}
              {isProfessional && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Professional Credentials</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Practice Areas (comma separated)</label>
                      <input
                        type="text"
                        value={practiceAreas}
                        onChange={(e) => setPracticeAreas(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
                        placeholder="Employment, Property, Criminal"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
                      <input
                        type="number"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Education / Degrees (comma separated)</label>
                      <input
                        type="text"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
                        placeholder="LL.B (Delhi University), LL.M"
                      />
                    </div>

                    {user.role === 'LAWYER' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Bar Council Registration Number</label>
                        <input
                          type="text"
                          value={barRegNumber}
                          onChange={(e) => setBarRegNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
                          placeholder="e.g. D/1234/2020"
                        />
                      </div>
                    )}

                    {user.role === 'LAW_STUDENT' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Law College / Institution</label>
                        <input
                          type="text"
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-nyaya-500 focus:outline-none"
                          placeholder="e.g. Faculty of Law, DU"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-nyaya-600 hover:bg-nyaya-700 text-white font-bold text-xs rounded-2xl shadow transition flex items-center justify-center gap-2"
              >
                {saving ? (
                  <RefreshCw className="animate-spin w-4 h-4" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Professional Networking Hub UI */
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search colleagues by name, title, or location..."
                value={netSearch}
                onChange={(e) => setNetSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-nyaya-500"
              />
            </div>
            <button
              onClick={loadNetwork}
              disabled={loadingNetwork}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl flex items-center gap-1.5 transition self-end md:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingNetwork ? 'animate-spin' : ''}`} />
              Refresh Directory
            </button>
          </div>

          {loadingNetwork ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
              <RefreshCw className="animate-spin w-8 h-8 text-nyaya-600 mx-auto mb-3" />
              <p className="text-xs text-slate-500">Searching network directory...</p>
            </div>
          ) : filteredNetwork.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">No other professionals found</h3>
              <p className="text-xs text-slate-500 mt-1">Colleagues will appear once they sign up.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNetwork.map((prof) => (
                <div key={prof._id} className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-nyaya-400 hover:shadow-md transition flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase">
                          {prof.fullName?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{prof.fullName}</h4>
                          <p className="text-[10px] text-nyaya-600 font-semibold uppercase">{prof.professionalRole || 'ADVOCATE'}</p>
                        </div>
                      </div>
                      {prof.verificationStatus === 'VERIFIED' && (
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {prof.bio || 'Legal professional participating in the Legal Nexus collaboration network.'}
                    </p>

                    {prof.practiceAreas && prof.practiceAreas.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {prof.practiceAreas.map((pa, idx) => (
                          <span key={idx} className="text-[9px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {pa}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{prof.location?.city || 'Delhi'}</span>
                    </div>

                    <button
                      onClick={() => handleConnect(prof._id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm transition ${
                        connectedUsers[prof._id] === 'connected'
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : connectedUsers[prof._id] === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          : 'bg-nyaya-600 text-white hover:bg-nyaya-700'
                      }`}
                    >
                      {connectedUsers[prof._id] === 'connected'
                        ? 'Connected'
                        : connectedUsers[prof._id] === 'pending'
                        ? 'Pending'
                        : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
