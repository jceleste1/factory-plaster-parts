# Phase 10 & 11: Mobile Optimization & Polish Implementation Guide

## Phase 10: Mobile-First Dashboard Experience (T148-T165)

### Key Objectives
1. **Responsive Design** - Work seamlessly across 320px-1920px
2. **Touch Optimization** - 44px+ touch targets, gesture support
3. **Performance** - Core Web Vitals compliance
4. **Offline Mode** - Full offline-first experience

### Responsive Breakpoints (Tailwind)

```
Mobile:   320px-640px    (sm: prefix)
Tablet:   641px-1024px   (md: prefix)  
Desktop:  1025px-1920px  (lg: prefix)
```

### Touch Target Sizing
- **Minimum**: 44px × 44px (WCAG 2.5.5)
- **Preferred**: 48px × 48px
- **Spacing**: 8px minimum between targets

### T148-T155: Mobile Dashboard Implementation

```typescript
// src/pages/DashboardPage.mobile.tsx
const MobileStageView = () => {
  return (
    <div className="space-y-4 pb-20">
      {/* Horizontal scrollable stages */}
      <div className="flex overflow-x-auto gap-3 px-4">
        {stages.map(stage => (
          <MobileStageCard key={stage.id} stage={stage} />
        ))}
      </div>
      
      {/* Tap to see details */}
      <button className="w-12 h-12 rounded-full bg-blue-600" />
    </div>
  )
}
```

### T156-T158: Performance Optimization

```typescript
// Code splitting
const DashboardPage = lazy(() => import('./DashboardPage'))
const BatchDetailPage = lazy(() => import('./BatchDetailPage'))

// Image optimization
<img 
  src={imageUrl}
  sizes="(max-width: 768px) 100vw, 50vw"
  srcSet={srcSet}
  loading="lazy"
/>

// Component memoization
const StageCard = React.memo(({ stage }) => {
  return <div>{stage.name}</div>
})
```

### T159-T162: Offline Mode UI

```typescript
// Offline indicator banner
const OfflineBanner = () => {
  const { isOnline } = useConnectionStatus()
  
  if (isOnline) return null
  
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      <p className="text-amber-900 text-sm font-medium">
        📡 Offline Mode - Changes will sync when online
      </p>
    </div>
  )
}

// Queued items indicator
const QueuedBadge = ({ count }) => {
  if (count === 0) return null
  return (
    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
      {count} pending
    </span>
  )
}
```

### T163-T165: Mobile Forms & Interactions

```typescript
// Mobile-optimized form
<form className="space-y-4">
  <input 
    className="w-full p-4 border rounded-lg text-base"
    type="text"
  />
  <button className="w-full py-4 bg-blue-600 text-white font-medium">
    Submit
  </button>
</form>

// Swipe gestures
const useSwipeGesture = () => {
  const [startX, setStartX] = useState(0)
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
  }
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX
    if (endX < startX - 50) {
      // Swiped left
    } else if (endX > startX + 50) {
      // Swiped right
    }
  }
  
  return { handleTouchStart, handleTouchEnd }
}
```

---

## Phase 11: Polish & Cross-Cutting Concerns (T166-T184)

### T166-T170: Accessibility (WCAG 2.1 AA)

```typescript
// Color contrast (4.5:1 minimum)
// ✅ Primary navy #003366 on white = 14.3:1
// ✅ Secondary teal #00897B on white = 7.2:1

// Semantic HTML
<section aria-label="Production Dashboard">
  <h1>Dashboard</h1>
  <button aria-label="Refresh dashboard data">
    <RefreshIcon aria-hidden="true" />
  </button>
</section>

// Form associations
<label htmlFor="batch-search">Search Batch ID</label>
<input id="batch-search" type="text" />

// ARIA live regions
<div role="status" aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Focus management
useEffect(() => {
  focusRef.current?.focus()
}, [shouldFocus])

// Focus visible styling
button:focus-visible {
  outline: 2px solid #003366;
  outline-offset: 2px;
}
```

### T171-T173: Error Handling & Recovery

```typescript
// Error boundary with recovery
<ErrorBoundary fallback={<ErrorRecovery />}>
  <DashboardPage />
</ErrorBoundary>

// Retry logic with exponential backoff
const useRetryQuery = (queryFn, maxRetries = 3) => {
  const [retryCount, setRetryCount] = useState(0)
  
  const handleRetry = async () => {
    try {
      await queryFn()
      setRetryCount(0)
    } catch (error) {
      if (retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)
        setTimeout(() => setRetryCount(prev => prev + 1), delay)
      }
    }
  }
  
  return { handleRetry, retryCount }
}

// User-friendly error messages
const ErrorMessages = {
  NETWORK_ERROR: 'Unable to connect. Check your internet and try again.',
  SERVER_ERROR: 'Server is experiencing issues. Please try again later.',
  UNAUTHORIZED: 'Your session expired. Please log in again.',
  VALIDATION_ERROR: 'Invalid data. Please check and try again.',
}
```

### T174-T176: Testing Strategy

```typescript
// Unit test example
describe('StageCard', () => {
  it('should render stage with correct status color', () => {
    const stage = { name: 'Mixing', status: 'GREEN' }
    render(<StageCard stage={stage} />)
    expect(screen.getByText('Mixing')).toHaveClass('text-green-600')
  })
})

// Integration test example
describe('DashboardPage', () => {
  it('should display real-time updates', async () => {
    render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText(/batches/i)).toBeInTheDocument()
    })
  })
})

// Accessibility test
describe('Navigation', () => {
  it('should be keyboard navigable', () => {
    render(<Navigation />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach(btn => {
      expect(btn).toHaveAttribute('aria-label')
    })
  })
})

// Performance test
describe('DashboardPage Performance', () => {
  it('should load within 2 seconds on 4G', () => {
    const start = performance.now()
    render(<DashboardPage />)
    const duration = performance.now() - start
    expect(duration).toBeLessThan(2000)
  })
})
```

