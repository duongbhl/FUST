# FUST
# 🍜 Food Review Blog

Một web app blog review đồ ăn cho phép người dùng:
- Đăng bài review nhà hàng/quán ăn
- Vote & bình luận bài viết
- Tìm kiếm nhà hàng
- Xem đánh giá theo khu vực/danh mục
- Upload ảnh món ăn
- Quản lý hồ sơ cá nhân

---

# 👥 Team Structure

| Thành viên | Vai trò |
|---|---|
| Dương SL | Frontend Developer |
| Hải | Backend + Auth + DevOps |
| Hiếu | Backend + Reviews Module |
| Tài | Backend + Voting & Comments |
| Dương | Backend + Restaurants & Upload |

---

# 🛠️ Tech Stack

## Frontend
- Next.js
- TypeScript
- TailwindCSS
- React Query
- Zustand
- Axios
- TipTap / Quill
- Zod

## Backend
- Node.js
- Express.js / Next.js API
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Redis (optional)

## DevOps
- Docker Compose
- GitHub Actions
- Railway / Render
- Vercel

## Upload & External Services
- Cloudinary
- Google OAuth

---

# 📁 Project Structure

```bash
root/
├── frontend/
├── backend/
├── docs/
│   ├── API_CONTRACT.md
│   └── ERD.png
├── docker-compose.yml
└── README.md
```

---

# 🎨 Frontend Tasks — Dương SL

## Tuần 1 — Setup & Foundation

- Clone Blogar template, cleanup demo data
- Setup Next.js + TypeScript + TailwindCSS
- Customize theme theo branding đồ ăn
- Build layout chung:
  - NavBar
  - Footer
  - Sidebar
  - Dark mode
- Setup routing structure
- Setup React Query + Zustand
- Tạo `api.ts`
- Thống nhất API contract với Backend

---

## Tuần 2 — Auth & Home Page

### Pages
- `/login`
- `/register`
- `/profile`

### Features
- JWT/session handling
- Protected routes
- Hero slider
- Featured reviews
- Trending section
- `<ReviewCard />`
- Skeleton loaders

---

## Tuần 3 — Review List & Detail

### Pages
- `/category/[slug]`
- `/review/[slug]`

### Features
- Filter + pagination
- Markdown content render
- Image gallery
- Rating breakdown
- SEO meta tags
- Open Graph

---

## Tuần 4 — Write Review

### Page
- `/write`

### Features
- Rich text editor
- Image uploader
- Drag-drop upload
- Multi-upload preview
- Restaurant autocomplete
- Rating form
- Validation với Zod
- Draft / publish flow

---

## Tuần 5 — Voting & Comments

### Features
- Upvote/downvote
- Optimistic UI
- Nested comments
- Vote comment
- Real-time update
- Toast notifications

---

## Tuần 6 — Restaurant & Polish

### Pages
- `/restaurant/[slug]`
- `/search`
- `/profile/[username]`

### Features
- Restaurant map
- Search page
- Responsive mobile UI
- Error/loading states
- Deploy Vercel

---

# ⚙️ Backend Modules

---

# 👤 Hải — Auth & User Module + DevOps

## Database Tables
- `users`
- `user_sessions`

## APIs

```http
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/google
POST   /api/auth/refresh
GET    /api/users/:username
PUT    /api/users/me
```

## Responsibilities
- JWT + refresh token
- Password hashing (bcrypt)
- Auth middleware
- Rate limiting
- CI/CD setup
- Docker setup
- Deployment
- API contract documentation

---

# 🍜 Hiếu — Reviews Module

## Database Tables
- `reviews`
- `review_images`
- `categories`
- `tags`
- `review_tags`

## APIs

```http
GET    /api/reviews
GET    /api/reviews/:slug
POST   /api/reviews
PUT    /api/reviews/:id
DELETE /api/reviews/:id
GET    /api/reviews/trending
GET    /api/reviews/featured
GET    /api/categories
POST   /api/categories
```

## Responsibilities
- CRUD review
- Slug generation
- XSS sanitize
- Rating calculation
- Full-text search
- Pagination & sorting
- Soft delete

---

# 👍 Tài — Voting & Comments Module

## Database Tables
- `votes`
- `comments`

## APIs

