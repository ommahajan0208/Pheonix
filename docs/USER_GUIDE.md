# Pheonix: User Guide

> **Pheonix** is your organization's goal management and performance tracking portal. This guide walks through every screen, explains what it does, and tells you exactly when to use it, organized by role.

---

## Table of Contents

1. [Getting Started - Login & Navigation](#1-getting-started--login--navigation)
2. [Employee Guide](#2-employee-guide)
   - [Dashboard](#21-employee-dashboard)
   - [My Goals](#22-my-goals)
   - [Goal Submission Review](#23-goal-submission-review)
   - [Quarterly Check-in](#24-quarterly-check-in)
   - [Shared Goals](#25-shared-goals)
   - [Notifications](#26-notifications)
3. [Manager Guide](#3-manager-guide)
   - [Dashboard](#31-manager-dashboard)
   - [Team Goals](#32-team-goals)
   - [Approvals](#33-goal-approvals)
   - [Manager Check-in](#34-manager-check-in)
   - [Team Analytics](#35-team-analytics)
4. [Admin Guide](#4-admin-guide)
   - [Dashboard](#41-admin-dashboard)
   - [Cycle Management](#42-cycle-management)
   - [Audit Logs](#43-audit-logs)
   - [Reports & Governance](#44-reports--governance)
   - [Escalation Center](#45-escalation-center)
   - [Settings](#46-settings)
5. [Key Rules & Validation](#5-key-rules--validation)

---

## 1. Getting Started - Login & Navigation

### Login

![Login Screen](images/Screenshot%202026-05-18%20125953.png)

The login screen is your entry point to Pheonix. You can sign in with your company credentials (email + password), or use one of the **Demo Access** shortcuts at the bottom to instantly enter the portal as a specific role such as Employee (John Smith), Manager (Sarah Johnson), or Admin (Alex Chen).

**When to use it:**
- First time opening the app
- Switching between demo roles during a walkthrough or testing session
- After a session timeout

> **Tip:** If you're already logged in, you can switch roles without logging out using the profile menu in the top-right corner. Click your avatar and choose **Switch to Employee / Manager / Admin**.

---

### Top Navigation & Layout

Once logged in, every page shares the same frame:

| Element | Where | What it does |
|---|---|---|
| **Sidebar** | Left panel | Navigate between pages for your role |
| **Search bar** | Top center | Search goals or employees by name |
| **FY chip** | Top right | Shows the active financial year (e.g. FY 2026) |
| **Notifications bell** | Top right | Badge count of unread notifications |
| **Avatar / Role switch** | Top right | Opens the profile menu for role switching and logout |
| **Context panel** | Far right | Live feed of pending actions, deadlines, activity, and notifications |

The **Context panel** is persistent across all pages - keep an eye on it for deadline alerts and escalation notices.

---

## 2. Employee Guide

### 2.1 Employee Dashboard

![Employee Dashboard](images/Screenshot%202026-05-18%20190058.png)

Your personal home screen. At the top you'll see four KPI tiles: Goals Created, Approved, Weightage status, and Avg Completion - giving you an instant health check on your cycle performance. Below that, your goal cards scroll down the left, and the **Progress Snapshot** donut ring on the right shows overall completion at a glance. The **Upcoming Deadlines** panel keeps your nearest due dates visible without leaving the page.

**When to use it:**
- Start of your workday - check whether any goals need attention
- After your manager takes an action (approved, returned for rework)
- To quickly see your total weightage and whether it's still balanced at 100%

---

### 2.2 My Goals

![My Goals](images/Screenshot%202026-05-18%20190109.png)

This is your primary workspace during the goal-setting phase. Each goal appears as a table row showing its title, thrust area, unit of measure (UoM), target, weightage badge, progress bar, status pill, and edit/delete actions. The **Weightage: 100/100%** chip at the top turns green when your allocation is valid. The **+ Add Goal** button opens the goal creation drawer.

**When to use it:**
- During **Phase 1 – Goal Setting** (May 1–31) to create, edit, or delete goals
- To monitor the weightage chip and ensure it reads 100/100% before submitting
- After a rework request from your manager - edit the flagged goals here

> **Note:** The edit and delete icons are greyed out for goals that have been approved and locked. Admin intervention is required to unlock them.

**Validation rules enforced:**
- Total weightage across all goals must equal exactly **100%**
- Each individual goal must carry at least **10%** weightage
- You can have a maximum of **8 goals** per cycle

---

### 2.3 Goal Submission Review

![Goal Submission Review](images/Screenshot%202026-05-18%20190117.png)

A read-only summary of your complete goal sheet before you formally submit it to your manager. The **Validation Checklist** at the top confirms three rules in green - total weightage equals 100%, goal count is within the 8-goal limit, and every goal meets the 10% minimum. Below that, all goals are listed as cards with their thrust area, target, weightage, status, progress, and deadline.

**When to use it:**
- After finishing goal creation in My Goals and before clicking submit
- To double-check every goal card one last time - targets, weightages, thrust areas
- If the **Ready to submit** button is disabled, the checklist will highlight which rule is failing

> **Tip:** Goals already approved in a previous cycle pass still show here as **Approved** with a lock icon - you cannot change them without admin intervention.

---

### 2.4 Quarterly Check-in

![Quarterly Check-in](images/Screenshot%202026-05-18%20190129.png)

The achievement logging form for each quarter. Switch between Q1, Q2, Q3, and Q4 using the tab bar. For each approved goal, you fill in a **Planned** figure, an **Actual** figure, and (where applicable) a **Completion Date**. The **Q1 Status Overview** donut ring on the right shows how many goals are Not Started, On Track, or Completed.

**When to use it:**
- During the quarterly check-in window only, the page shows a banner indicating whether the window is open or closed
- Q1 window: **Jul 1–31** | Q2: **Oct 1–31** | Q3: **Jan 1–31** | Q4/Annual: **Mar 1–Apr 30**
- If the window is closed, the fields are read-only and the banner will tell you the next open date

> **Important:** Achievement capture is only available while the window is open. Plan ahead - you cannot backfill entries after a window closes without admin assistance.

---

### 2.5 Shared Goals

![Shared Goals](images/Screenshot%202026-05-18%20190137.png)

Goals that were pushed to you by your manager or admin as departmental KPIs. The goal title, description, and target are **read-only**, you can only adjust the **My Weightage** slider to reflect your relative contribution. The **primary owner** field tells you who is responsible for the overall achievement, and the progress bar syncs automatically when the owner updates their actuals.

**When to use it:**
- When you receive a shared KPI and need to confirm or adjust how much of your 100% total weightage you're allocating to it
- To check the synced progress on a shared KPI without having to navigate to someone else's goal sheet
- Note: the weightage slider locks once the goal is submitted or approved

---

### 2.6 Notifications

![Notifications](images/Screenshot%202026-05-18%20190145.png)

The notifications page lists all system alerts in reverse chronological order. Each item shows an icon (bell for system alerts, chat bubble for comments, tick for approvals, clock for deadlines), a title, a brief description, the date and time, and a **New** badge until read.

**When to use it:**
- When the bell badge in the top nav shows a count - click through to see what requires attention
- Common notification types:
  - **Shared KPI needs attention** - a shared goal you're linked to needs an update
  - **Manager feedback added** - your manager commented on a check-in
  - **Goal Approved** - one of your goals was approved and locked
  - **Deadline Approaching** - a check-in or goal deadline is within a few days

We also have a **role-switch dropdown** that appears when you click your avatar - use this to switch between Employee, Manager, and Admin views in demo mode without logging out.

---

## 3. Manager Guide

### 3.1 Manager Dashboard

![Manager Dashboard](images/Screenshot%202026-05-18%20190156.png)

Your team overview. Four KPI tiles show Team Members (direct reports), Pending Approvals, Approved Goals, and At-Risk count. The **Goals by Thrust Area** bar chart gives a quick distribution view. **Team Performance** cards list each direct report with their goal count and average completion percentage. The **Quick Actions** panel on the right lets you jump directly to Review Pending Approvals, Conduct Check-ins, or View Team Analytics. The **Recent Activity** feed logs the latest submissions, deadline notices, and completions.

**When to use it:**
- Start of each week to scan for pending approvals and at-risk goals
- After the goal-setting window opens to check who has and hasn't submitted
- During check-in periods to see who still needs a review

---

### 3.2 Team Goals

![Team Goals](images/Screenshot%202026-05-18%20190205.png)

Two things live on this page. At the top is the **Push Shared Department KPI** form - fill in the KPI title, thrust area, primary owner, description, UoM, scoring direction, target, default weightage, and tick the recipient checkboxes, then click **Push Shared KPI** to distribute it to selected team members' goal sheets. Below the form, the full list of team goals is visible, filterable by employee.

**When to use it:**
- To distribute a departmental or team-wide KPI to multiple employees simultaneously (only available during Phase 1 – Goal Setting)
- To review goal quality across the team, check thrust area coverage, and spot gaps
- To filter by a specific employee to deep-dive into their goals before an approval session

> **Important:** Shared KPIs can only be pushed while the goal-setting window is open. Recipients can edit weightage but not the title or target.

---

### 3.3 Goal Approvals

![Goal Approvals](images/Screenshot%202026-05-18%20190213.png)

Your primary approval workspace. The left panel lists team members with a pending count badge. Click a name to load their goal sheet on the right. Each goal card shows the thrust area, UoM, target, weightage, progress bar, and current status. Approved goals display a lock icon and a note that admin intervention is required for further edits. At the top of the sheet, **Approve Sheet** and **Return for Rework** buttons control the outcome.

**When to use it:**
- During **Phase 1 – Goal Setting** (window banner confirms this is open)
- When the pending count on a team member is > 0
- To make inline edits to a goal's target or weightage before approving - edit directly in the card fields
- To return a sheet for rework, click **Return for Rework** - the employee will receive a notification and the sheet re-opens for editing

> **Note:** Approval actions and inline edits are only available while the Phase 1 window is open. Outside that window, the page is read-only.

---

### 3.4 Manager Check-in

![Manager Check-in](images/Screenshot%202026-05-18%20190222.png)

The check-in review and documentation screen. Select a team member from the **Employee** dropdown and a quarter from the **Quarter** dropdown to load their planned vs. actual data in a table (Goal, Target, Planned, Actual, Score, Status). On the right, the **Structured Check-in Comment** panel has three text areas: Discussion Summary, Blockers / Support Needed, and Next Actions. Click **Save Check-in Comment** when done.

**When to use it:**
- During any active quarterly check-in window (a banner confirms open/closed status)
- After reviewing an employee's self-reported actuals to add your structured feedback
- To document discussion outcomes and any blockers or support commitments for the record

> **Tip:** Comments are saved per employee per quarter. If you revisit the same employee and quarter, your previously saved comment will load automatically so you can edit it.

---

### 3.5 Team Analytics

![Team Analytics1](images/Screenshot%202026-05-18%20190232.png)
![Team Analytics2](images/Screenshot%202026-05-18%20190246.png)


A full analytics view of your team's performance. Four KPI tiles show Total Goals, Approved count, Avg Progress percentage, and at risk count. Below that, four charts give deeper insight:

| Chart | What it shows |
|---|---|
| **Progress by Team Member** | Bar chart of avg progress % per direct report |
| **Quarter-on-Quarter Achievement** | Line chart comparing individual, team, and department achievement across Q1–Q4 |
| **Performance by Thrust Area** | Radar / spider chart across strategic focus areas |
| **Completion Heatmap** | Grid of each employee × quarter, color-coded by completion % |

**When to use it:**
- Mid-cycle or end-of-cycle performance reviews
- Before your own manager review - prepare talking points using the QoQ and heatmap views
- To identify at-risk goals needing intervention before the next check-in window
- To spot which thrust areas are consistently underperforming across the team

---

## 4. Admin Guide

### 4.1 Admin Dashboard

![Admin Dashboard](images/Screenshot%202026-05-18%20190256.png)

The organization-level control center. Four KPI tiles show Total Employees, Total Goals for the cycle, Pending Approvals awaiting manager review, and Active Cycles. The **Cycle Phase Completion** bar chart shows completion % across Q1 Check-in, Q3 Check-in, and Final Review. **Goals by Department** gives a breakdown of goal count by department. **System Health** progress bars show Goal Completion Rate, Manager Engagement, and Employee Participation. The **Quick Actions** panel links directly to Manage Cycles, View Audit Logs, Generate Reports, and Escalation Center.

**When to use it:**
- Daily health check during an active cycle
- When preparing for leadership reviews or board updates
- When the System Health bars flag low engagement or completion rates that need follow-up

---

### 4.2 Cycle Management

![Cycle Management](images/Screenshot%202026-05-18%20190304.png)

Configure the performance cycle and its phases. The top section shows the active cycle (e.g. FY 2026, running 1/5/2026–30/4/2027) with an **Active** badge. A **Cycle Timeline** strip visualizes all five phases in sequence. Below that, each phase has its own card with a toggle (on/off), start/end date pickers, and a status message explaining whether the window is open or locked.

| Phase | Default window | Purpose |
|---|---|---|
| Phase 1 – Goal Setting | May 1–31 | Goal creation, submission, and approval |
| Q1 Check-in | Jul 1–31 | Progress update - planned vs. actual |
| Q2 Check-in | Oct 1–31 | Progress update - planned vs. actual |
| Q3 Check-in | Jan 1–31 | Progress update - planned vs. actual |
| Q4 / Annual Capture | Mar 1–Apr 30 | Final achievement capture |

**When to use it:**
- To open or close a phase - flip the toggle on the relevant card
- To adjust window dates if the business calendar shifts
- To create a new cycle at the start of a new financial year using **+ Create New Cycle**
- To diagnose why an employee says a button is greyed out - check whether the relevant phase is open here

> **Critical:** Disabling a phase toggle while employees are mid-submission will lock them out immediately. Always communicate changes ahead of time.

---

### 4.3 Audit Logs

![Audit Logs](images/Screenshot%202026-05-18%20190325.png)

A full, searchable log of every system action. Each row shows a **Timestamp**, the **User** who made the change (with their role), the **Action** (color-coded pill e.g. Updated Escalation Status, Opened Cycle Phase, Updated Locked Goal, Requested Goal Sheet Rework), the **Goal** affected, a **Locked Change** badge for post-lock edits, and **Before / After** snapshots of the changed fields.

Use the **Search logs** bar to filter by keyword, or the **Filter by Action** dropdown to narrow to a specific action type. The **Export CSV** button downloads the full log.

**When to use it:**
- Compliance audits - export the log for a given period
- Investigating a disputed change - search by employee name or goal title to trace who changed what and when
- Confirming that an admin goal unlock was recorded correctly (look for the orange **After lock** badge)

---

### 4.4 Reports & Governance

![Reports & Governance](images/Screenshot%202026-05-18%20190333.png)

A completion dashboard with exportable achievement data. Three KPI tiles show **Approved Goals** (eligible for check-ins), **Employee Completion %** (Q1 check-ins submitted), and **Manager Completion %** (Q1 manager comments logged). Below that, the **Completion Dashboard** table lists every employee with their manager, department, goals count, employee done ratio, manager done ratio, and a status pill - Complete (green), Manager pending (orange), or Employee pending (red).

**When to use it:**
- End-of-quarter governance reviews - who is still pending?
- Before escalation decisions,  cross-check the dashboard to confirm which employees are genuinely behind
- Downloading raw achievement data via **Export CSV** for payroll, HR systems, or leadership reporting

---

### 4.5 Escalation Center

![Escalation Center](images/Screenshot%202026-05-18%20190340.png)

Rule-based escalation tracking. Four KPI tiles at the top show Open Escalations (need action), Manager Level, HR Level (skip-level / HR), and Active Rules (demo configuration). Below that, three **Active** rule cards define the triggers:

| Rule | Trigger |
|---|---|
| Goal sheet not submitted | After 7 days; manager notified at day 10, HR at day 14 |
| Manager approval overdue | After 5 days; manager at 7, HR at 10 |
| Quarterly check-in incomplete | After 2 days; manager at 5, HR at 8 |

The escalation log at the bottom lists each open escalation with the employee, rule, subject, escalation chain badge (e.g. **Skip-level / HR**), reason, current status dropdown (Open / Monitoring / Resolved), and a **Mark Resolved** button.

Filter the log using the tabs: **All**, **open**, **monitoring**, **resolved**.

**When to use it:**
- Weekly scan for open escalations that need admin or HR follow-up
- When an employee reports not receiving notifications, check whether an escalation has already fired and whether it's been actioned
- To manually resolve an escalation after the underlying issue is fixed, click **Mark Resolved** and update the status dropdown

---

### 4.6 Settings

![Settings -- Goal Settings & Admin Goal Intervention](images/Screenshot%202026-05-18%20190347.png)

![Settings -- Push Shared KPI, Notification & Performance Review](images/Screenshot%202026-05-18%20190403.png)

![Settings -- Security & Compliance, Integration Settings](images/Screenshot%202026-05-18%20190409.png)

The Settings page is a single scrollable screen that controls every global policy and integration for the portal. It is divided into five sections:

#### Goal Settings
Set the validation rules that apply to every employee's goal sheet across the organization.

| Field | Default | What it controls |
|---|---|---|
| Maximum Goals per Employee | 8 | Hard cap on goals per cycle |
| Minimum Weightage per Goal (%) | 10 | Minimum weight any single goal can carry |
| Required Total Weightage (%) | 100 | Sum all goals must reach before submission is allowed |
| Allow Shared Goals | On | Whether managers/admins can push shared KPIs |
| Require Manager Approval | On | Whether goals must be approved before they lock |

**When to use it:** When an organizational policy changes. For example, if a new HR policy raises the minimum weightage to 15%, update it here and it takes effect for the next cycle.

#### Admin Goal Intervention
A scrollable list of every currently approved and locked goal across the organization. Each row shows the goal title, owner, and weightage. Click **Unlock** on any goal to move it back to rework status, allowing the employee to edit it.

**When to use it:**
- When an employee or manager identifies a data entry error in an approved goal (wrong target, wrong UoM)
- When a business priority changes mid-cycle and a goal needs to be revised after the lock date
- Every unlock is recorded in the Audit Log automatically, no separate action needed

> **Important:** Use unlock sparingly. Each unlock triggers an audit entry and notifies the affected employee. Always confirm the change is authorized before unlocking.

#### Push Shared Department KPI
Admins can distribute a shared KPI to the entire organization (or any subset), not just a manager's direct reports. The form is identical to the manager version on the Team Goals page - fill in the KPI title, thrust area, primary owner, description, UoM, scoring direction, target, and default weightage, then tick the recipient checkboxes and click **Push Shared KPI**.

**When to use it:**
- For org-wide or cross-department KPIs that cut across multiple managers' teams
- Only available during Phase 1 – Goal Setting (the green banner confirms the window is open)

#### Notification Settings
Control which automated alerts the system sends and how far in advance.

| Setting | Default | Purpose |
|---|---|---|
| Email Notifications | On | Sends all alerts via email |
| Deadline Reminders | On | Fires reminder emails before deadlines |
| Approval Alerts | On | Notifies employees and managers on approval/rework actions |
| Reminder Days Before Deadline | 7 | How many days ahead the reminder fires |

#### Performance Review
Configure the review cadence and check-in behaviour.

| Setting | Default | Purpose |
|---|---|---|
| Review Frequency | Quarterly | How often check-in windows open |
| Check-in Window (Days) | 15 | How many days each check-in window stays open |
| Self-Assessment Required | On | Whether employees must complete a self-assessment before manager check-in |
| Peer Feedback Enabled | Off | Enables peer feedback collection during check-ins |

#### Security & Compliance
| Setting | Default | Purpose |
|---|---|---|
| Audit Logging | On | Records all system changes to the Audit Log |
| Data Encryption | On | Encrypts data at rest |
| Session Timeout (Minutes) | 60 | Auto-logs out inactive users after this period |
| Data Retention (Days) | 365 | How long historical records are retained before archival |

#### Integration Settings
Configure outbound email delivery and SSO authentication.

| Field | Example | Purpose |
|---|---|---|
| SMTP Server | smtp.company.com | Mail server for sending system notifications |
| SMTP Port | 587 | SMTP port (587 = TLS standard) |
| From Email | noreply@company.com | Sender address shown on all system emails |
| SSO Provider URL | *(blank)* | Identity provider URL for single sign-on |
| API Key | *(blank)* | Integration API key for external systems |

After making any changes, click **Save Settings** to apply. Use **Reset to Defaults** to revert all fields to their factory values - use with caution as this affects the entire organization.

**When to use the Settings page:**
- Start of a new cycle - verify Goal Settings match current HR policy
- When notification emails stop arriving then check SMTP configuration
- When enabling SSO for the first time, paste the provider URL and API key, save, and test login
- When a post-approval correction is needed, use Admin Goal Intervention to unlock the specific goal

---

## 5. Key Rules & Validation

| Rule | Detail |
|---|---|
| **Total weightage** | All goals must sum to exactly 100% |
| **Minimum per goal** | Each goal must carry at least 10% weightage |
| **Goal cap** | Maximum of 8 goals per cycle per employee |
| **Phase gating** | Goal creation, submission, check-ins, and approvals are only available inside their respective phase windows |
| **Goal locking** | Once a manager approves a goal sheet, all goals are locked then edits require Admin to unlock via Settings |
| **Shared goal fields** | Recipients of a shared KPI can only edit their contribution weightage; title and target are read-only |
| **Audit trail** | All changes after the lock date are logged with user, timestamp, before/after values |

---

*For technical setup, data model details, and the technology stack, refer to the project [README.md](README.md).*
