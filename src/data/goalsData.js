// Demo Goals & OKR Data

export const demoGoals = [
  {
    id: 'goal-1',
    title: 'Improve Customer Satisfaction Score',
    description: 'Increase overall customer satisfaction rating from 4.2 to 4.8 stars',
    type: 'objective', // objective or key_result
    category: 'company',
    specificCategory: 'customer_success',
    owner: '0', // admin
    assignedTo: [],
    level: 'company', // company, team, individual
    cycle: 'Q4-2025',
    startDate: '2024-10-01',
    dueDate: '2024-12-31',
    status: 'in_progress',
    progress: 65,
    priority: 'high',
    isPublic: true,
    keyResults: ['goal-2', 'goal-3', 'goal-4'],
    parentGoal: null,
    tags: ['customer-experience', 'quality'],
    checkIns: [
      {
        id: 'checkin-1',
        date: '2024-10-15',
        progress: 45,
        notes: 'Implemented new feedback system',
        createdBy: '0'
      },
      {
        id: 'checkin-2',
        date: '2024-11-01',
        progress: 65,
        notes: 'Positive feedback increasing',
        createdBy: '0'
      }
    ],
    metrics: {
      target: 4.8,
      current: 4.5,
      unit: 'stars',
      baseline: 4.2
    }
  },
  {
    id: 'goal-2',
    title: 'Reduce Response Time to Under 2 Hours',
    description: 'Achieve average customer support response time of under 2 hours',
    type: 'key_result',
    category: 'team',
    specificCategory: 'customer_success',
    owner: '1', // manager
    assignedTo: ['2', '3'],
    level: 'team',
    cycle: 'Q4-2025',
    startDate: '2024-10-01',
    dueDate: '2024-12-31',
    status: 'in_progress',
    progress: 75,
    priority: 'high',
    isPublic: true,
    keyResults: [],
    parentGoal: 'goal-1',
    tags: ['support', 'efficiency'],
    checkIns: [],
    metrics: {
      target: 2,
      current: 2.5,
      unit: 'hours',
      baseline: 4.5
    }
  },
  {
    id: 'goal-3',
    title: 'Increase NPS Score by 15 Points',
    description: 'Improve Net Promoter Score from 35 to 50',
    type: 'key_result',
    category: 'team',
    specificCategory: 'customer_success',
    owner: '1',
    assignedTo: ['2', '3', '4'],
    level: 'team',
    cycle: 'Q4-2025',
    startDate: '2024-10-01',
    dueDate: '2024-12-31',
    status: 'in_progress',
    progress: 60,
    priority: 'high',
    isPublic: true,
    keyResults: [],
    parentGoal: 'goal-1',
    tags: ['nps', 'customer-loyalty'],
    checkIns: [],
    metrics: {
      target: 50,
      current: 44,
      unit: 'points',
      baseline: 35
    }
  },
  {
    id: 'goal-4',
    title: 'Achieve 95% First Contact Resolution',
    description: 'Resolve 95% of customer issues in first contact',
    type: 'key_result',
    category: 'team',
    specificCategory: 'customer_success',
    owner: '1',
    assignedTo: ['2', '3'],
    level: 'team',
    cycle: 'Q4-2025',
    startDate: '2024-10-01',
    dueDate: '2024-12-31',
    status: 'on_track',
    progress: 85,
    priority: 'medium',
    isPublic: true,
    keyResults: [],
    parentGoal: 'goal-1',
    tags: ['efficiency', 'quality'],
    checkIns: [],
    metrics: {
      target: 95,
      current: 90,
      unit: 'percent',
      baseline: 78
    }
  },
  {
    id: 'goal-5',
    title: 'Launch 3 New Product Features',
    description: 'Successfully launch and deploy 3 major product features with high user adoption',
    type: 'objective',
    category: 'company',
    specificCategory: 'product_development',
    owner: '0',
    assignedTo: [],
    level: 'company',
    cycle: 'Q4-2025',
    startDate: '2024-10-01',
    dueDate: '2024-12-31',
    status: 'in_progress',
    progress: 40,
    priority: 'high',
    isPublic: true,
    keyResults: ['goal-6', 'goal-7'],
    parentGoal: null,
    tags: ['product', 'innovation'],
    checkIns: [],
    metrics: {
      target: 3,
      current: 1,
      unit: 'features',
      baseline: 0
    }
  },
  {
    id: 'goal-6',
    title: 'Achieve 80% Feature Adoption Rate',
    description: 'Get 80% of active users to adopt new features within 30 days',
    type: 'key_result',
    category: 'team',
    specificCategory: 'product_development',
    owner: '1',
    assignedTo: ['2', '4', '5'],
    level: 'team',
    cycle: 'Q4-2025',
    startDate: '2024-10-01',
    dueDate: '2024-12-31',
    status: 'in_progress',
    progress: 55,
    priority: 'high',
    isPublic: true,
    keyResults: [],
    parentGoal: 'goal-5',
    tags: ['adoption', 'engagement'],
    checkIns: [],
    metrics: {
      target: 80,
      current: 65,
      unit: 'percent',
      baseline: 45
    }
  },
  {
    id: 'goal-7',
    title: 'Maintain 98% Feature Uptime',
    description: 'Ensure all new features maintain 98% uptime',
    type: 'key_result',
    category: 'team',
    specificCategory: 'product_development',
    owner: '1',
    assignedTo: ['5', '6'],
    level: 'team',
    cycle: 'Q4-2025',
    startDate: '2024-10-01',
    dueDate: '2024-12-31',
    status: 'on_track',
    progress: 95,
    priority: 'critical',
    isPublic: true,
    keyResults: [],
    parentGoal: 'goal-5',
    tags: ['reliability', 'infrastructure'],
    checkIns: [],
    metrics: {
      target: 98,
      current: 97.8,
      unit: 'percent',
      baseline: 95
    }
  },
  {
    id: 'goal-8',
    title: 'Complete Advanced React Training',
    description: 'Master React advanced patterns and best practices',
    type: 'objective',
    category: 'individual',
    specificCategory: 'professional_development',
    owner: '2',
    assignedTo: ['2'],
    level: 'individual',
    cycle: 'Q4-2025',
    startDate: '2024-10-01',
    dueDate: '2024-12-31',
    status: 'in_progress',
    progress: 60,
    priority: 'medium',
    isPublic: false,
    keyResults: ['goal-9', 'goal-10'],
    parentGoal: null,
    tags: ['learning', 'react', 'skill-building'],
    checkIns: [],
    metrics: {
      target: 100,
      current: 60,
      unit: 'percent',
      baseline: 0
    }
  },
  {
    id: 'goal-9',
    title: 'Complete 5 React Courses',
    description: 'Finish 5 advanced React courses on Udemy/Coursera',
    type: 'key_result',
    category: 'individual',
    specificCategory: 'professional_development',
    owner: '2',
    assignedTo: ['2'],
    level: 'individual',
    cycle: 'Q4-2025',
    startDate: '2024-10-01',
    dueDate: '2024-12-31',
    status: 'in_progress',
    progress: 60,
    priority: 'medium',
    isPublic: false,
    keyResults: [],
    parentGoal: 'goal-8',
    tags: ['courses', 'learning'],
    checkIns: [],
    metrics: {
      target: 5,
      current: 3,
      unit: 'courses',
      baseline: 0
    }
  },
  {
    id: 'goal-10',
    title: 'Build 2 React Projects',
    description: 'Create 2 production-ready React applications',
    type: 'key_result',
    category: 'individual',
    specificCategory: 'professional_development',
    owner: '2',
    assignedTo: ['2'],
    level: 'individual',
    cycle: 'Q4-2025',
    startDate: '2024-10-01',
    dueDate: '2024-12-31',
    status: 'in_progress',
    progress: 50,
    priority: 'medium',
    isPublic: false,
    keyResults: [],
    parentGoal: 'goal-8',
    tags: ['projects', 'hands-on'],
    checkIns: [],
    metrics: {
      target: 2,
      current: 1,
      unit: 'projects',
      baseline: 0
    }
  }
];

export const goalCategories = [
  { value: 'customer_success', label: 'Customer Success', color: '#10b981' },
  { value: 'product_development', label: 'Product Development', color: '#3b82f6' },
  { value: 'professional_development', label: 'Professional Development', color: '#8b5cf6' },
  { value: 'revenue_growth', label: 'Revenue Growth', color: '#f59e0b' },
  { value: 'operational_excellence', label: 'Operational Excellence', color: '#ef4444' },
  { value: 'team_building', label: 'Team Building', color: '#ec4899' }
];

export const goalCycles = [
  { value: 'Q4-2025', label: 'Q4 2025 (Oct-Dec 2025)', active: true },
  { value: 'Q1-2026', label: 'Q1 2026 (Jan-Mar 2026)', active: false },
  { value: 'Q2-2026', label: 'Q2 2026 (Apr-Jun 2026)', active: false },
  { value: 'Annual-2025', label: 'Annual 2025', active: true }
];

export const initializeGoalsData = () => {
  const existingGoals = localStorage.getItem('goals');
  if (!existingGoals) {
    localStorage.setItem('goals', JSON.stringify(demoGoals));
  }
};
