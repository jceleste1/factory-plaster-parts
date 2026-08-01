# Manufacturing Tracking System

A comprehensive real-time manufacturing tracking dashboard for gypsum tile production with batch traceability, role-based access, and offline support.

## Features

- **Real-Time Production Dashboard**: Monitor all 8 manufacturing stages with live batch counts and duration metrics
- **Batch Traceability**: Complete tracking from Planning through Shipping with immutable audit logs
- **Role-Based Access**: Different views and permissions for Workers, Supervisors, Managers, Quality Controllers, and Admins
- **Quality Inspection**: Track defects, approve batches, and maintain compliance records
- **Efficiency Reports**: Analyze bottlenecks and production velocity metrics
- **Offline Support**: Queue operations when offline, sync when connection restored
- **Mobile-First Design**: Fully responsive, touch-optimized interface for factory floor workers
- **WCAG 2.1 AA Accessibility**: Semantic HTML, keyboard navigation, color-blind friendly

## Tech Stack

- **Frontend**: React 18, TypeScript 5, Vite 5, TailwindCSS 3
- **State Management**: TanStack React Query (v5)
- **Forms**: React Hook Form + Zod validation
- **Authentication**: Google OAuth2
- **API Client**: Axios with interceptors
- **Icons**: Lucide React
- **Date Utilities**: date-fns
- **Styling**: TailwindCSS with custom design tokens

## Prerequisites

- Node.js 18+
- npm 9+
- Git

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `VITE_API_BASE_URL`: Backend API base URL (e.g., `http://localhost:3000/api`)
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth2 client ID

### 3. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Project Structure

```
src/
├── app/                      # Entry point & routing
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Vite entry point
│   └── routes.tsx            # Route definitions
├── pages/                    # Page-level components
├── features/                 # Feature modules (auth, dashboard, etc.)
├── shared/                   # Reusable components, hooks, utilities
├── layouts/                  # Layout wrapper components
├── config/                   # Configuration files
└── index.css                 # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types

## Development Guide

### Component Structure

Components follow these conventions:
1. **Functional components** with React hooks
2. **TypeScript** with explicit type annotations
3. **Single responsibility principle**: One component, one purpose
4. **Props interface** at the top of file
5. **Accessible markup**: Semantic HTML, ARIA labels, keyboard support

Example:

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}>
    {label}
  </button>
);
```

### Styling

- Use TailwindCSS utility classes (90% of cases)
- Custom CSS only when Tailwind cannot express the style
- Use CSS variables for theming (--color-primary, --color-success, etc.)
- Maintain 4.5:1 contrast ratio for WCAG 2.1 AA

### API Calls

- Use `axios` HTTP client from `src/shared/services/apiClient.ts`
- Use `@tanstack/react-query` for data fetching and caching
- Implement proper error handling and loading states
- All API calls include request/response logging

### Forms

- Use `react-hook-form` for form state management
- Use `zod` for schema validation
- Implement field-level error messages
- Ensure all form fields support keyboard navigation

## Testing

### Unit Tests (Vitest)

```bash
npm run test
```

### E2E Tests (Playwright)

```bash
npm run e2e
```

### Accessibility Audit

Manual audit checklist available at `tests/accessibility/WCAG-2.1-AA-checklist.md`

## Performance

- Core pages load in ≤2 seconds on 4G
- Lighthouse score target: ≥90 (desktop), ≥80 (mobile)
- Code bundle <500KB (gzipped)
- Dashboard updates within 30 seconds (configurable polling)

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation for all interactive elements
- Screen reader support with ARIA labels
- Color-blind friendly status indicators (color + icon)
- Touch targets minimum 44px × 44px

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile: iOS 12+, Android 8+

## Contributing

### Code Style

- Run `npm run format` before committing
- Run `npm run lint` to check for errors
- Run `npm run type-check` to verify types

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `chore:` Build/tooling changes

## License

© 2026 Manufacturing Inc. All rights reserved.

## Support

For issues or questions, contact the development team or open an issue in the project repository.
