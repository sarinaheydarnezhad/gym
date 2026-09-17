# Hamrah — Fitness Coach Student Intelligence MVP

Hamrah is a Persian, right-to-left web application for independent fitness coaches and personal trainers. It helps a coach understand which students need attention, what changed, why it matters, and what the coach should do next.

This repository currently contains a local, frontend-only MVP designed to validate the product workflow with real coaches. It is not yet a production system.

## What the MVP Includes

- A daily attention dashboard
- Explainable student attention scores
- Student list, search, filters, and profiles
- Student timelines and private coach notes
- Simple weekly program editor and exercise library
- Separate mobile-first student experience
- Today's workout, completion tracking, and actual weight/repetition entry
- Workout adherence and exercise performance trends
- Weekly student check-in form
- Weight trend visualization
- Suggested next actions for the coach
- Persian natural-language questions about a student's records
- Local persistence using browser Local Storage
- Responsive Persian RTL interface

The attention engine currently evaluates attendance, delayed check-ins, energy, sleep, workout completion, reported pain, recent changes, and time since the last coach contact.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A modern browser such as Chrome, Edge, or Firefox

The project has been verified with Node.js 24.

## Installation

Open PowerShell or another terminal in the project directory:

```powershell
cd "D:\app\باشگاه"
```

Install the dependencies:

```powershell
npm install
```

Installation only needs to be repeated when dependencies change or `node_modules` has been removed.

## Running the Web App

Start the development server:

```powershell
npm run dev
```

Vite will print an address similar to:

```text
http://localhost:5173/
```

Open that address in your browser. Keep the terminal open while using the application. Press `Ctrl+C` in the terminal to stop the server.

### Opening the App on Another Device

To make the development server available to another device on the same Wi-Fi network, run:

```powershell
npm run dev -- --host 0.0.0.0
```

Vite will display a network address such as:

```text
http://192.168.1.20:5173/
```

The computer and phone must be connected to the same network, and Windows Firewall must allow the connection.

This network address is intended only for local demonstrations. It is not a permanent public URL and should not be used to collect sensitive production data.

## Coach Workflow

### 1. Review Today's Priorities

The first page answers: “Who needs attention today?” Students are ranked using their current attention score. Each priority card shows the important signals, why each signal was triggered, a recommended next action, and a link to the full student profile.

### 2. Review All Students

Open **Students** from the sidebar to:

- Search by student name
- Filter by Attention Needed, Watch, or Stable
- Compare check-in recency and session completion
- Open an individual student profile

### 3. Use a Student Profile

The profile contains:

- Current attention score and status
- Latest energy, sleep, workout completion, and weight
- Detected changes and suggested action
- Weight trend chart
- Timeline of check-ins, messages, measurements, and notes
- Private coach notes
- A button for recording a completed follow-up

The profile also provides dedicated tabs for:

- **Current Program:** edit weekly training days, sets, repetitions, target weight, and exercises
- **Progress:** review 14-day adherence, exercise performance, and body measurements
- **Check-ins:** compare weekly energy, sleep, training quality, and notes
- **Notes and Timeline:** retain the coaching history in one place

### 4. Ask Questions About a Student

Open the **Ask Hamrah** tab in a student profile. Example questions include:

- Why does this student need attention?
- When did this student last report pain?
- How has the student's weight changed?
- When did I last contact this student?
- What is the latest sleep and energy status?

The current assistant is rule-based and searches structured local records. It does not call an external AI service.

### 5. Add a Student or Coach Note

Use **Add Student** to create a basic profile. Inside a profile, use **New Note** to record information that should remain in the student's timeline, for example:

> Reported right-knee pain during squats. Review before the next lower-body session.

## Student Check-In Access

### Current Prototype Behavior

The MVP now includes a separate mobile-first student interface. From the coach sidebar, select **Student Panel Preview** to open it. The preview selector in the header lets you test the experience as any sample student.

Inside the student interface, the student can:

- See today's workout immediately
- Open the complete weekly plan
- Mark exercises as completed
- Record actual weight and repetitions
- Submit the workout to the coach
- Review adherence, weight, and recent workouts
- See their current goal
- Complete a short weekly check-in

Workout submissions update the student's workout log, timeline, progress, and coach signals immediately.

The current MVP still does **not** generate a real public link for each student and does not provide student authentication. Coach and student previews run in the same browser and share Local Storage.

The coach-side **Check-ins** page remains available for demonstrations:

1. The coach opens **Check-ins** from the sidebar.
2. The coach selects a student from the dropdown.
3. The form is completed for demonstration or testing.
4. The submitted check-in is added to that student's profile.
5. The attention score is recalculated immediately.

Because all current data is stored in one browser's Local Storage, sending `http://localhost:5173` to a student will not provide a safe or isolated student experience. `localhost` always refers to the device opening the address, not the coach's computer.

### Where Should the Coach Send the Student Link?

The production version should add a **Send Check-in** button to each student profile. When clicked, the backend should generate an unguessable, revocable student URL such as:

```text
https://app.example.com/check-in/7f4c8e2a...
```

The coach should copy or share this link through the communication channel already used with the student:

- **WhatsApp — recommended for the initial Iranian pilot**
- SMS
- Telegram
- Another approved direct-message channel

A suggested WhatsApp message is:

```text
Hi [Student Name], please complete your weekly check-in using this private link:
[Private Check-in Link]

It takes about two minutes. Please do not forward the link to anyone else.
```

The student should open the link in a mobile browser without installing an application or creating a password. The student should only see their own check-in form—not the coach dashboard, private coach notes, other students, or the attention score.

After submission:

1. The backend validates the token.
2. The response is saved to the correct student account.
3. The student's timeline is updated.
4. The attention score is recalculated.
5. The coach sees the result on the dashboard.
6. The link is marked as used or remains valid until expiration, depending on the final product policy.

### Student Link Security Requirements

Before sending real links to students, the production version must provide:

- Random, unguessable access tokens
- HTTPS
- Token expiration and revocation
- Rate limiting
- Clear student consent
- Separation of coach and student permissions
- Encrypted storage for health and body data
- Audit records for form submission and access
- A way to correct or delete student data
- Optional SMS verification before displaying historical or sensitive information

Do not use the current local prototype to collect real health information from students over the public internet.

## Data Storage and Resetting the Demo

This MVP stores all changes in the browser's Local Storage. Data is not synchronized between browsers or devices and is not backed up.

To reset the demo to its original sample data:

1. Open the browser developer tools.
2. Open **Application** or **Storage**.
3. Select **Local Storage** for `http://localhost:5173`.
4. Delete `hamrah-coach-students-v1`.
5. Refresh the page.

Clearing all site data for localhost will have the same effect.

## Tests and Production Build

Run the analysis tests:

```powershell
npm test
```

Create a production build:

```powershell
npm run build
```

The generated static files will be written to `dist/`.

Preview the production build locally:

```powershell
npx vite preview
```

## Current Technical Boundaries

As of September 17, 2026, this MVP does not include:

- A backend or database
- Coach or student authentication
- Real public student links
- WhatsApp or SMS integration
- Cloud synchronization or backups
- Multi-coach workspaces
- Production-grade AI or semantic search
- Production privacy, consent, and data-retention controls

These capabilities must be implemented before a real multi-user pilot with sensitive student data.