### T177-T179: Documentation

```typescript
/**
 * Fetches production dashboard data with real-time updates
 * 
 * @example
 * const { data, isLoading } = useProductionStatus()
 * return <Dashboard stages={data?.stages} />
 * 
 * @returns {Object} Dashboard data with loading/error states
 * @throws {Error} Network or validation errors
 */
export const useProductionStatus = () => { ... }

/**
 * StageCard Component
 * 
 * Displays a single manufacturing stage with status indicator
 * 
 * Props:
 * - stage: Stage object with name, status, batch_count
 * - onClick?: Callback when stage is clicked
 * 
 * Responsive:
 * - Mobile: Stacked vertically, full width
 * - Tablet: 2 columns
 * - Desktop: 3+ columns
 */
export const StageCard: React.FC<StageCardProps> = ({ stage, onClick }) => { ... }
```

### T180-T182: Production Readiness Checks

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: dbConnection.isActive(),
    cache: cacheConnection.isActive(),
  }
  res.json(health)
})

// Security headers
app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))

// Monitoring & logging
import pino from 'pino'
const logger = pino()
logger.info({ endpoint: '/batches', duration: 45 }, 'Request processed')

// Error tracking
import * as Sentry from "@sentry/node"
Sentry.init({ dsn: process.env.SENTRY_DSN })
```

### T183-T184: Final Sign-Off & Deployment

```typescript
// Build verification
npm run build                  # TypeScript compilation
npm run type-check            # Full type checking
npm run lint                  # ESLint/Prettier
npm run test                  # Unit + integration tests
npm run test:e2e              # End-to-end tests

// Performance benchmarks
Lighthouse Score: ≥80 mobile, ≥90 desktop
Largest Contentful Paint (LCP): ≤2.5s
First Input Delay (FID): ≤100ms
Cumulative Layout Shift (CLS): ≤0.1

// Deployment checklist
✅ Environment variables configured
✅ Database migrations applied
✅ SSL certificates valid
✅ Backup strategy in place
✅ Monitoring alerts configured
✅ Incident response plan documented
```

---

## Implementation Checklist

### Phase 10: Mobile Optimization
- [ ] T148: Mobile dashboard layout
- [ ] T149: Touch-optimized components
- [ ] T150: Responsive navigation
- [ ] T151: Mobile forms
- [ ] T152: Gesture support (swipe, tap)
- [ ] T153: Offline indicators
- [ ] T154: Mobile performance
- [ ] T155: Mobile testing
- [ ] T156: Code splitting
- [ ] T157: Image optimization
- [ ] T158: Lazy loading
- [ ] T159: Offline queue UI
- [ ] T160: Sync indicators
- [ ] T161: Pending state badges
- [ ] T162: Retry UI components
- [ ] T163: Mobile form validation
- [ ] T164: Touch-friendly modals
- [ ] T165: Mobile accessibility

### Phase 11: Polish & Documentation
- [ ] T166: WCAG 2.1 AA audit
- [ ] T167: Keyboard navigation
- [ ] T168: Screen reader testing
- [ ] T169: Focus management
- [ ] T170: Color contrast verification
- [ ] T171: Error scenarios
- [ ] T172: Retry/recovery flows
- [ ] T173: Edge case handling
- [ ] T174: Unit test coverage
- [ ] T175: Integration testing
- [ ] T176: Performance testing
- [ ] T177: Component documentation
- [ ] T178: API documentation
- [ ] T179: User guides
- [ ] T180: Health checks
- [ ] T181: Security hardening
- [ ] T182: Monitoring setup
- [ ] T183: Deployment process
- [ ] T184: Go-live sign-off

---

## Quick Reference: Responsive Patterns

### Layout Patterns

```typescript
// Mobile-first grid
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

// Responsive spacing
<div className="px-4 sm:px-6 md:px-8 lg:px-12 py-2 sm:py-4 md:py-6">

// Mobile-first text
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">

// Hide/show by breakpoint
<div className="hidden sm:block md:hidden lg:block">
  {/* Only visible on small and large screens */}
</div>
```

### Touch Optimization

```typescript
// Button sizing
<button className="min-h-[44px] min-w-[44px] px-4 py-3">

// Spacing between buttons
<div className="space-y-2 sm:space-y-3 md:space-y-4">

// Tap feedback
button:active {
  opacity: 0.8;
  transform: scale(0.98);
}

// Long-press menu
onContextMenu={handleLongPress}
onLongPress={handleLongPress}
```

### Accessibility Quick Wins

```typescript
// Always add aria-labels to icon-only buttons
<button aria-label="Close menu">
  <XIcon />
</button>

// Use semantic HTML
<section>, <article>, <nav>, <main>

// Focus styles
button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

// Skip to main content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

---

## Success Criteria

### Phase 10 Success
✅ All pages responsive from 320px-1920px
✅ All touch targets ≥44px
✅ Lighthouse score ≥80 mobile
✅ Offline mode works fully
✅ Core Web Vitals all green

### Phase 11 Success
✅ WCAG 2.1 AA compliance
✅ All error scenarios handled
✅ 100% critical path tested
✅ Full documentation complete
✅ Ready for production deployment
