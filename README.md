# Employee Performance Management System

A comprehensive employee performance management tool with separate interfaces for managers and employees to assign, track, and manage tasks with timeline tracking and performance metrics.

## Features

### Manager Features

- **Dashboard Overview**: View statistics on total tasks, completed tasks, in-progress tasks, and employee count
- **Task Assignment**: Assign new tasks to employees with detailed information
- **Task Management**: View, edit, and delete tasks
- **Task Filtering**: Filter tasks by status, employee, project, and vertical
- **Employee Management**: View all employees and their active tasks
- **Task Details**: View detailed task information, add feedback, and mark tasks as complete
- **Performance Tracking**: Monitor employee performance and task completion rates

### Employee Features

- **Personal Dashboard**: View assigned tasks and personal statistics
- **Task Updates**: Update task status (Not Started, In Progress, Completed, Blocked)
- **Progress Notes**: Add progress notes to tasks with timestamps
- **Manager Feedback**: View feedback from managers
- **Deadline Alerts**: Get notified about upcoming deadlines
- **Task Filtering**: Filter tasks by status and project

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **State Management**: React Context API
- **Data Storage**: LocalStorage (for demo)

## Installation

### Prerequisites

- Node.js 18+ or yarn

### Setup Instructions

1. **Clone the repository**

   ```bash
   cd employee-performance-app
   ```

2. **Install dependencies**

   ```bash
   yarn install
   # or
   npm install
   ```

3. **Start development server**

   ```bash
   yarn dev
   # or
   npm run dev
   ```

4. **Build for production**

   ```bash
   yarn build
   # or
   npm run build
   ```

5. **Preview production build**
   ```bash
   yarn preview
   # or
   npm run preview
   ```

## Demo Accounts

The application comes with pre-loaded demo data for testing:

### Manager Account

- **Email**: manager@demo.com
- **Password**: manager123

### Employee Accounts

1. **Alice Developer**

   - **Email**: alice@demo.com
   - **Password**: employee123

2. **Bob Designer**

   - **Email**: bob@demo.com
   - **Password**: employee123

3. **Carol QA**
   - **Email**: carol@demo.com
   - **Password**: employee123

## Project Structure

```
employee-performance-app/
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   │   ├── Login.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── manager/           # Manager-specific components
│   │   │   ├── ManagerDashboard.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   ├── TasksTable.jsx
│   │   │   ├── AssignTaskModal.jsx
│   │   │   └── TaskDetailModal.jsx
│   │   ├── employee/          # Employee-specific components
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   ├── EmployeeTasksTable.jsx
│   │   │   └── EmployeeTaskDetailModal.jsx
│   │   └── common/            # Shared components
│   │       └── Header.jsx
│   ├── context/               # React Context
│   │   └── AuthContext.jsx
│   ├── hooks/                 # Custom hooks
│   │   └── useTasks.js
│   ├── utils/                 # Utility functions
│   │   ├── storage.js
│   │   └── helpers.js
│   ├── data/                  # Demo data
│   │   └── demoData.js
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── public/                   # Static assets
├── netlify.toml             # Netlify configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies and scripts
```

## Data Structure

### User Object

```javascript
{
  id: string,
  name: string,
  email: string,
  role: "manager" | "employee",
  department: string,
  avatar: string | null,
  createdAt: string
}
```

### Task Object

```javascript
{
  id: string,
  vertical: string,
  project: string,
  taskName: string,
  taskDescription: string,
  assignedTo: string,
  assignedBy: string,
  poc: string,
  dateOfAssignment: string,
  deadline: string,
  timeline: string,
  status: "not_started" | "in_progress" | "completed" | "overdue" | "blocked",
  priority: "high" | "medium" | "low",
  progressNotes: Array,
  attachments: Array,
  completedDate: string | null,
  managerFeedback: string | null,
  createdAt: string,
  updatedAt: string
}
```

## Deployment

### Deploy to Netlify

