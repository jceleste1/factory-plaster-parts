# Phase 10-11: QA Testing & Deployment Checklist

## Pre-Deployment Testing

### Functional Testing Checklist

#### Authentication (Phase 3)
- [ ] **Google OAuth Login**
  - [ ] Click "Sign in with Google"
  - [ ] Complete OAuth flow
  - [ ] User profile displays correctly
  - [ ] Token stored in localStorage
  
- [ ] **Session Persistence**
  - [ ] Refresh page - user remains logged in
  - [ ] Close and reopen browser - session restored
  - [ ] Token expires correctly (TTL check)
  
- [ ] **Logout**
  - [ ] Confirmation dialog appears
  - [ ] localStorage cleared
  - [ ] Redirected to login page
  - [ ] Cannot access protected routes

#### Dashboard (Phase 4)
- [ ] **Real-Time Updates**
  - [ ] Dashboard loads within 2 seconds
  - [ ] Stages display correct statuses
  - [ ] Batch counts update (30s polling works)
  - [ ] Production velocity shows live metrics
  
- [ ] **Status Indicators**
  - [ ] GREEN status displays for on-time stages
  - [ ] YELLOW for attention-needed stages
  - [ ] RED for urgent/overdue stages
  - [ ] Color contrast meets WCAG 2.1 AA (4.5:1)

#### Batch Traceability (Phase 5)
- [ ] **Batch Search**
  - [ ] Search works with ≥6 characters
  - [ ] Results display correctly
  - [ ] Batch details load on selection
  
- [ ] **Timeline View**
  - [ ] All 8 stages visible
  - [ ] Timestamps accurate
  - [ ] Duration calculations correct
  - [ ] Responsive on mobile/tablet/desktop

#### Quality Control (Phase 8)
- [ ] **Inspection Queue**
  - [ ] Batches in QUALITY stage display
  - [ ] Can select batch for inspection
  - [ ] Quality form renders correctly
  
- [ ] **Inspection Submission**
  - [ ] Can select PASS/FAIL/CONDITIONAL
  - [ ] Defect codes appear for FAIL
  - [ ] Can add defect details
  - [ ] Submission succeeds

#### Offline Mode (Phase 10)
- [ ] **Offline Detection**
  - [ ] Toggle WiFi off
  - [ ] OfflineBanner appears
  - [ ] App still functional
  
- [ ] **Offline Operations**
  - [ ] Can complete stages offline
  - [ ] Changes stored in IndexedDB
  - [ ] QueuedBadges show pending count
  
- [ ] **Sync on Reconnect**
  - [ ] Toggle WiFi on
  - [ ] PendingSyncBanner shows
  - [ ] Items sync automatically
  - [ ] Sync completes without errors

---

### Accessibility Testing (WCAG 2.1 AA)

#### Keyboard Navigation
- [ ] **Tab Navigation**
  - [ ] Tab order logical
  - [ ] Can reach all interactive elements
  - [ ] Focus indicator visible on all elements
  - [ ] Shift+Tab works (reverse navigation)
  
- [ ] **Keyboard Shortcuts**
  - [ ] Enter activates buttons
  - [ ] Space activates toggles
  - [ ] Escape closes modals/menus
  - [ ] Arrow keys navigate lists (if applicable)

#### Screen Reader Testing (NVDA/JAWS/VoiceOver)
- [ ] **Page Structure**
  - [ ] Landmarks announced (header, nav, main, footer)
  - [ ] Headings properly nested (h1 → h2 → h3)
  - [ ] Form labels associated with inputs
  - [ ] Required fields announced
  
- [ ] **Interactive Elements**
  - [ ] Buttons announce their purpose
  - [ ] Icon-only buttons have aria-labels
  - [ ] Links announce their destination
  - [ ] Status updates announced (aria-live)
  
- [ ] **Error Messages**
  - [ ] Errors announced immediately
  - [ ] Error text associated with fields
  - [ ] Recovery steps clear

#### Color & Contrast
- [ ] **Color Contrast** (min 4.5:1 for normal text)
  - [ ] Primary navy #003366 on white ✅ (14.3:1)
  - [ ] Secondary teal #00897B on white ✅ (7.2:1)
  - [ ] Status colors meet minimum
  - [ ] All text readable without color alone
  
- [ ] **Zoom & Text Sizing**
  - [ ] Page usable at 200% zoom
  - [ ] Text doesn't break or overlap
  - [ ] Readable without horizontal scroll

