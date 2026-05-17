# Phoenix Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Database Architecture](#database-architecture)
6. [Component Structure](#component-structure)
7. [Data Flow](#data-flow)
8. [API Endpoints](#api-endpoints)
9. [Authentication & Authorization](#authentication--authorization)
10. [Deployment Architecture](#deployment-architecture)

---

## System Overview

Phoenix is a multi-tier web application designed for managing employee goals, performance tracking, and organizational analytics. The system follows a client-server architecture with a React-based frontend, Node.js backend, and SQLite database.

### Key Characteristics
- **Scalable**: Modular component-based design
- **Type-Safe**: Full TypeScript implementation
- **Real-Time**: Support for live updates and notifications
- **Responsive**: Mobile-friendly UI with Tailwind CSS
- **Maintainable**: Clear separation of concerns and organized file structure

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Frontend)                  │
│  React + TypeScript + Vite + Tailwind CSS + Shadcn UI       │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ HTTP/HTTPS (REST API)
               │
┌──────────────▼──────────────────────────────────────────────┐
│                    API Layer (Backend)                       │
│         Node.js Express Server (index.js)                    │
├──────────────────────────────────────────────────────────────┤
│  • Goal Management      • Check-in Processing                │
│  • User Authentication  • Analytics Computation              │
│  • Escalation Engine    • Audit Logging                      │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ SQL Queries
               │
┌──────────────▼──────────────────────────────────────────────┐
│                  Data Layer (Database)                       │
│              SQLite (phoenix.sqlite)                         │
├──────────────────────────────────────────────────────────────┤
│  • Users & Roles       • Goals & Targets                     │
│  • Check-ins           • Escalations                         │
│  • Audit Logs          • Analytics Data                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Directory Structure
```
src/
├── main.tsx                          # Application entry point
├── app/
│   ├── App.tsx                       # Root component
│   ├── routes.tsx                    # Route definitions
│   ├── types.ts                      # Shared TypeScript types
│   ├── components/
│   │   ├── common/                   # Reusable components
│   │   │   ├── DonutRing.tsx
│   │   │   ├── GoalCard.tsx
│   │   │   ├── KPICard.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── SharedKpiForm.tsx
│   │   │   └── StatusPill.tsx
│   │   ├── employee/                 # Employee-specific components
│   │   │   └── CreateGoalDrawer.tsx
│   │   ├── figma/                    # Figma integration components
│   │   │   └── ImageWithFallback.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── ContextPanel.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopNavbar.tsx
│   │   └── ui/                       # Shadcn UI components library
│   │       ├── accordion.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── form.tsx
│   │       ├── table.tsx
│   │       └── ... (other UI components)
│   ├── context/                      # React Context for state management
│   │   ├── AuthContext.tsx           # Authentication state
│   │   └── DataContext.tsx           # Global data state
│   ├── layouts/
│   │   └── RootLayout.tsx            # Root layout wrapper
│   ├── pages/                        # Page components
│   │   ├── admin/                    # Admin dashboard pages
│   │   ├── auth/                     # Authentication pages
│   │   ├── employee/                 # Employee pages
│   │   └── manager/                  # Manager pages
│   └── utils/                        # Utility functions
│       ├── cycleSchedule.ts
│       ├── governanceAnalytics.ts
│       └── progressScore.ts
├── styles/                           # Global styles
│   ├── fonts.css
│   ├── globals.css
│   ├── index.css
│   ├── tailwind.css
│   └── theme.css
```

### Key Frontend Components

#### Page Structure
- **Employee Pages**: Goal creation, achievement tracking, quarterly check-ins
- **Manager Pages**: Goal approval, team check-ins, team dashboard
- **Admin Pages**: Cycle management, org hierarchy, escalations, audit logs, reports
- **Auth Pages**: Login and authentication

#### Context Management
- **AuthContext**: Manages user authentication state, roles, and permissions
- **DataContext**: Manages application-wide data state (goals, users, cycles)

#### UI Component Library
- Shadcn UI components for consistent design
- Custom components for domain-specific features
- Tailwind CSS for styling

### Technology Stack
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Library**: Shadcn UI
- **State Management**: React Context API
- **Form Handling**: React Hook Form

---

## Backend Architecture

### Directory Structure
```
server/
├── index.js              # Main server entry point
├── phase1.test.js        # Test suite for Phase 1
└── data/                 # Data storage
    ├── phoenix.sqlite
    ├── phoenix.sqlite-shm
    └── phoenix.sqlite-wal
```

### Server Components

#### Main Server (index.js)
- Express.js REST API server
- Request routing and handling
- Authentication middleware
- Error handling
- CORS configuration

### Key Backend Modules

#### 1. Goal Management
- Create, read, update, delete goals
- Goal validation (weightage, maximum count)
- Goal locking/unlocking mechanisms
- Shared goals distribution

#### 2. User Management
- User authentication and authorization
- Role-based access control (RBAC)
- User profile management
- Org hierarchy management

#### 3. Cycle Management
- Create and manage performance cycles
- Define cycle windows (Q1, Q2, Q3, Q4)
- Track cycle status
- Enforce cycle timelines

#### 4. Check-in Processing
- Record quarterly check-ins
- Calculate progress scores based on UoM types
- Validate achievement data
- Track check-in completion rates

#### 5. Escalation Engine
- Monitor deadline compliance
- Trigger escalation rules
- Track escalation states
- Generate notifications

#### 6. Analytics Engine
- Compute goal achievement metrics
- Generate QoQ trend analysis
- Calculate manager effectiveness scores
- Prepare heatmap data

#### 7. Audit Logging
- Log all changes to goals post-lock
- Record user actions with timestamp
- Track change history for compliance

### API Architecture

#### Request/Response Flow
1. Client sends HTTP request with authentication token
2. Backend validates authentication and authorization
3. Request routed to appropriate handler
4. Business logic executed with database operations
5. Response formatted and returned to client

#### Error Handling
- Standardized error response format
- HTTP status codes for different error types
- Detailed error logging for debugging

---

## Database Architecture

### Database Technology
- **Type**: SQLite (Relational)
- **Files**:
  - `phoenix.sqlite` - Main database file
  - `phoenix.sqlite-shm` - Shared memory file (Write-Ahead Logging)
  - `phoenix.sqlite-wal` - Write-Ahead Logging file

### Core Tables (Conceptual)

#### Users
```sql
users (
  user_id,
  username,
  email,
  password_hash,
  role,
  department,
  manager_id,
  created_at,
  updated_at
)
```

#### Cycles
```sql
cycles (
  cycle_id,
  cycle_name,
  start_date,
  end_date,
  q1_window,
  q2_window,
  q3_window,
  q4_window,
  status,
  created_at
)
```

#### Goals
```sql
goals (
  goal_id,
  user_id,
  cycle_id,
  thrust_area,
  title,
  description,
  uom_type,
  target_value,
  weightage,
  status,
  created_at,
  submitted_at,
  approved_at,
  approved_by,
  locked
)
```

#### Check-ins
```sql
check_ins (
  check_in_id,
  goal_id,
  quarter,
  actual_achievement,
  progress_score,
  status,
  manager_comment,
  submitted_at,
  reviewed_at
)
```

#### Escalations
```sql
escalations (
  escalation_id,
  user_id,
  trigger_type,
  cycle_id,
  escalation_level,
  status,
  created_at,
  resolved_at,
  resolution_notes
)
```

#### Audit Logs
```sql
audit_logs (
  log_id,
  user_id,
  goal_id,
  action_type,
  old_value,
  new_value,
  timestamp,
  ip_address
)
```

---

## Component Structure

### Common Components
- **DonutRing**: Displays goal achievement as a donut chart
- **GoalCard**: Displays individual goal information
- **KPICard**: Displays KPI metrics and achievements
- **PageHeader**: Page title and action buttons
- **ProgressBar**: Visual progress indicator
- **SharedKpiForm**: Form for managing shared goals
- **StatusPill**: Status badge/label

### Layout Components
- **Sidebar**: Navigation sidebar
- **TopNavbar**: Top navigation bar
- **ContextPanel**: Side panel for additional context
- **RootLayout**: Main layout wrapper

### Page Components
- **Employee Dashboard**: Overview of personal goals
- **Manager Dashboard**: Team goals and check-ins
- **Admin Dashboard**: System-wide analytics and controls

---

## Data Flow

### Goal Creation Flow
```
Employee → Create Goal Form → Validation → Database Store → Manager Queue
```

### Approval Flow
```
Manager → Review Goals → Inline Edit → Approve/Reject → Lock Goals → Complete
```

### Check-in Flow
```
Employee → Enter Achievement → Manager Review → Calculate Score → Store Result
```

### Escalation Flow
```
Cycle Deadline → Check Compliance → Trigger Rule → Generate Notification → Escalate
```

### Analytics Flow
```
Completed Check-ins → Process Data → Calculate Metrics → Generate Reports → Dashboard
```

---

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh token

### Goals
- `GET /goals` - Fetch user goals
- `POST /goals` - Create new goal
- `PUT /goals/:id` - Update goal
- `DELETE /goals/:id` - Delete goal
- `POST /goals/:id/submit` - Submit goal for approval
- `POST /goals/:id/approve` - Approve goal (Manager)
- `POST /goals/:id/reject` - Reject goal (Manager)

### Check-ins
- `GET /check-ins/:cycle` - Fetch check-ins for cycle
- `POST /check-ins` - Create check-in entry
- `PUT /check-ins/:id` - Update check-in
- `POST /check-ins/:id/submit` - Submit check-in

### Cycles
- `GET /cycles` - Fetch all cycles
- `POST /cycles` - Create new cycle (Admin)
- `PUT /cycles/:id` - Update cycle (Admin)

### Users
- `GET /users/:id` - Fetch user profile
- `GET /users/team/:managerId` - Fetch team members
- `PUT /users/:id` - Update user profile

### Analytics
- `GET /analytics/qoq` - Quarter-on-quarter analysis
- `GET /analytics/manager-effectiveness` - Manager performance metrics
- `GET /analytics/heatmap` - Completion rate heatmap
- `GET /reports/achievement` - Achievement report (CSV/Excel)

### Escalations
- `GET /escalations` - Fetch escalation logs (Admin)
- `PUT /escalations/:id` - Update escalation status (Admin)

### Audit
- `GET /audit-logs` - Fetch audit logs (Admin)
- `GET /audit-logs/goal/:goalId` - Fetch goal change history

---

## Authentication & Authorization

### Authentication Flow
1. User submits credentials via login form
2. Backend validates credentials against database
3. JWT token generated on successful authentication
4. Token stored in client-side storage (secure)
5. Token sent with each subsequent request in Authorization header

### Authorization Flow
1. Check if user is authenticated (token validation)
2. Verify user role against required permissions
3. Check data access permissions (user owns data or manager)
4. Allow or deny action based on authorization rules

### Role-Based Access Control (RBAC)
- **Employee**: Can only access own goals and check-ins
- **Manager**: Can access own and direct reports' goals and check-ins
- **Admin**: Full system access

---

## Deployment Architecture

### Development Environment
```
Local Machine
├── Frontend: npm run dev (Vite dev server)
├── Backend: npm start (Node.js server)
└── Database: SQLite (local file)
```

### Production Environment
```
├── Frontend Hosting
│   ├── Build: npm run build (Vite production build)
│   ├── Deployment: Static hosting (CDN)
│   └── Optimization: Gzip compression, caching
│
├── Backend Hosting
│   ├── Server: Node.js on cloud platform
│   ├── Process Manager: PM2 or similar
│   └── Load Balancer: Nginx or cloud provider
│
└── Database
    ├── Type: SQLite or PostgreSQL (migration possible)
    ├── Backup: Automated daily backups
    └── Replication: Master-slave setup for HA
```

### Configuration Management
- **Environment Variables**: .env file for configuration
- **Database Connection**: Connection string in environment
- **API Keys**: Stored securely in environment variables

### Monitoring & Logging
- **Frontend**: Error tracking (Sentry/LogRocket)
- **Backend**: Application logging (Winston/Pino)
- **Database**: Query performance monitoring
- **Infrastructure**: Server health monitoring

---

## Performance Considerations

### Frontend Optimization
- Code splitting by route
- Lazy loading of components
- Image optimization
- CSS-in-JS optimization

### Backend Optimization
- Database indexing on frequently queried columns
- Query optimization and caching
- API response caching
- Batch processing for large data

### Database Optimization
- Index creation for foreign keys
- Partitioning for large tables
- Query execution plan analysis
- Connection pooling

---

## Security Considerations

### Data Security
- Password hashing (bcrypt)
- Encrypted data transmission (HTTPS/TLS)
- Input validation and sanitization
- SQL injection prevention (parameterized queries)

### Access Control
- Role-based access control
- Row-level security
- API rate limiting
- CORS configuration

### Audit & Compliance
- Comprehensive audit logging
- Change tracking
- Data retention policies
- Compliance reporting

---

## Scalability Considerations

### Horizontal Scaling
- Stateless backend design
- Database replication
- Load balancing
- Caching layer (Redis)

### Vertical Scaling
- Database optimization
- Query caching
- Connection pooling
- Memory optimization

---

## Future Architecture Improvements

1. **Microservices Migration**: Separate concerns into independent services
2. **Event-Driven Architecture**: Implement event streaming for real-time updates
3. **GraphQL API**: Migration from REST to GraphQL for flexible queries
4. **Caching Layer**: Implement Redis for performance improvement
5. **Message Queue**: Implement job queue for async processing
6. **Containerization**: Docker containers for deployment
7. **Kubernetes Orchestration**: Container orchestration for scaling