1. **Create a Netlify account** at [netlify.com](https://netlify.com)

2. **Connect your repository**

   - Click "New site from Git"
   - Choose your Git provider (GitHub, GitLab, Bitbucket)
   - Select your repository

3. **Configure build settings**

   - Build command: `yarn build` or `npm run build`
   - Publish directory: `dist`
   - The `netlify.toml` file is already configured

4. **Deploy**
   - Click "Deploy site"
   - Your site will be live in a few minutes

### Environment Variables

No environment variables are required for the demo version using LocalStorage.

For production with a backend, you would add:

- `VITE_API_URL`: Your backend API URL
- `VITE_AUTH_DOMAIN`: Your authentication domain

## Features Roadmap

### Phase 2 (Future Enhancements)

- [ ] Timeline/Gantt chart view
- [ ] File attachments for tasks
- [ ] Email notifications
- [ ] Search functionality
- [ ] Export reports (PDF/Excel)
- [ ] Real-time updates with WebSockets

### Phase 3 (Advanced Features)

- [ ] Mobile responsive optimization
- [ ] Dark mode
- [ ] Activity logs
- [ ] Task dependencies
- [ ] Recurring tasks
- [ ] Team collaboration features
- [ ] Advanced analytics and reporting

## Performance Analytics System

Our analytics system provides comprehensive performance measurement across multiple levels:

### Individual Performance Metrics

1. **Task Completion Metrics**

   - Completion Rate: Percentage of assigned tasks completed
   - On-Time Delivery Rate: Percentage of tasks completed before deadline
   - Average Completion Time: Mean time taken to complete tasks
   - Blocked Tasks Count: Number of tasks currently blocked

2. **Quality Metrics**

   - Quality Score (0-100): Based on manager feedback and revision requests
   - First-Time-Right Rate: Tasks accepted without revision
   - Rework Rate: Percentage of tasks requiring revision

3. **Productivity Metrics**
   - Productivity Score (0-100): Composite score based on:
     - Task completion velocity
     - Complexity of completed tasks
     - Consistency in delivery
     - Volume of work handled
   - Workload Score: Current workload assessment
   - Task Throughput: Tasks completed per time period

### Performance Grading System

Performance is graded on an A+ to F scale based on combined metrics:

- **A+ (95-100)**: Exceptional Performance
  - Consistently exceeds expectations
  - High productivity and quality scores
  - Excellent time management
- **A (85-94)**: Excellent Performance

  - Above-average completion rates
  - Strong quality metrics
  - Good productivity scores

- **B (75-84)**: Good Performance

  - Meets all expectations
  - Acceptable quality scores
  - Steady productivity

- **C (65-74)**: Average Performance

  - Meets basic requirements
  - Some areas need improvement
  - Inconsistent productivity

- **D (55-64)**: Below Average

  - Multiple areas need improvement
  - Quality concerns
  - Low productivity scores

- **F (Below 55)**: Unsatisfactory
  - Significant improvement needed
  - Major performance concerns
  - Critical intervention required

### Project-Level Analytics

1. **Project Health Indicators**

   - Overall project completion rate
   - Team velocity
   - Blocked tasks ratio
   - Risk assessment based on deadlines

2. **Resource Allocation**
   - Team workload distribution
   - Skill utilization
   - Capacity planning metrics

### Team Analytics

1. **Team Performance**

   - Collective productivity score
   - Team velocity trends
   - Collaboration metrics
   - Inter-team dependencies

2. **Comparative Analysis**
   - Team benchmarking
   - Department-wise performance
   - Historical trends

### Reporting and Insights

1. **Automated Insights**

   - Performance trends
   - Improvement recommendations
   - Risk alerts
   - Achievement recognition

2. **Custom Reports**
   - Date range selection
   - Multiple export formats
   - Metric customization
   - Visualization options

### Data Collection Methods

1. **Quantitative Data**

   - Task completion timestamps
   - Timeline adherence
   - Volume metrics
   - System interactions

2. **Qualitative Data**
   - Manager feedback
   - Peer reviews
   - Self-assessments
   - Quality checks

### Analytical Tools

1. **Visualization**

   - Performance trend charts
   - Distribution graphs
   - Radar charts for skills
   - Workload heat maps

2. **Predictive Analytics**
   - Performance forecasting
   - Risk prediction
   - Capacity planning
   - Trend analysis

### Privacy and Ethics

- Data collection transparency
- Metric calculation fairness
- Regular calibration
- Appeal process
- Data access controls
- Ethical use guidelines

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue in the GitHub repository.

## Acknowledgments

- Built with React and Vite
- Styled with Tailwind CSS
- Icons from Lucide React
- Date utilities from date-fns
