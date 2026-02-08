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
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'recruiter' ? 'Job Applications' : 'My Applications'}
            </h1>
            <p className="mt-2 text-gray-600">
              {user?.role === 'recruiter' 
                ? 'Review and manage applications for your job postings'
                : 'Track the status of your job applications'
              }
            </p>
          </div>

          {/* Dynamic Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stats.reviewing}</div>
              <div className="text-sm text-gray-600">Reviewing</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{stats.shortlisted}</div>
              <div className="text-sm text-gray-600">Shortlisted</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">{stats.accepted}</div>
              <div className="text-sm text-gray-600">Accepted</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>

          {/* Filter for recruiters */}
          {user?.role === 'recruiter' && (
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Filter by status:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          <div className="space-y-4">
            {filteredApplications.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-600">
                  {user?.role === 'recruiter' 
                    ? 'No applications found for your job postings.'
                    : 'You haven\'t applied to any jobs yet.'
                  }
                </p>
                {user?.role === 'candidate' && (
                  <button
                    onClick={() => window.location.href = '/jobs'}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Browse Jobs
                  </button>
                )}
              </div>
            ) : (
              filteredApplications.map((application) => (
                <div key={application._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.job.title}
                      </h3>
                      <p className="text-gray-600">
                        {application.job.company?.name} • {application.job.location}
                      </p>
                      <p className="text-sm text-gray-500">
                        Applied on {formatDate(application.appliedAt)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>

                  {user?.role === 'recruiter' ? (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Applicant Information</h4>
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
                      {application.applicant.profile?.skills && (
                        <p className="text-gray-700">
                          <strong>Skills:</strong> {application.applicant.profile.skills.join(', ')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Job Details</h4>
                      <p className="text-gray-700">
                        <strong>Type:</strong> {application.job.jobType}
                      </p>
                      <p className="text-gray-700">
                        <strong>Experience Level:</strong> {application.job.experienceLevel}
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
                  </div>

                  {application.expectedSalary && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Expected Salary</h4>
                      <p className="text-gray-700">{application.expectedSalary}</p>
                    </div>
                  )}

                  {application.availability && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Availability</h4>
                      <p className="text-gray-700">{application.availability}</p>
                    </div>
                  )}

                  {/* Action buttons for recruiters */}
                  {user?.role === 'recruiter' && (
                    <div className="flex space-x-2">
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'reviewing')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Start Review
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {application.status === 'reviewing' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'shortlisted')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {application.status === 'shortlisted' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'accepted')}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Reject
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
