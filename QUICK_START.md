# Quick Start Guide

## ✅ Setup Complete!

Your Next.js frontend is ready with:
- ✅ TypeScript configured
- ✅ Tailwind CSS v4 set up (no config file needed!)
- ✅ Zustand state management with persistence
- ✅ Axios API client with auto token refresh
- ✅ Protected routes (server + client-side)
- ✅ Authentication flow ready
- ✅ Role-based access control

## 🚀 Run the Frontend

```bash
cd frontend
npm run dev
```

Visit: **http://localhost:3000**

## 📁 Key Files to Know

### Authentication
- `store/authStore.ts` - User state management
- `lib/api.ts` - API client with interceptors
- `lib/auth.ts` - Auth API functions
- `middleware.ts` - Server-side route protection
- `components/auth/ProtectedRoute.tsx` - Client-side protection

### Pages
- `app/page.tsx` - Home page
- `app/auth/login/page.tsx` - Login page
- `app/dashboard/page.tsx` - Protected dashboard

### Configuration
- `.env.local` - API URL configuration
- `app/globals.css` - Tailwind v4 setup
- `tsconfig.json` - TypeScript config

## 🔐 Testing Authentication

1. Start backend: `cd backend && npm run dev` (port 3001)
2. Start frontend: `cd frontend && npm run dev` (port 3000)
3. Go to http://localhost:3000/auth/login
4. Login with your backend credentials
5. You'll be redirected to the protected dashboard

## 🎨 Migrating Your HTML Template

1. **Place template in `app/` directory**:
   ```
   app/
   ├── students/page.tsx
   ├── teachers/page.tsx
   ├── classes/page.tsx
   etc...
   ```

2. **Extract reusable components**:
   ```
   components/
   ├── layout/
   │   ├── Sidebar.tsx
   │   ├── Header.tsx
   │   └── Footer.tsx
   └── ui/
       ├── Button.tsx
       ├── Card.tsx
       └── Table.tsx
   ```

3. **Convert CSS classes to Tailwind**:
   - Your template uses regular CSS
   - Replace with Tailwind utility classes
   - Example: `class="btn btn-primary"` → `className="px-4 py-2 bg-blue-600 text-white rounded"`

4. **Add protection to pages**:
   ```tsx
   import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
   
   export default function StudentsPage() {
     return (
       <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]}>
         {/* Your template content */}
       </ProtectedRoute>
     );
   }
   ```

## 🔧 Useful Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

## 📦 Folder Structure Template

When migrating, organize like this:

```
app/
├── (auth)/                    # Auth pages (grouped route)
│   ├── login/
│   └── register/
├── (dashboard)/               # Dashboard pages (grouped route)
│   ├── layout.tsx            # Shared layout for dashboard
│   ├── page.tsx              # Dashboard home
│   ├── students/
│   ├── teachers/
│   ├── classes/
│   ├── attendance/
│   ├── exams/
│   ├── payments/
│   └── library/
└── layout.tsx                 # Root layout

components/
├── layout/
│   ├── DashboardLayout.tsx   # Main dashboard layout
│   ├── Sidebar.tsx           # Navigation sidebar
│   └── Header.tsx            # Top navigation
└── ui/                       # Reusable UI components

lib/
├── api.ts                    # Base API client
└── services/                 # API service functions
    ├── students.ts
    ├── teachers.ts
    ├── classes.ts
    etc...

store/
├── authStore.ts
├── studentsStore.ts          # Add more stores as needed
└── classesStore.ts
```

## 💡 Pro Tips

1. **Use "use client" directive** for components with hooks:
   ```tsx
   "use client";
   import { useState } from "react";
   ```

2. **Check user roles in components**:
   ```tsx
   const { hasRole } = useAuthStore();
   {hasRole("SUPER_ADMIN") && <AdminButton />}
   ```

3. **Make API calls with type safety**:
   ```tsx
   import { api } from "@/lib/api";
   import type { Student } from "@/types";
   
   const students = await api.get<Student[]>("/students");
   ```

4. **Use middleware for server-side redirects**:
   - Already configured in `middleware.ts`
   - Automatically redirects unauthenticated users

5. **Tailwind v4 custom colors**:
   - Edit `app/globals.css` @theme section
   - Use like: `bg-primary`, `text-success`

## 🐛 Troubleshooting

### "Module not found" errors
```bash
npm install
```

### Tailwind classes not working
- Make sure `@import "tailwindcss"` is in `globals.css`
- Check `postcss.config.mjs` exists

### API calls failing
- Verify backend is running on port 3001
- Check `.env.local` has correct API URL
- Open browser DevTools → Network tab to debug

### Auth not persisting
- Check browser cookies (should see `accessToken`)
- Check localStorage (should see `auth-storage`)
- Clear browser data and try again

## 📚 Next Steps

1. ✅ Test authentication with backend
2. 📝 Create types for your API responses in `types/`
3. 🎨 Start migrating template pages
4. 🔧 Build reusable UI components
5. 🌐 Add API service functions for each module
6. 📊 Create Zustand stores for complex state

Happy coding! 🚀
