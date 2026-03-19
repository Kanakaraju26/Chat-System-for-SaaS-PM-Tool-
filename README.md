# 💬 SaaS Chat System

A **multi-tenant real-time chat application** built on top of a SaaS project management platform.
Each organization and project has its own dedicated communication channel with **secure, RLS and DB level protection**.

---

## 🚀 Features

* 🔹 Organization-level chat (global team communication)
* 🔹 Project-level chat (focused discussions)
* 🔹 Real-time messaging using Supabase Realtime
* 🔹 Secure access via Row Level Security (RLS)
* 🔹 Multi-tenant architecture (org-based isolation)
* 🔹 No manual member management in chat (inherits from PM system)
* 🔹 Scalable channel-based design

---

## 🏗️ Architecture Overview

### Chat Scopes

* **Organization Chat**

  * Accessible to all members in an organization
* **Project Chat**

  * Accessible only to project members

### Core Tables

#### `channels`

* `id`
* `type` → `organization | project`
* `organization_id`
* `project_id`
* `created_at`

#### `messages`

* `id`
* `channel_id`
* `user_id`
* `content`
* `created_at`

---

## 🔐 Access Control (RLS)

Access is enforced using existing membership tables:

* `organization_members`
* `project_members`

### Rules:

* Users can read/write messages only if:

  * They belong to the organization (for org chat)
  * They belong to the project (for project chat)

---

## ⚙️ Tech Stack

* **Frontend:** Next.js (App Router)
* **Backend:** Supabase (Postgres + Auth + Realtime)
* **Database:** PostgreSQL
* **Auth:** Supabase Auth
* **Realtime:** Supabase Subscriptions

---

## 📡 Real-Time Messaging

* Subscribes to `messages` table
* Filters by `channel_id`
* Enables instant message delivery without polling

---

## 🌐 Routing Structure

```
/dashboard
/[org_slug]/chat/[type]/[id]
```

---

## 📦 API Endpoints

### Send Message

```
POST /component/chatinterface
```

**Body:**

```
{
  "channel_id": "uuid",
  "content": "message text"
}
```

**Logic:**

* Validate user membership
* Insert message into database

---

## 🧠 Design Decisions

* ❌ No duplicate membership tables
* ✅ Reuse existing org/project membership
* ✅ Strict RLS enforcement at DB level
* ✅ Channel abstraction for scalability
* ✅ Clean separation of chat scope

---

## 📈 Future Improvements

* Typing indicators
* Read receipts
* File/image sharing
* Notifications system
* Message search
* Unread message count

---

## 🛠️ Setup

```bash
git clone <repo-url>
cd <project>
npm install
npm run dev
```

---

## 📌 Notes

* This system is tightly coupled with the main SaaS PM platform
* Chat access is fully dependent on existing membership roles
* Designed for scalability and production-level security

---

## 👤 Author

Built as part of a SaaS ecosystem project focusing on real-world system design and scalability.
