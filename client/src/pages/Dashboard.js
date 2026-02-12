import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        if (user?.role === 'recruiter') {
          // Fetch recruiter-specific data
          const [jobsResponse, applicationsResponse] = await Promise.all([
            axios.get('http://localhost:5000/api/jobs/my-jobs/posted'),
            axios.get('http://localhost:5000/api/applications/recruiter/all')
          ]);

          const jobs = jobsResponse.data.jobs || [];
          const applications = applicationsResponse.data.applications || [];

          const recruiterStats = [
            { 
              label: 'Jobs Posted', 
              value: jobs.length.toString(), 
              color: 'bg-blue-500' 
            },
            { 
              label: 'Total Applications', 
              value: applications.length.toString(), 
              color: 'bg-green-500' 
            },
            { 
              label: 'Active Jobs', 
              value: jobs.filter(job => job.status === 'active').length.toString(), 
              color: 'bg-yellow-500' 
            },
            { 
              label: 'Closed Jobs', 
              value: jobs.filter(job => job.status === 'closed').length.toString(), 
              color: 'bg-gray-500' 
            }
          ];

          const activity = applications.slice(0, 3).map((app, index) => ({
            id: index + 1,
            type: 'application',
            message: `New application for ${app.job?.title || 'Position'}`,
            time: `${Math.floor(Math.random() * 24) + 1} hours ago`
          }));

          setStats(recruiterStats);
          setRecentActivity(activity);
        } else {
          // Fetch candidate-specific data
          const applicationsResponse = await axios.get('http://localhost:5000/api/applications/my-applications');
          const applications = applicationsResponse.data.applications || [];

          const candidateStats = [
            { 
              label: 'Applications Sent', 
              value: applications.length.toString(), 
              color: 'bg-blue-500' 
            },
            { 
              label: 'Profile Views', 
              value: applications.length > 0 ? Math.floor(applications.length * 2.5).toString() : '0', 
              color: 'bg-green-500' 
            },
            { 
              label: 'Shortlisted', 
              value: applications.filter(app => app.status === 'shortlisted').length.toString(), 
              color: 'bg-yellow-500' 
            }
          ];

          // Only add Saved Jobs if user has saved jobs data
          const hasSavedJobs = user?.profile?.savedJobs && user.profile.savedJobs.length > 0;
          if (hasSavedJobs) {
            candidateStats.push({ 
              label: 'Saved Jobs', 
              value: user.profile.savedJobs.length.toString(), 
              color: 'bg-purple-500' 
            });
          }

          const activity = applications.slice(0, 3).map((app, index) => ({
            id: index + 1,
            type: 'application',
            message: `Application for ${app.job?.title || 'Position'} ${app.status}`,
            time: formatTimeAgo(app.appliedAt)
          }));

          setStats(candidateStats);
          setRecentActivity(activity);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to default data
        setStats(user?.role === 'recruiter' ? [
          { label: 'Jobs Posted', value: '0', color: 'bg-blue-500' },
          { label: 'Total Applications', value: '0', color: 'bg-green-500' },
          { label: 'Active Jobs', value: '0', color: 'bg-yellow-500' },
          { label: 'Closed Jobs', value: '0', color: 'bg-gray-500' }
        ] : [
          { label: 'Applications Sent', value: '0', color: 'bg-blue-500' },
          { label: 'Profile Views', value: '0', color: 'bg-green-500' },
          { label: 'Shortlisted', value: '0', color: 'bg-yellow-500' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.role, user?.profile?.savedJobs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex justify-center items-center">
        <div className="text-center">
          <div className="spinner-gradient w-16 h-16 mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse-slow">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-10 animate-fadeInUp">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {user?.role === 'recruiter' 
                  ? 'Manage your job postings and discover amazing talent'
                  : 'Find your dream job and track your application journey'
                }
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="stat-card glass rounded-2xl p-6 card-hover animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <div className="w-6 h-6 bg-white rounded-lg"></div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 floating">
                    {stat.value}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {stat.label}
                </div>
                <div className="mt-2 h-1 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full"></div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="glass rounded-2xl p-8 mb-10 animate-slideInLeft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Recent Activity</h3>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow"></div>
            </div>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No recent activity</p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-300"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {activity.type[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{activity.message}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="animate-fadeInUp">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {user?.role === 'recruiter' ? (
                <>
                  <div className="glass rounded-2xl p-8 text-center card-hover group">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Post New Job</h4>
                    <p className="text-gray-600 mb-6">Create a new job posting and find the perfect candidate</p>
                    <a
                      href="/post-job"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg btn-glow"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Post Job
                    </a>
                  </div>
                  
                  <div className="glass rounded-2xl p-8 text-center card-hover group">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Review Applications</h4>
                    <p className="text-gray-600 mb-6">Check out the latest applications from talented candidates</p>
                    <a
                      href="/applications"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg btn-glow"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Applications
                    </a>
                  </div>
                  
                  <div className="glass rounded-2xl p-8 text-center card-hover group">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0012.004 3c-4.907 0-8.996 3.896-8.996 8.865a8.937 8.937 0 003.746 7.288 1.1 1.1 0 01.424.923V21a1 1 0 001 1h6a1 1 0 001-1v-.924c0-.377.162-.735.424-.923A8.937 8.937 0 0021 13.255z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Manage Jobs</h4>
                    <p className="text-gray-600 mb-6">Edit or delete your existing job postings</p>
                    <a
                      href="/jobs"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg btn-glow"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0012.004 3c-4.907 0-8.996 3.896-8.996 8.865a8.937 8.937 0 003.746 7.288 1.1 1.1 0 01.424.923V21a1 1 0 001 1h6a1 1 0 001-1v-.924c0-.377.162-.735.424-.923A8.937 8.937 0 0021 13.255z" />
                      </svg>
                      Manage Jobs
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div className="glass rounded-2xl p-8 text-center card-hover group">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0012.004 3c-4.907 0-8.996 3.896-8.996 8.865a8.937 8.937 0 003.746 7.288 1.1 1.1 0 01.424.923V21a1 1 0 001 1h6a1 1 0 001-1v-.924c0-.377.162-.735.424-.923A8.937 8.937 0 0021 13.255z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Browse Jobs</h4>
                    <p className="text-gray-600 mb-6">Discover amazing opportunities that match your skills</p>
                    <a
                      href="/jobs"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg btn-glow"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0012.004 3c-4.907 0-8.996 3.896-8.996 8.865a8.937 8.937 0 003.746 7.288 1.1 1.1 0 01.424.923V21a1 1 0 001 1h6a1 1 0 001-1v-.924c0-.377.162-.735.424-.923A8.937 8.937 0 0021 13.255z" />
                      </svg>
                      Browse Jobs
                    </a>
                  </div>
                  
                  <div className="glass rounded-2xl p-8 text-center card-hover group">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Update Profile</h4>
                    <p className="text-gray-600 mb-6">Keep your profile fresh and attractive to recruiters</p>
                    <a
                      href="/profile"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg btn-glow"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Update Profile
                    </a>
                  </div>
                  
                  <div className="glass rounded-2xl p-8 text-center card-hover group">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">My Applications</h4>
                    <p className="text-gray-600 mb-6">Track the status of all your job applications</p>
                    <a
                      href="/applications"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg btn-glow"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Applications
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
