import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    salaryMin: '',
    salaryMax: '',
    location: '',
    jobType: 'full-time',
    experienceLevel: 'entry-level',
    skills: '',
    companyName: '',
    companyWebsite: '',
    companyDescription: '',
    applicationDeadline: ''
  });

  const handleChange = (e) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value
    });
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...jobData.requirements];
    newRequirements[index] = value;
    setJobData({ ...jobData, requirements: newRequirements });
  };

  const addRequirement = () => {
    setJobData({ ...jobData, requirements: [...jobData.requirements, ''] });
  };

  const removeRequirement = (index) => {
    const newRequirements = jobData.requirements.filter((_, i) => i !== index);
    setJobData({ ...jobData, requirements: newRequirements });
  };

  const handleResponsibilityChange = (index, value) => {
    const newResponsibilities = [...jobData.responsibilities];
    newResponsibilities[index] = value;
    setJobData({ ...jobData, responsibilities: newResponsibilities });
  };

  const addResponsibility = () => {
    setJobData({ ...jobData, responsibilities: [...jobData.responsibilities, ''] });
  };

  const removeResponsibility = (index) => {
    const newResponsibilities = jobData.responsibilities.filter((_, i) => i !== index);
    setJobData({ ...jobData, responsibilities: newResponsibilities });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formattedJobData = {
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements.filter(req => req.trim() !== ''),
        responsibilities: jobData.responsibilities.filter(resp => resp.trim() !== ''),
        salary: {
          min: jobData.salaryMin ? parseInt(jobData.salaryMin) : undefined,
          max: jobData.salaryMax ? parseInt(jobData.salaryMax) : undefined
        },
        location: jobData.location,
        jobType: jobData.jobType,
        experienceLevel: jobData.experienceLevel,
        skills: jobData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
        company: {
          name: jobData.companyName,
          website: jobData.companyWebsite,
          description: jobData.companyDescription
        },
        applicationDeadline: jobData.applicationDeadline || undefined
      };

      await axios.post('http://localhost:5000/api/jobs', formattedJobData);
      setMessage('Job posted successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Error posting job:', error);
      setMessage(error.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'recruiter') {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only recruiters can post jobs.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
            <p className="mt-2 text-gray-600">Create a new job posting to attract qualified candidates</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Job Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={jobData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={jobData.location}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Job Type *
                  </label>
                  <select
                    name="jobType"
                    value={jobData.jobType}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Experience Level *
                  </label>
                  <select
                    name="experienceLevel"
                    value={jobData.experienceLevel}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="entry-level">Entry Level</option>
                    <option value="mid-level">Mid Level</option>
                    <option value="senior-level">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Salary
                  </label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={jobData.salaryMin}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Maximum Salary
                  </label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={jobData.salaryMax}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={jobData.applicationDeadline}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  rows={6}
                  value={jobData.description}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Skills (comma-separated) *
                </label>
                <input
                  type="text"
                  name="skills"
                  value={jobData.skills}
                  onChange={handleChange}
                  required
                  placeholder="React, Node.js, JavaScript, etc."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Requirements</h2>
              
              {jobData.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    placeholder="Enter a requirement"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {jobData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addRequirement}
                className="mt-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
              >
                Add Requirement
              </button>
            </div>

            {/* Responsibilities */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Responsibilities</h2>
              
              {jobData.responsibilities.map((responsibility, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={responsibility}
                    onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                    placeholder="Enter a responsibility"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {jobData.responsibilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeResponsibility(index)}
                      className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addResponsibility}
                className="mt-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
              >
                Add Responsibility
              </button>
            </div>

            {/* Company Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Company Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={jobData.companyName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company Website
                  </label>
                  <input
                    type="url"
                    name="companyWebsite"
                    value={jobData.companyWebsite}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Company Description
                </label>
                <textarea
                  name="companyDescription"
                  rows={4}
                  value={jobData.companyDescription}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Posting Job...' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
