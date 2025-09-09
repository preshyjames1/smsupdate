SMS Update - A Modern School Management System
A comprehensive, full-stack school management system designed to streamline administrative and academic tasks for educational institutions. Built with Next.js, Firebase, and TypeScript, this platform provides a secure, role-based environment for administrators, teachers, students, and parents.

✨ Core Features
This platform is packed with features to manage every aspect of a modern school:

👤 Role-Based Access Control (RBAC): Secure authentication system with distinct roles (School Admin, Teacher, Student, Parent) and permissions. Users only see what they need to see.

👨‍🎓 User Management: Admins can easily create, view, update, and manage profiles for students, teachers, parents, and staff.

🏫 Academic Management:

Create and manage classes and subjects.

Track student attendance.

Build and display class timetables.

📣 Communication Hub:

Post school-wide announcements.

A dedicated messaging center for communication between users.

☁️ Cloud-Powered Backend: Leverages Firebase for real-time data, secure file storage, serverless functions, and robust authentication.

📧 Automated Email Notifications: Cloud Functions automatically send welcome emails, password resets, and announcements.

📂 Bulk Data Import: Admins can import user data from CSV files to quickly set up the school.

📊 Analytics & Reporting: A dedicated dashboard for visualizing key school metrics (feature in progress).

💳 Billing & Subscriptions: Manage school subscription plans and feature access.

🎨 Modern UI: A clean, responsive, and intuitive user interface built with shadcn/ui and Tailwind CSS.

🛠️ Technology Stack
Framework: Next.js (React)

Language: TypeScript

Backend & Database: Firebase (Firestore, Authentication, Storage, Cloud Functions)

Styling: Tailwind CSS

UI Components: shadcn/ui

Emails: Nodemailer (within Cloud Functions)

Package Manager: pnpm

🚀 Getting Started
Follow these instructions to get a local copy up and running for development and testing purposes.

Prerequisites
Node.js (v18 or later)

pnpm

A Firebase account with an active project.

Firebase CLI installed and authenticated (npm install -g firebase-tools, then firebase login).

1. Clone the Repository
git clone [https://github.com/preshyjames1/smsupdate.git](https://github.com/preshyjames1/smsupdate.git)
cd smsupdate

2. Install Dependencies
Install dependencies for both the main Next.js app and the Cloud Functions.

# Install root dependencies
pnpm install

# Install functions dependencies
cd functions
pnpm install
cd ..

3. Firebase Setup
Create a Firebase Project: Go to the Firebase Console and create a new project.

Enable Services: In your new project, enable the following services:

Authentication: Enable the "Email/Password" sign-in provider.

Firestore Database: Create a new database.

Storage: Create a new storage bucket.

Functions: Initialize Cloud Functions.

Get Web App Credentials: In your Firebase project settings, add a new "Web App". Firebase will provide you with a firebaseConfig object. You will need these keys.

4. Environment Variables
Create a .env.local file in the root of the project. Copy the contents of your Firebase web app config into it.

# .env.local

# Firebase Public Keys (from your Firebase project settings)
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="..."

To set up the email-sending Cloud Functions, you also need to set the secrets for your SMTP provider (e.g., MailerSend, SendGrid).

# Run these commands in your terminal from the project root
# Replace with your actual SMTP credentials

firebase functions:secrets:set MAILERSEND_SMTP_USER
firebase functions:secrets:set MAILERSEND_SMTP_PASS

5. Deploy Firebase Rules & Functions
Deploy the security rules and the cloud functions to your Firebase project.

# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Cloud Functions
firebase deploy --only functions

6. Run the Development Server
You are now ready to run the Next.js application locally.

pnpm dev

Open http://localhost:3000 with your browser to see the result. You can start by registering a new "School Admin" account.

📄 License
Distributed under the MIT License. See LICENSE for more information.

📧 Contact
Preshy James - preshyjames1@gmail.com

Project Link: https://github.com/preshyjames1/smsupdate
