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
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-2 text-gray-600">
              {user?.role === 'recruiter' 
                ? 'Manage your job postings and review applications'
                : 'Find your dream job and track your applications'
              }
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                      <div className="w-6 h-6 bg-white rounded"></div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.label}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stat.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentActivity.map((activity) => (
                    <li key={activity.id} className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {activity.type[0].toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.message}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {user?.role === 'recruiter' ? (
                <>
                  <div className="bg-white p-6 rounded-lg shadow text-center">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Post New Job</h4>
                    <p className="text-gray-600 mb-4">Create a new job posting</p>
                    <a
                      href="/post-job"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Post Job
                    </a>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow text-center">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">View Applications</h4>
                    <p className="text-gray-600 mb-4">Review candidate applications</p>
                    <a
                      href="/applications"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      View Applications
                    </a>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow text-center">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Manage Jobs</h4>
                    <p className="text-gray-600 mb-4">Edit or delete job postings</p>
                    <a
                      href="/jobs"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                    >
                      Manage Jobs
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white p-6 rounded-lg shadow text-center">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Browse Jobs</h4>
                    <p className="text-gray-600 mb-4">Find your next opportunity</p>
                    <a
                      href="/jobs"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Browse Jobs
                    </a>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow text-center">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Update Profile</h4>
                    <p className="text-gray-600 mb-4">Keep your profile up to date</p>
                    <a
                      href="/profile"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      Update Profile
                    </a>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow text-center">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">My Applications</h4>
                    <p className="text-gray-600 mb-4">Track your job applications</p>
                    <a
                      href="/applications"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                    >
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
