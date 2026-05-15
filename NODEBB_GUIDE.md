# 📘 NodeBB Management & MongoDB Model Guide

This guide provides a comprehensive overview of how to manage your NodeBB instance, understand its MongoDB data model, and handle user accounts and the administration dashboard.

---

## 🛠️ 1. Managing the Dashboard

The **Administration Control Panel (ACP)** is the heart of NodeBB.

### Accessing the ACP
- **URL**: `http://your-domain.com/admin` (or `http://localhost:4567/admin` locally).
- **Credentials**: The first account created during setup is automatically granted administrative privileges.

### Key Dashboard Areas
- **General**: Site title, logo, and basic configuration.
- **Manage**: Categories, users, groups, and tags.
- **Extend**: Install plugins, themes, and widgets.
- **Settings**: Email, social authentication, and advanced system settings.

---

## 👥 2. Account & User Management

### User Structure
NodeBB uses a robust user management system based on **UIDs (User IDs)**.

- **UID 1**: Usually the original administrator.
- **Groups**: Users can belong to multiple groups (e.g., `administrators`, `moderators`, `registered-users`).
- **Privileges**: Fine-grained permissions managed per category or globally.

### CLI Management Commands
You can manage users directly from the terminal inside the `NodeBB/` directory:
```bash
# Create a new administrative user
./nodebb setup

# Reset a user's password
./nodebb reset -p NEW_PASSWORD UID_OR_USERNAME

# Make a user an administrator
./nodebb manage make-admin USERNAME
```

---

## 🗄️ 3. MongoDB Data Model

NodeBB uses a unique **Key-Value abstraction** on top of MongoDB. Almost all data is stored in a single collection named `objects`.

### Core Collection: `objects`
Every document in this collection has a `_key` field that determines its purpose.

#### 1. Hashes (Objects)
Used for storing detailed information about an entity.
- **User**: `user:<uid>` (e.g., `user:1`)
- **Category**: `category:<cid>` (e.g., `category:1`)
- **Topic**: `topic:<tid>` (e.g., `topic:5`)
- **Post**: `post:<pid>` (e.g., `post:10`)
- **Global Config**: `_key: "config"` stores the entire site configuration.

#### 2. Sorted Sets (ZSETs)
Used for rankings and lists with specific ordering.
- **Users by Join Date**: `users:joindate`
- **Topics in Category**: `cid:<cid>:tids` (sorted by last post time)
- **Posts in Topic**: `tid:<tid>:posts` (sorted by creation time)
- **Logic**: Stores `value` (the ID) and `score` (usually a timestamp or count).

#### 3. Sets
Simple lists of unique values.
- **Key Format**: `group:<groupname>:members`
- **Example**: `_key: "group:administrators:members"` stores the UIDs of all admins.

### Example MongoDB Queries
To inspect your data manually via the MongoDB shell:
```javascript
// Find user with UID 1
db.objects.findOne({ _key: "user:1" });

// Find all administrators
db.objects.find({ _key: "group:administrators:members" });

// Get total user count from global metadata
db.objects.findOne({ _key: "global" }, { nextUid: 1, userCount: 1 });
```

---

## 🚀 4. Working with the Codebase

If you are modifying the backend, keep these directories in mind:
- `src/database/`: Contains the MongoDB driver and key-value abstraction.
- `src/user/`: Core logic for registration, authentication, and profiles.
- `src/controllers/admin/`: Backend logic for dashboard pages.
- `public/`: Frontend assets and client-side scripts.

---

> [!TIP]
> Always run `./nodebb upgrade` after updating the code or installing new plugins to ensure the database schema and indices are up to date.
