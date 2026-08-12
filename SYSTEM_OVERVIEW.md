# 🌟 Silah-e-Khair Welfare Foundation — System Overview & Architecture Guide

## 📋 Executive Summary
**Silah-e-Khair Welfare Foundation (صلۂ خیر ویلفیئر فاؤنڈیشن)** is a comprehensive, transparent, and cloud-powered welfare management platform designed to streamline community contributions, track member pledges, process welfare applications, manage foundation expenses, and provide 100% financial transparency to donors and public members.

This document serves as an exhaustive reference for stakeholders, administrators, developers, and media creators preparing **member tutorial videos**, **user onboarding guides**, or **executive briefings**.

---

## 🏛️ System Core Portals & Capabilities

The platform consists of **three primary portals**:

### 1. 🌐 Public Welfare Portal (Public-Facing Website)
* **Transparency First:** Live public donation tracking, verified expense records, and real-time welfare stats.
* **Online Donation:** Direct donation workflows via NayaPay, Bank Transfer, EasyPaisa, JazzCash, or Cash with instant proof of payment / receipt image attachment.
* **Membership Registration:** Simple 3-step public application form for individuals joining as monthly contributing members.
* **Programs & Impact Showcase:** Highlights active welfare projects (Ration Distribution, Education Support, Medical Aid, Emergency Relief).
* **Media & Gallery:** Photo & video showcases of foundation field activities.
* **Direct WhatsApp Integration:** One-click WhatsApp coordinator connectivity with pre-filled context messages.

### 2. 👤 Member Self-Service Portal (`/member/login`)
* **Personalized Dashboard:** Overview of total personal contributions, current pledge amount, membership tier badge, and earned community points.
* **Monthly Contribution Submission:** Easy submission form with pre-selected current billing month dropdown, payment method selection, transaction reference/TRX ID, and screenshot attachment.
* **Contribution Ledger & Receipts:** Full downloadable payment history with digital verification badges.
* **Membership Card & Certificate:** Downloadable digital member certificate and ID badge.
* **Event Registrations:** One-click RSVP for community drives, distribution events, and volunteer meetings.
* **Community Rewards & Points:** Gamified points engine rewarding punctual monthly contributions and event participation.

### 3. 🛡️ Admin Management Portal (`/admin/login`)
* **Real-time Analytics Dashboard:** Financial stats (Total Collected, Monthly Target vs Actual, Verified Expenses, Active Members count).
* **Application Approval Desk:** Review incoming membership applications with one-click **Approve** (assigns gapless IDs like `SKF-0001` and syncs to Supabase) or **Decline**.
* **Contribution Verification Center:** Review submitted monthly contributions and public donations, inspect uploaded payment receipts, verify bank references, and mark as **Paid** or **Declined**.
* **Member Directory:** Full member profiles, status toggles (Active/Inactive), pledge adjustments, and permanent record management.
* **Expense Ledger & Audits:** Record verified foundation expenses with receipt attachments and category tags (Ration, Medical, Operations).
* **Event & Attendance Tracker:** Create upcoming events, manage RSVPs, and mark volunteer attendance.
* **System Audit Logs:** Immutable history of all admin actions for operational accountability.

---

## 📐 Technical Architecture & Database Sync

* **Frontend:** React 18 with TypeScript, Vite, Tailwind CSS, Motion (Framer Motion), Lucide Icons, Recharts (for analytics).
* **Backend Database:** Supabase (PostgreSQL) with Row Level Security (RLS) policies enabled.
* **Data Reliability & Resilience:**
  * **Gapless ID Generation:** Unique sequential codes for Members (`SKF-XXXX`), Contributions (`CTR-XXXX`), Expenses (`EXP-XXXX`), Events (`EVT-XXXX`), and Applications (`APP-XXXX`).
  * **Hybrid Storage Engine:** Seamless real-time sync with Supabase PostgreSQL alongside graceful local storage fallback for offline resilience.
  * **Dual-Table Integrity:** Clean application-to-member conversion ensuring zero duplicate key errors and permanent dual-table deletion upon member removal.

---

## 🎥 Member Tutorial Video Script Guide (For Video Creation)

If you are creating an instruction video or tutorial for your foundation members, follow this step-by-step scene outline:

### 🎬 Scene 1: How to Register as a Contributing Member (1.5 Mins)
1. Open the website homepage and click **"Become Member"** or **"Join Foundation"**.
2. Fill in basic personal details: Full Name, WhatsApp/Phone Number, City, and Monthly Pledge Amount (e.g. PKR 1,000/month).
3. Set your account password and submit.
4. Highlight that your application will be reviewed by the admin team, and you will receive a confirmation message with your Member ID (e.g., `SKF-0012`).

### 🎬 Scene 2: How to Login to the Member Portal (1 Min)
1. Navigate to `/member/login` (or click **"Member Login"** in the navigation menu).
2. Enter your registered Phone Number / Member ID and Password.
3. Access your personalized member dashboard showing your active status, pledge details, and contribution history.

### 🎬 Scene 3: How to Submit Your Monthly Contribution (2 Mins)
1. On the Member Dashboard, click **"Submit Monthly Contribution"**.
2. Select the **Billing Month** (automatically defaults to the current month, e.g. *August 2026*).
3. Select your Payment Method (e.g. *NayaPay*, *Meezan Bank*, *EasyPaisa*, *JazzCash*).
4. Enter the transferred Amount and Transaction Reference / TRX ID.
5. Upload a clear screenshot or picture of the payment receipt.
6. Click **"Submit Contribution"**. Show that it immediately reflects as **"Pending Verification"** until approved by the admin.

### 🎬 Scene 4: Viewing Ledger & Downloading Membership Certificate (1 Min)
1. Show the **"My Contributions"** tab to view past verified payments.
2. Show how members can view their membership badge and download their digital certificate.

---

## 💡 Suggestions for Growth & Video Production

1. **Keep Tutorial Videos Short & Focused:** Break videos into 2-3 short WhatsApp clips (1 to 2 minutes each) in Urdu/English voiceover.
2. **Promote the Auto-Select Billing Month:** Emphasize to members that the system automatically picks the current month so they don't need to type dates manually.
3. **Highlight Receipt Upload Clarity:** Remind members to always attach a clear screenshot of their bank/EasyPaisa transaction so admins can verify instantly.
4. **Transparency & Trust:** Share screenshots of the Public Transparency Ledger with donors so they know every rupee is accounted for.

---
*Documented and synced automatically for Silah-e-Khair Welfare Foundation.*