```http
POST   /api/reviews/:id/vote
DELETE /api/reviews/:id/vote
GET    /api/reviews/:id/votes

GET    /api/reviews/:id/comments
POST   /api/reviews/:id/comments
PUT    /api/comments/:id
DELETE /api/comments/:id
POST   /api/comments/:id/vote
```

## Responsibilities
- Vote toggle logic
- Denormalized vote counters
- Trending score
- Nested comments
- Vote rate limit
- Anti-spam protection

---

# 🏪 Dương — Restaurants & Upload Module

## Database Tables
- `restaurants`
- `review_images`

## APIs

```http
GET    /api/restaurants
GET    /api/restaurants/:slug
POST   /api/restaurants
PUT    /api/restaurants/:id
GET    /api/restaurants/:id/reviews
GET    /api/restaurants/search

POST   /api/upload
DELETE /api/upload/:publicId
POST   /api/upload/multiple
```

## Responsibilities
- Cloudinary integration
- Upload validation
- Image moderation
- Geo search
- Restaurant autocomplete
- Seed demo restaurants

---

# 🤝 Team Responsibilities

| Task | Owner | Output |
|---|---|---|
| Finalize tech stack | All | Final architecture |
| Database ERD | Hiếu | ERD / Prisma schema |
| API Contract | Hải | `API_CONTRACT.md` |
| Backend boilerplate | Hải | Initial backend setup |
| Docker setup | Hải | `docker-compose.yml` |
| Code review workflow | All | PR review process |

---

# 📅 6-Week Roadmap

| Week | Frontend | Hải | Hiếu | Tài | Dương |
|---|---|---|---|---|---|
| 1 | Setup foundation | Auth setup | Reviews schema | Votes schema | Restaurant schema |
| 2 | Auth + Home | Complete auth API | Review CRUD | Vote API | Upload API |
| 3 | Review pages | Profile API | Search/filter | Comments API | Restaurant detail |
| 4 | Write review | Permission support | Trending logic | Nested comments | Seed data |
| 5 | Vote/comment UI | Global rate limit | Search optimization | Anti-cheat | Moderation |
| 6 | Polish + deploy | Production deploy | Bug fixing | Bug fixing | Bug fixing |

---

# 🌿 Git Workflow

## Branch Strategy

```bash
main
develop
feature/auth
feature/reviews
feature/comments
```

## Rules
- Mỗi feature → 1 branch
- PR vào `develop`
- Ít nhất 1 reviewer
- Merge `develop` → `main` cuối sprint

---

# 📌 Development Rules

## Daily Standup
- 15 phút mỗi sáng

## API Contract Deadline
- Hoàn thành cuối tuần 1

## Code Review
- Không tự merge PR của mình
- Review chéo giữa các module

## Priority
- FE cần API sớm
- Reviews module là critical path

---

# ⚠️ Risks

## 1. Frontend workload rất lớn
Dương làm solo toàn bộ FE nên cần:
- API contract sớm
- Mock API nếu BE chậm
- Có thể cắt feature:
  - Advanced search
  - Nested comments sâu
  - Restaurant map

---

## 2. Reviews module là core system
Nếu Reviews API chậm:
- FE bị block
- Vote system bị block
- Search bị block

---

## 3. Upload & search khá phức tạp
Cần:
- Validation tốt
- Rate limit
- CDN optimization

---

# 🚀 MVP Features

## Core Features
- Authentication
- CRUD reviews
- Upload images
- Vote system
- Comments
- Restaurant pages
- Search

## Nice-to-have
- Real-time updates
- Geo search
- AI moderation
- Advanced search filters

---

# 📦 Deployment

## Frontend
- Vercel

## Backend
- Railway / Render

## Database
- PostgreSQL

## Storage
- Cloudinary

---

# 📄 Important Documents

| File | Purpose |
|---|---|
| `README.md` | Project overview |
| `API_CONTRACT.md` | API documentation |
| `schema.prisma` | Database schema |
| `docker-compose.yml` | Local development |
| `.env.example` | Environment variables |

---

# 🧪 Future Improvements

- Recommendation system
- AI-generated summaries
- Restaurant owner dashboard
- Push notifications
- Mobile app version

---

# ✅ Project Goal

Xây dựng một nền tảng review đồ ăn hiện đại, responsive, UX tốt và có khả năng mở rộng lâu dài.