#### Mobile Accessibility
- [ ] **Touch Targets**
  - [ ] All buttons ≥44×44 px
  - [ ] Spacing between targets ≥8px
  - [ ] No touch errors on small screens
  
- [ ] **Orientation**
  - [ ] Works in portrait and landscape
  - [ ] Content doesn't lock to one orientation

---

### Performance Testing

#### Core Web Vitals
- [ ] **Largest Contentful Paint (LCP)** ≤ 2.5s
  - [ ] Run Lighthouse audit
  - [ ] Mobile score ≥80
  - [ ] Desktop score ≥90
  
- [ ] **First Input Delay (FID)** ≤ 100ms
  - [ ] Interactions responsive
  - [ ] No long main thread blocking
  
- [ ] **Cumulative Layout Shift (CLS)** ≤ 0.1
  - [ ] No unexpected layout shifts
  - [ ] Ads/images don't push content

#### Load Performance
- [ ] **Initial Load** < 2 seconds on 4G
  - [ ] Test with Lighthouse throttling
  - [ ] Bundle size < 500KB gzipped
  - [ ] Images optimized (WebP, sizes)
  
- [ ] **Time to Interactive** < 3 seconds
  - [ ] App responsive after load
  - [ ] Polling starts without blocking

#### Memory & Resources
- [ ] **Memory Leak Check**
  - [ ] Open DevTools → Memory
  - [ ] Take heap snapshot
  - [ ] Navigate and come back
  - [ ] Take another snapshot
  - [ ] Compare - no significant growth
  
- [ ] **Network Requests**
  - [ ] No duplicate requests
  - [ ] Request deduplication working
  - [ ] Cache headers correct

---

### Mobile Responsiveness Testing

#### Breakpoints (Tailwind)
- [ ] **Mobile (320-640px)**
  - [ ] Single column layout
  - [ ] Touch targets ≥44px
  - [ ] Text readable without zoom
  - [ ] Navigation hamburger menu works
  
- [ ] **Tablet (641-1024px)**
  - [ ] 2-3 column layout
  - [ ] Components properly spaced
  - [ ] Touch targets still comfortable
  
- [ ] **Desktop (1025px+)**
  - [ ] Full layout with sidebar
  - [ ] Proper spacing
  - [ ] Multi-column grids

#### Orientation Changes
- [ ] **Portrait to Landscape**
  - [ ] Layout adapts correctly
  - [ ] No content loss
  - [ ] Touch targets remain ≥44px
  
- [ ] **Landscape to Portrait**
  - [ ] Content reorganizes
  - [ ] Scrolling smooth

#### Device Testing
- [ ] iPhone SE (320px)
- [ ] iPhone 12 (390px)
- [ ] iPhone 14 Pro Max (430px)
- [ ] Samsung Galaxy S21 (360px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop 1440p
- [ ] Ultra-wide 1920p+

---

### Error Scenario Testing

#### Network Errors
- [ ] **Connection Lost**
  - [ ] Open dev tools → Network
  - [ ] Set throttling to "Offline"
  - [ ] Verify error message displays
  - [ ] Verify recovery options shown
  
- [ ] **Slow Network**
  - [ ] Set throttling to "Slow 4G"
  - [ ] Load page
  - [ ] Verify loading states
  - [ ] Verify no timeout errors
  
- [ ] **DNS Failure**
  - [ ] Block domain in hosts file
  - [ ] Verify error handling
  - [ ] Verify retry works

#### Server Errors
- [ ] **500 Internal Server Error**
  - [ ] Mock 500 response
  - [ ] Verify user-friendly message
  - [ ] Verify retry option
  
- [ ] **401 Unauthorized**
  - [ ] Mock 401 response
  - [ ] Verify redirect to login
  - [ ] Verify session cleared
  
- [ ] **403 Forbidden**
  - [ ] Mock 403 response
  - [ ] Verify access denied message
  - [ ] Verify graceful handling

#### Validation Errors
- [ ] **Invalid Form Input**
  - [ ] Submit empty form
  - [ ] Verify validation messages
  - [ ] Verify focus on error field
  
- [ ] **Invalid Batch ID**
  - [ ] Search for non-existent batch
  - [ ] Verify "not found" message
  - [ ] Verify can try again

---

### Offline Mode Testing

#### Offline Operations
- [ ] **Stage Completion Offline**
  - [ ] Toggle offline
  - [ ] Complete a stage
  - [ ] Verify stored in IndexedDB
  - [ ] Verify badge shows "1 pending"
  
- [ ] **Quality Inspection Offline**
  - [ ] Toggle offline
  - [ ] Submit quality inspection
  - [ ] Verify queued
  - [ ] Toggle online
  - [ ] Verify syncs automatically

#### Sync Recovery
- [ ] **Retry on Connection Restore**
  - [ ] Queue 3 items offline
  - [ ] Toggle online
  - [ ] Verify all 3 items sync
  - [ ] Verify no duplicates
  
- [ ] **Sync with Conflicts**
  - [ ] Queue update offline
  - [ ] Update same batch online (different client)
  - [ ] Toggle online
  - [ ] Verify conflict handled gracefully

---

## Deployment Checklist

### Pre-Deployment

#### Code Quality
- [ ] TypeScript compilation: `npm run build` ✅
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All tests passing: `npm run test` ✅
- [ ] Type coverage ≥90%
- [ ] No console.log() in production code
- [ ] No console.error() except for logging

#### Security
- [ ] Remove all API keys from code
- [ ] Environment variables configured
- [ ] `.env.example` shows all required vars
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] SQL injection prevention verified
- [ ] XSS protection verified
- [ ] CSRF tokens if needed

