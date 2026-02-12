import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    rejected: 0,
    accepted: 0
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    const newStats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      reviewing: applications.filter(app => app.status === 'reviewing').length,
      shortlisted: applications.filter(app => app.status === 'shortlisted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      accepted: applications.filter(app => app.status === 'accepted').length
    };
    setStats(newStats);
  }, [applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === 'recruiter' 
        ? 'http://localhost:5000/api/applications/recruiter/all'
        : 'http://localhost:5000/api/applications/my-applications';
      
      const response = await axios.get(endpoint);
      setApplications(response.data.applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/applications/${applicationId}/status`, { status });
      fetchApplications(); // Refresh the list
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'accepted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 flex justify-center items-center">
        <div className="text-center">
          <div className="spinner-gradient w-16 h-16 mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium animate-pulse">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8 animate-fadeInUp">
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              {user?.role === 'recruiter' ? 'Job Applications' : 'My Applications'}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              {user?.role === 'recruiter' 
                ? 'Review and manage applications for your job postings'
                : 'Track the status of your job applications'
              }
            </p>
          </div>

          {/* Dynamic Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8 animate-slideInLeft">
            <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/20 transform transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold gradient-text-primary">{stats.total}</div>
              <div className="text-sm text-gray-600 font-medium">Total Applications</div>
              <div className="mt-2 h-1 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full"></div>
            </div>
            <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/20 transform transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600 font-medium">Pending</div>
              <div className="mt-2 h-1 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full"></div>
            </div>
            <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/20 transform transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold text-blue-600">{stats.reviewing}</div>
              <div className="text-sm text-gray-600 font-medium">Reviewing</div>
              <div className="mt-2 h-1 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full"></div>
            </div>
            <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/20 transform transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold text-green-600">{stats.shortlisted}</div>
              <div className="text-sm text-gray-600 font-medium">Shortlisted</div>
              <div className="mt-2 h-1 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full"></div>
            </div>
            <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/20 transform transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold text-cyan-600">{stats.accepted}</div>
              <div className="text-sm text-gray-600 font-medium">Accepted</div>
              <div className="mt-2 h-1 bg-gradient-to-r from-cyan-200 to-teal-200 rounded-full"></div>
            </div>
            <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/20 transform transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600 font-medium">Rejected</div>
              <div className="mt-2 h-1 bg-gradient-to-r from-red-200 to-pink-200 rounded-full"></div>
            </div>
          </div>

          {/* Filter for recruiters */}
          {user?.role === 'recruiter' && (
            <div className="bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 mb-8 animate-fadeInUp">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-bold text-gray-700">Filter by status:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 transition-all duration-300"
                >
                  <option value="all">All Applications</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="accepted">Accepted</option>
                </select>
              </div>
            </div>
          )}

          {/* Applications List */}
          <div className="space-y-6 animate-fadeInUp">
            {filteredApplications.length === 0 ? (
              <div className="bg-white/95 backdrop-blur-xl p-12 rounded-2xl shadow-xl border border-white/20 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-600 mb-6">
                  {user?.role === 'recruiter' 
                    ? 'No applications found for your job postings.'
                    : 'You haven\'t applied to any jobs yet.'
                  }
                </p>
                {user?.role === 'candidate' && (
                  <button
                    onClick={() => window.location.href = '/jobs'}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Browse Jobs
                  </button>
                )}
              </div>
            ) : (
              filteredApplications.map((application, index) => (
                <div key={application._id} className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 transform transition-all duration-300 hover:scale-102 hover:shadow-2xl animate-slideInLeft" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {application.job.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-gray-600 mb-2">
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{application.job.company?.name}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{application.job.location}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Applied on {formatDate(application.appliedAt)}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(application.status)} shadow-md`}>
                      {application.status}
                    </span>
                  </div>

                  {user?.role === 'recruiter' ? (
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Applicant Information</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-700">
                            <strong>Name:</strong> {application.applicant.name}
                          </p>
                          <p className="text-gray-700">
                            <strong>Email:</strong> {application.applicant.email}
                          </p>
                          {application.applicant.profile?.phone && (
                            <p className="text-gray-700">
                              <strong>Phone:</strong> {application.applicant.profile.phone}
                            </p>
                          )}
                        </div>
                        {application.applicant.profile?.skills && (
                          <div>
                            <p className="text-gray-700">
                              <strong>Skills:</strong>
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {application.applicant.profile.skills.map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0012.004 3c-4.907 0-8.996 3.896-8.996 8.865a8.937 8.937 0 003.746 7.288 1.1 1.1 0 01.424.923V21a1 1 0 001 1h6a1 1 0 001-1v-.924c0-.377.162-.735.424-.923A8.937 8.937 0 0021 13.255z" />
                        </svg>
                        <span>Job Details</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p className="text-gray-700">
                          <strong>Type:</strong> {application.job.jobType}
                        </p>
                        <p className="text-gray-700">
                          <strong>Experience Level:</strong> {application.job.experienceLevel}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Cover Letter</span>
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap bg-white/50 p-3 rounded-lg">{application.coverLetter}</p>
                  </div>

                  {application.expectedSalary && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Expected Salary</span>
                      </h4>
                      <p className="text-gray-700">{application.expectedSalary}</p>
                    </div>
                  )}

                  {application.availability && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Availability</span>
                      </h4>
                      <p className="text-gray-700">{application.availability}</p>
                    </div>
                  )}

                  {/* Action buttons for recruiters */}
                  {user?.role === 'recruiter' && (
                    <div className="flex flex-wrap gap-3">
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'reviewing')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>Start Review</span>
                            </div>
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'rejected')}
                            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Reject</span>
                            </div>
                          </button>
                        </>
                      )}
                      {application.status === 'reviewing' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'shortlisted')}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Shortlist</span>
                            </div>
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'rejected')}
                            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Reject</span>
                            </div>
                          </button>
                        </>
                      )}
                      {application.status === 'shortlisted' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'accepted')}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Accept</span>
                            </div>
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'rejected')}
                            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Reject</span>
                            </div>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applications;
