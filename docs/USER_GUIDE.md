# GoalWorks User Guide: Pages and Components

This guide explains each page and the main user-facing components. It is written from a user point of view, with notes on when to use each screen. Access is role-based (Employee, Manager, Admin), and many actions are only available when the relevant cycle phase is open.

## Shared entry and navigation

### Login
- What it is: The sign-in screen with standard credentials and demo-role shortcuts.
- When to use: When you need to enter the app or switch into a demo role quickly.

### Top navigation and layout
- `Sidebar`: The left navigation menu. Use it to move between pages in your role.
- `TopNavbar`: The top bar with search, notifications, active cycle chip, and profile/role switch.
- `ContextPanel`: The right panel that highlights pending actions, deadlines, activity, and unread notifications.
- `PageHeader`: A consistent page title area with subtitle and optional action button or chip.

## Employee pages

### Employee Dashboard
- What it is: A personal overview of your goals, approvals, progress, deadlines, and recent activity.
- When to use: Start of your day to check progress, weightage status, and upcoming deadlines.

### My Goals
- What it is: Your goal workspace for creating, editing, and tracking goals in the active cycle.
- When to use: During the goal-setting phase to build or revise your goal sheet.
- Notes: Submission is enabled only when validation passes (total weightage, goal count, minimum weight per goal).

### Goal Submission Review
- What it is: A read-only review of your goal sheet and validation checklist before submitting to your manager.
- When to use: After finishing goal creation and before you send for approval.

### Quarterly Check-in
- What it is: The check-in form to log planned vs actual progress for approved goals by quarter.
- When to use: During the quarterly check-in window to update status, actuals, and comments.

### Shared Goals
- What it is: Goals shared by a primary owner; you can only adjust your contribution weightage.
- When to use: When you have assigned shared KPIs and need to confirm your weightage contribution.

### Notifications
- What it is: A list of system updates (approvals, rework requests, deadlines, comments).
- When to use: To see what requires attention and navigate to the linked page.

## Manager pages

### Manager Dashboard
- What it is: Team overview with approval counts, risk flags, and quick actions.
- When to use: To scan team status and jump into approvals or check-ins.

### Team Goals
- What it is: A filtered list of goals across the team, plus a shared KPI push form.
- When to use: To review goal quality and push a shared KPI to multiple employees.

### Approvals
- What it is: Goal sheet review and approval area with optional inline edits.
- When to use: During goal-setting to approve or return goal sheets for rework.

### Manager Check-in
- What it is: Review employee check-ins and add structured manager comments.
- When to use: During check-in windows to document discussion summaries and next actions.

### Team Analytics
- What it is: Performance analytics across goals, quarters, and team members.
- When to use: For periodic reviews, spotting at-risk goals, and tracking completion trends.

## Admin pages

### Admin Dashboard
- What it is: Organization-level overview of cycles, approvals, and system health.
- When to use: To monitor the overall program health at a glance.

### Cycle Management
- What it is: Phase configuration for goal setting and quarterly check-ins.
- When to use: To open or close phases, set window dates, and manage active cycles.

### Org Hierarchy
- What it is: A visual view of company structure and reporting lines.
- When to use: To confirm manager-employee relationships and org layout.

### Audit Logs
- What it is: A searchable log of system actions with export.
- When to use: For compliance, investigating changes, or downloading audit history.

### Reports & Governance
- What it is: Completion dashboard and achievement report with filters and export.
- When to use: For quarter summaries, department performance, and CSV exports.

### Escalation Center
- What it is: Rule-based escalations for missed submissions or check-ins.
- When to use: To monitor escalations, change status, and resolve issues.

### Settings
- What it is: Global configuration, admin unlocks, notifications, and integrations.
- When to use: When adjusting policy defaults or unlocking approved goals for corrections.

## User-facing components (what you see and how to use them)

### Goal and progress components
- `GoalCard`: A compact goal summary (title, status, progress, weightage). Use it to quickly scan a goal without editing.
- `ProgressBar`: A color-coded progress meter. Use it to interpret how close a goal is to completion.
- `DonutRing`: A circular progress indicator. Use it for quick, at-a-glance completion rates.
- `StatusPill`: A colored status label (Draft, Pending, Approved, Rework, Completed). Use it to understand a goal state instantly.

### Metrics and insights
- `KPICard`: A single metric tile with icon and subtitle. Use it to scan totals and performance indicators.

### Creation and sharing
- `CreateGoalDrawer`: A multi-step goal creation panel. Use it when adding or editing goals in My Goals.
- `SharedKpiForm`: A shared KPI builder used by managers/admins. Use it to push a shared goal to multiple employees.

### Visual and reliability helpers
- `ImageWithFallback`: Displays a safe placeholder if an image fails to load. Use it when an image is missing or broken.

## Notes on availability
- Actions like goal creation, submission, and check-ins are gated by cycle phase windows.
- If a button is disabled, check the phase status in Cycle Management or the alert banner on the page.
