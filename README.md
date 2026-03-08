# School Management System - Frontend

Modern Next.js 15 frontend with TypeScript, Tailwind CSS v4, and Zustand state management.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS (new @import syntax, no config file needed)
- **Zustand** - Lightweight state management with persistence
- **Axios** - HTTP client with interceptors
- **js-cookie** - Cookie management

## Folder Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── auth/
│   │   └── login/page.tsx       # Login page
│   ├── dashboard/page.tsx       # Protected dashboard
│   ├── layout.tsx               # Root layout with AuthProvider
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles with Tailwind v4
│
├── components/                   # Reusable components
│   ├── auth/
│   │   ├── AuthProvider.tsx     # Auth context provider
│   │   └── ProtectedRoute.tsx   # Role-based route protection
│   ├── layout/                  # Layout components (header, sidebar, etc.)
│   └── ui/                      # Reusable UI components
│
├── lib/                         # Utility functions
│   ├── api.ts                   # Axios instance with interceptors
│   └── auth.ts                  # Auth API functions
│
├── store/                       # Zustand stores
│   └── authStore.ts             # Authentication state
│
├── types/                       # TypeScript types
│   └── index.ts                 # Global type definitions
│
├── middleware.ts                # Next.js middleware for route protection
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
└── postcss.config.mjs           # PostCSS config for Tailwind
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Authentication Flow

### Login Process

1. User enters credentials on `/auth/login`
2. `authApi.login()` sends request to backend
3. Backend returns access token (stored in cookie) and user data
4. User data saved to Zustand store (persisted to localStorage)
5. Redirected to `/dashboard`

### Protected Routes

Two layers of protection:

1. **Server-side** (`middleware.ts`):
   - Checks for `accessToken` cookie
   - Redirects to `/auth/login` if missing

2. **Client-side** (`ProtectedRoute` component):
   - Checks user authentication from Zustand store
   - Checks user role against `allowedRoles` prop
   - Shows access denied if unauthorized

### Token Refresh

Automatic token refresh in `lib/api.ts`:
- Intercepts 401 responses
- Attempts to refresh token
- Retries original request with new token
- Redirects to login if refresh fails

## Usage Examples

### Basic Protected Route

```tsx
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

### Role-Based Protection

```tsx
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN"]}>
      <div>Admin-only content</div>
    </ProtectedRoute>
  );
}
```

### Using Auth Store

```tsx
"use client";

import { useAuthStore } from "@/store/authStore";

export function UserProfile() {
  const { user, hasRole, logout } = useAuthStore();

  return (
    <div>
      <p>Welcome, {user?.firstName}!</p>
      {hasRole("SUPER_ADMIN") && <AdminPanel />}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making API Calls

```tsx
import { api } from "@/lib/api";

// GET request
const students = await api.get("/students");

// POST request
const newStudent = await api.post("/students", {
  firstName: "John",
  lastName: "Doe",
});

// With query params
const results = await api.get("/students", {
  params: { page: 1, limit: 10 }
});
```

## Tailwind CSS v4

Tailwind v4 uses a new approach:

- No `tailwind.config.js` file needed
- Styles defined in `globals.css` using `@import "tailwindcss"`
- Custom theme variables using `@theme` directive

Example from `globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-success: #10b981;
}
```

## User Roles

- `SUPER_ADMIN` - Full system access
- `SCHOOL_ADMIN` - School management
- `TEACHER` - Class and student management
- `ACCOUNTANT` - Financial operations
- `SECRETARY` - Administrative tasks
- `COOK` - Kitchen management
- `OTHER_STAFF` - General staff
- `STUDENT` - Student portal access

## Next Steps

1. **Migrate HTML Template**: Place your template files in `app/` directory
2. **Create Components**: Build reusable UI components in `components/ui/`
3. **Add More Stores**: Create additional Zustand stores as needed
4. **API Integration**: Add service files in `lib/` for each module
5. **Build Pages**: Create pages for all features (students, teachers, etc.)

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Important Notes

- Always use `"use client"` directive for components using hooks
- Protected routes automatically redirect unauthorized users
- Tokens are automatically attached to all API requests
- User state persists across page refreshes
- Middleware blocks unauthenticated access at the server level
