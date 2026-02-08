# Job Portal

A comprehensive job portal application built with the MERN stack (MongoDB, Express.js, React, Node.js) that connects recruiters with talented candidates.

## Features

### For Recruiters
- **Registration & Login**: Secure authentication system
- **Dashboard**: Overview of job postings and applications
- **Job Management**: Post, edit, and delete job listings
- **Application Review**: View and manage candidate applications
- **Profile Management**: Update company and personal information

### For Candidates
- **Registration & Login**: Create profile and apply for jobs
- **Job Search**: Browse and filter job listings
- **Job Applications**: Apply to multiple jobs with cover letters
- **Application Tracking**: Monitor application status
- **Profile Management**: Update skills, experience, and preferences

### Technical Features
- **Role-based Authentication**: Separate access for recruiters and candidates
- **Modern UI**: Responsive design with Tailwind CSS
- **RESTful API**: Well-structured backend with Express.js
- **Database**: MongoDB for data persistence
- **Real-time Updates**: Application status tracking

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd job-portal
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Install Tailwind CSS**
   ```bash
   cd client
   npm install -D tailwindcss
   npx tailwindcss init -p
   cd ..
   ```

5. **Environment Setup**
   - Create a `.env` file in the `server` directory
   - Add the following environment variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/job-portal
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

6. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017/job-portal`

7. **Run the application**
   ```bash
   # Start both server and client concurrently
   npm run dev
   
   # Or start them separately
   npm run server  # Starts backend on port 5000
   npm run client  # Starts frontend on port 3000
   ```

## Usage

### Registration
1. Visit `http://localhost:3000/register`
2. Choose your role (Recruiter or Candidate)
3. Fill in your details and create an account

### For Recruiters
1. **Post a Job**: Navigate to "Post Job" and fill in job details
2. **Review Applications**: Go to "Applications" to view candidate submissions
3. **Manage Applications**: Update application status (pending, reviewing, shortlisted, rejected, accepted)

### For Candidates
1. **Browse Jobs**: Use the Jobs page to find opportunities
2. **Apply**: Click on a job to view details and submit an application
3. **Track Applications**: Monitor your application status in the Applications section

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs with filters
- `GET /api/jobs/:id` - Get specific job
- `POST /api/jobs` - Create new job (recruiter only)
- `PUT /api/jobs/:id` - Update job (recruiter only)
- `DELETE /api/jobs/:id` - Delete job (recruiter only)

### Applications
- `POST /api/applications` - Apply for job (candidate only)
- `GET /api/applications/my-applications` - Get user's applications (candidate only)
- `GET /api/applications/job/:jobId` - Get applications for a job (recruiter only)
- `PUT /api/applications/:id/status` - Update application status (recruiter only)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Technology Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Project Structure

```
job-portal/
├── server/
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   └── index.js         # Server entry point
├── client/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context
│   │   ├── pages/       # Page components
│   │   └── App.js       # Main app component
│   └── public/
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Future Enhancements

- Email notifications for application updates
- Advanced search with AI-powered recommendations
- In-app messaging between recruiters and candidates
- File upload for resumes and portfolios
- Company profiles and reviews
- Salary insights and market data
- Mobile application