#### Configuration
- [ ] `VITE_API_BASE_URL` set correctly
- [ ] `VITE_GOOGLE_CLIENT_ID` valid
- [ ] Environment name set (prod/staging)
- [ ] Error tracking (Sentry) configured
- [ ] Logging level appropriate
- [ ] Analytics enabled/disabled correctly

### Deployment Steps

#### 1. Database Setup
```bash
# Run migrations
npm run migrate:latest

# Verify schema
npm run db:verify

# Backup existing data
npm run db:backup
```

#### 2. Build & Test
```bash
# Build production bundle
npm run build

# Run final tests
npm run test:ci

# Run e2e tests
npm run test:e2e
```

#### 3. Deploy Backend
```bash
# Deploy API server
npm run deploy:api

# Verify health check
curl https://api.example.com/health
```

#### 4. Deploy Frontend
```bash
# Deploy static assets
npm run deploy:web

# Verify deployment
curl https://app.example.com

# Test authentication flow
# Test dashboard loading
# Test batch search
```

#### 5. Post-Deployment Verification

**Smoke Tests:**
- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard displays data
- [ ] Can search batches
- [ ] Can complete stages
- [ ] Can submit quality inspections
- [ ] API health check passes

**Performance Check:**
- [ ] Lighthouse mobile ≥80
- [ ] Lighthouse desktop ≥90
- [ ] No 4xx/5xx errors
- [ ] Response times normal

**Security Check:**
- [ ] HTTPS working
- [ ] Security headers present
- [ ] No sensitive data in logs
- [ ] Rate limiting working

### Post-Deployment Monitoring

#### Error Tracking
- [ ] Sentry/error tracker receiving events
- [ ] No spike in error rate
- [ ] Review any new error patterns
- [ ] Set up alerts for critical errors

#### Performance Monitoring
- [ ] Google Analytics tracking
- [ ] Core Web Vitals dashboard showing data
- [ ] No performance regressions
- [ ] Database query times normal

#### User Activity
- [ ] Monitor login attempts
- [ ] Track feature usage
- [ ] Monitor offline usage
- [ ] Check sync success rate

#### Alert Configuration
- [ ] Alert on error rate > 1%
- [ ] Alert on response time > 5s
- [ ] Alert on database connection failure
- [ ] Alert on failed deployments

---

## Rollback Procedure

If critical issues found:

1. **Immediate Response**
   ```bash
   # Rollback to previous version
   npm run deploy:rollback
   
   # Verify rollback successful
   curl https://app.example.com
   ```

2. **Communication**
   - Notify team in Slack
   - Post status update
   - Document issue details

3. **Investigation**
   - Review error logs
   - Check database state
   - Review deployment diff
   - Run reproduction tests

4. **Fix & Redeploy**
   - Create hotfix branch
   - Test thoroughly
   - Deploy with caution
   - Monitor closely

---

## Success Criteria

✅ **System is Production-Ready when:**
- All functional tests pass
- Accessibility tests pass (WCAG 2.1 AA)
- Performance tests pass (Lighthouse ≥80 mobile, ≥90 desktop)
- Security audit passes
- All critical bugs fixed
- Staging environment verified
- Team sign-off obtained
- Runbook documented
- Monitoring configured
- Rollback procedure tested
