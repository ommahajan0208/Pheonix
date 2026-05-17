# Phoenix - Goal Management & Performance Tracking System

## Overview
Phoenix is a comprehensive goal management and performance tracking system designed to manage employee goals, quarterly check-ins, and performance analytics across organizational hierarchies. The system supports goal creation, manager approval workflows, achievement tracking, and detailed governance reporting.

## Table of Contents
1. [Phase 1 - Goal Creation & Approval](#phase-1--goal-creation--approval-must-have)
2. [Phase 2 - Achievement Tracking & Quarterly Check-ins](#phase-2--achievement-tracking--quarterly-check-ins-must-have)
3. [Check-in Schedule](#check-in-schedule)
4. [User Roles & Personas](#user-roles--personas)
5. [Escalation Module](#escalation-module-rule-based)
6. [Analytics Module](#analytics-module)
7. [Reporting & Governance Requirements](#reporting--governance-requirements)
8. [Getting Started & User Guide](#getting-started)
9. [Technology Stack](#technology-stack)

---

## Phase 1 — Goal Creation & Approval (Must-Have)

### Employee Goal Creation Interface
- **Thrust Area Selection**: Employees select a relevant Thrust Area for each goal
- **Goal Definition**: Provide Goal Title and comprehensive Description
- **Unit of Measurement (UoM)**: Choose from:
  - **Numeric**: Absolute numerical targets (e.g., 100 units)
  - **Percentage**: Percentage-based targets (e.g., 85%)
  - **Timeline**: Date-based completion targets
  - **Zero-based**: Success criteria where zero is the target (e.g., zero incidents)
- **Target & Weightage Assignment**: Define specific targets and assign weightage percentage to each goal

### System-Enforced Validation Rules
- **Total Weightage**: Across all goals must equal **100%** exactly
- **Minimum Weightage**: Each individual goal must have at least **10%** weightage
- **Maximum Goals**: Employees can create a maximum of **8 goals** per cycle

### Manager (L1) Approval Workflow
- **Review Submitted Goals**: Managers can review all employee goal submissions
- **Inline Editing Capability**: Edit targets and weightages directly during the approval process
- **Return for Rework**: Send goals back to employees if modifications are needed
- **Goal Locking**: Once approved, goals are locked and cannot be edited without Admin intervention
- **Permission-Based Access**: Only L1 managers can approve goals for their direct reports

### Shared Goals Functionality
- **Admin/Manager Distribution**: Push departmental KPIs to multiple employees as shared goals
- **Read-Only Fields**: Recipients can only adjust weightage; Goal Title and Target are read-only
- **Synchronized Updates**: Achievement updates by the primary goal owner automatically sync across all linked goal sheets
- **Flexible Weightage**: Recipients can adjust the weightage to reflect their relative contribution to the shared KPI

---

## Phase 2 — Achievement Tracking & Quarterly Check-ins (Must-Have)

### Achievement Update Interface
- **Quarterly Actuals Logging**: Employees enter Actual Achievement against Planned Targets each quarter
- **Status Selection**: Mark each goal with one of the following statuses:
  - **Not Started**: No progress has been made
  - **On Track**: Progressing as planned
  - **Completed**: Goal has been achieved

### Manager Check-in Module
- **Dashboard View**: Display Planned vs. Achievement data for each team member
- **Structured Comments**: Add detailed check-in comments to document quarterly discussions and feedback
- **Real-time Progress Tracking**: Monitor goal progress status across the team

### Progress Score Computation

| UoM Type | Description | Formula | Example |
|----------|-------------|---------|---------|
| **Min (Numeric / %)** | Higher is better | Achievement ÷ Target | Sales Revenue: 150 ÷ 100 = 1.5 |
| **Max (Numeric / %)** | Lower is better | Target ÷ Achievement | TAT / Cost: 50 ÷ 60 = 0.83 |
| **Timeline** | Date-based completion | Completion date vs. Deadline | Complete before deadline = 100% |
| **Zero** | Zero = Success | If 0 → 100%, else 0% | Safety incidents: 0 incidents = 100% |

**Note**: Progress scores are computed for tracking purposes only and are not used for performance ratings.

---

## Check-in Schedule

The portal enforces the following quarterly windows for achievement capture and goal management:

| Period | Window Opens | Action |
|--------|--------------|--------|
| **Q1 Check-in** | 1st May | Goal Creation, Submission & Approval |
| **Q2 Check-in** | July | Progress Update — Planned vs. Actual |
| **Q3 Check-in** | October | Progress Update — Planned vs. Actual |
| **Q4 / Annual** | January | Progress Update — Planned vs. Actual |
| **Annual Close** | March / April | Final Achievement Capture |

---

## User Roles & Personas

The system supports three distinct user roles, each with clearly differentiated access and capabilities:

### Employee
**Responsibilities:**
- Draft and submit goals within specified Thrust Areas
- Enter quarterly achievement metrics
- Update progress status for each goal
- View shared goals and adjust weightage

**Required Capabilities:**
- Create & edit goals pre-submission
- View locked goals after manager approval
- Input actual achievement values
- Access progress tracking dashboard

### Manager (L1)
**Responsibilities:**
- Review and approve/reject employee goal submissions
- Conduct quarterly check-ins with direct reports
- Log feedback and progress comments
- Monitor team performance against targets

**Required Capabilities:**
- Team dashboard for goal overview
- Inline editing during goal approval process
- Comment and feedback logging
- Real-time achievement tracking
- Approval/rejection workflows

### Admin / HR
**Responsibilities:**
- Configure performance cycles and timelines
- Manage organizational hierarchy
- Oversee completion rates and escalations
- Handle exceptions and unlock goals if needed
- Generate audit trails and compliance reports

**Required Capabilities:**
- Cycle management interface
- Exception handling and override capabilities
- Audit log access and review
- Goal unlock capability for locked goals
- Organization hierarchy configuration

---

## Escalation Module (Rule-Based)

### Escalation Rules & Triggers
The system monitors employee and manager activities and triggers automated escalations based on defined conditions:

**Employee-Level Escalations:**
- **Goal Submission Deadline**: Employee has not submitted goals within **N days** of cycle open
- **Quarterly Check-in Deadline**: Quarterly check-in not completed within the active window

**Manager-Level Escalations:**
- **Goal Approval Deadline**: Manager has not approved goals within **N days** of employee submission
- **Check-in Completion Deadline**: Manager has not completed check-ins with team members within the active window

### Escalation Chain
Escalations follow a hierarchical notification chain:

1. **Level 1**: Auto-notification sent to **Employee/Manager** (Primary responsibility holder)
2. **Level 2**: After defined interval (e.g., X days), notification escalates to **Direct Manager**
3. **Level 3**: After additional interval, escalation reaches **Skip-level Manager / HR** for intervention

### Escalation Log & Tracking
- **Admin/HR Dashboard**: Access comprehensive escalation logs showing:
  - Escalation trigger reason and timestamp
  - Current escalation level
  - Resolution status
  - Action history
- **Tracking & Resolution**: Monitor pending escalations and track resolution progress
- **Exception Management**: Manually override or close escalations with admin approval

---

## Analytics Module

### Quarter-on-Quarter (QoQ) Analysis
- **Individual Level**: Track goal achievement trends for each employee across quarters
- **Team Level**: Analyze team-wide goal completion and performance metrics
- **Department Level**: Department-wide achievement trends and comparative analysis

### Progress Visualization
- **Heatmaps**: Visual representation of completion rates across organizational units
- **Progress Charts**: Dynamic charts showing goal achievement vs. targets
- **Trend Analysis**: Historical data visualization for performance improvement tracking

### Goal Distribution Analysis
Comprehensive breakdown by:
- **Thrust Area**: Distribution of goals across different strategic focus areas
- **UoM Type**: Breakdown by measurement type (Numeric, %, Timeline, Zero-based)
- **Status**: Goals categorized by current status (Not Started, On Track, Completed)

### Manager Effectiveness Dashboard
- **Check-in Completion Rates**: Compare check-in completion rates across L1 managers
- **Approval Timeliness**: Track goal approval cycles and manager responsiveness
- **Team Performance Metrics**: Analyze manager's team goal achievement performance
- **Trend Tracking**: Monitor manager effectiveness improvements over time

---

## Reporting & Governance Requirements

### Achievement Report
- **Format**: Exportable in CSV and Excel formats
- **Content**: 
  - Employee name and ID
  - Goal title and description
  - Planned Target values
  - Actual Achievement values
  - Progress Score calculation
  - Achievement status
- **Accessibility**: Available to Admin, HR, and authorized managers
- **Export**: One-click download for bulk data analysis

### Completion Dashboard
- **Real-time Updates**: Dynamic view of task completion status
- **Tracked Metrics**:
  - Employees who have completed quarterly check-ins
  - Managers who have completed team check-ins
  - Pending goal approvals
  - Overdue submissions
- **Filter & Sort**: Filter by department, manager, or completion status
- **Progress Indicators**: Visual indicators for completion percentage

### Audit Trail
- **Comprehensive Logging**: System logs all changes made to goals after the lock date
- **Change Tracking**:
  - **Who**: User ID of the person making the change
  - **What**: Specific field(s) changed and old vs. new values
  - **When**: Exact timestamp of the change
  - **Reason**: Optional reason for the change (if applicable)
- **Admin Access**: Only Admin/HR can access and review audit logs
- **Compliance**: Supports compliance and governance requirements
- **Export**: Audit logs exportable for compliance audits and documentation

---

## Getting Started

### User Guide
For comprehensive guidance on using the Phoenix platform, including step-by-step walkthroughs, best practices, and troubleshooting tips, please refer to the **[📖 User Guide](docs/USER_GUIDE.md)**.

The User Guide covers:
- How to navigate the portal
- Step-by-step instructions for each role
- Feature walkthroughs
- Common workflows and use cases
- FAQ and troubleshooting

---

## Technology Stack

- **Frontend**: React with TypeScript, Vite
- **Backend**: Node.js
- **Database**: SQLite
- **Styling**: Tailwind CSS, Shadcn UI Components

