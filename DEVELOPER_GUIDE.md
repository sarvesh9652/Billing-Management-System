# Developer Guide - Billing Management System PWA

## Architecture Overview

This application follows Angular 20 best practices with standalone components, lazy loading, and a modular architecture.

### Core Principles

1. **Standalone Components**: All components are standalone (no NgModules)
2. **Lazy Loading**: Routes use dynamic imports for code splitting
3. **Reactive Programming**: RxJS for async operations
4. **Type Safety**: Strict TypeScript with interfaces
5. **Separation of Concerns**: Services for business logic, components for UI

## Project Structure Deep Dive

### Models (`src/app/models/index.ts`)

Centralized type definitions:
- `User`, `LoginRequest`, `RegisterRequest`, `AuthResponse`
- `Customer`, `LineItem`, `Invoice`, `InvoiceStatus`
- `DashboardMetrics`, `ReportFilter`

### Services (`src/app/services/`)

Each service handles a specific domain:
- `AuthService`: Authentication state, JWT management
- `InvoiceService`: Invoice CRUD operations
- `CustomerService`: Customer CRUD operations
- `ReportService`: Dashboard metrics, report exports

### Guards (`src/app/guards/auth.guard.ts`)

- `AuthGuard`: Protects authenticated routes
- `LoginGuard`: Redirects authenticated users from login/register

### Interceptors (`src/app/interceptors/auth.interceptor.ts`)

Automatically attaches JWT token to outgoing requests.

### Components (`src/app/components/`)

Organized by feature:
- `auth/`: Login, Register
- `dashboard/`: Main dashboard with metrics
- `invoice/`: List, Form (create/edit), Detail
- `customer/`: List, Form (create/edit)
- `reports/`: Report generation and export

## Key Implementation Details

### Authentication Flow

```typescript
// AuthService handles:
// 1. Login/Register API calls
// 2. JWT storage in localStorage
// 3. Token expiration checking
// 4. User state via BehaviorSubject
// 5. Automatic logout on expiry
```

### Invoice Form Calculations

The invoice form (`invoice-form.component.ts`) handles:
- Dynamic line items (add/remove)
- Real-time total calculation
- Tax rate percentage
- Discount amounts
- Subtotal, tax, total computation

### Responsive Design

All components use:
- CSS Grid/Flexbox for layouts
- Media queries for breakpoints (768px, 1024px)
- Angular Material's responsive utilities
- Mobile-first approach

### PWA Configuration

`ngsw-config.json` defines:
- **App group**: Prefetch all app shell resources
- **Assets group**: Lazy load images/fonts
- **API group**: Cache API responses with freshness strategy
- **Navigation**: Fallback to index.html for SPA routing

## Adding New Features

### 1. Create Model
```typescript
// src/app/models/new-feature.ts
export interface NewFeature {
  id: number;
  name: string;
  // ...
}
```

### 2. Create Service
```typescript
// src/app/services/new-feature.service.ts
@Injectable({ providedIn: 'root' })
export class NewFeatureService {
  constructor(private http: HttpClient) {}
  
  getItems(): Observable<NewFeature[]> {
    return this.http.get<NewFeature[]>('/api/new-feature');
  }
}
```

### 3. Create Components
```bash
# Create component files manually or use Angular CLI
ng generate component components/new-feature/new-feature-list --standalone
ng generate component components/new-feature/new-feature-form --standalone
```

### 4. Add Routes
```typescript
// src/app/app.routes.ts
{
  path: 'new-feature',
  loadComponent: () => import('./components/new-feature/new-feature-list.component')
    .then(m => m.NewFeatureListComponent),
  canActivate: [AuthGuard]
}
```

### 5. Update Navigation
Add to sidenav in `app.ts`:
```html
<a mat-list-item routerLink="/new-feature" routerLinkActive="active-link">
  <mat-icon matListItemIcon>icon_name</mat-icon>
  <span matListItemTitle>New Feature</span>
</a>
```

## Testing Strategy

### Unit Tests
- Test services with HttpTestingController
- Test components with TestBed
- Mock dependencies with Jasmine spies

### Integration Tests
- Test routing with RouterTestingModule
- Test guard behavior
- Test interceptor token attachment

### E2E Tests (Cypress/Playwright)
- Critical user flows: login, create invoice, generate report
- PWA installation flow
- Offline functionality

## Performance Best Practices

1. **Lazy Loading**: All feature routes use dynamic imports
2. **OnPush Change Detection**: Add to components where possible
3. **TrackBy Functions**: Use in *ngFor for lists
4. **Pure Pipes**: For data transformations
5. **Bundle Analysis**: Run `npm run build -- --stats-json` and analyze with webpack-bundle-analyzer

## Debugging Tips

### Service Worker Debugging
```javascript
// In browser console
navigator.serviceWorker.ready.then(reg => {
  console.log('SW active:', reg.active);
});

// Check cache
caches.keys().then(keys => keys.forEach(key => 
  caches.open(key).then(cache => cache.keys().then(console.log))
));
```

### Angular DevTools
Install Angular DevTools browser extension for:
- Component tree inspection
- Change detection profiling
- Router state visualization

### Network Tab
- Check for `ngsw-worker.js` registration
- Verify API requests include Authorization header
- Monitor cache hits/misses

## Common Issues & Solutions

### "Module not found" errors
- Check import paths (use relative or @angular/*)
- Verify package.json dependencies
- Run `npm install` after adding packages

### Service Worker not updating
- Unregister in DevTools > Application > Service Workers
- Clear site data
- Hard reload (Ctrl+Shift+R)

### Material theme not applying
- Ensure `@include mat.all-component-themes($theme)` in styles.scss
- Check component imports include Mat*Module
- Verify no conflicting global styles

### JWT token issues
- Check token format (Bearer prefix)
- Verify token not expired (check exp claim)
- Ensure interceptor is provided in app.config.ts

## Build & Deployment

### Development Build
```bash
ng serve
# or
npm start
```

### Production Build
```bash
ng build --configuration production
# Output: dist/billing-management-system/
```

### Analyze Bundle
```bash
ng build --stats-json
npx webpack-bundle-analyzer dist/billing-management-system/stats.json
```

### Docker Build
```bash
docker build -t bms-pwa .
docker run -p 80:80 bms-pwa
```

## Code Style Guidelines

### TypeScript
- Use interfaces over types for object shapes
- Prefer `const` over `let`
- Use strict null checks
- Avoid `any` - use `unknown` or proper types

### Angular
- Standalone components only
- Use `inject()` function for DI in functions
- Prefer signals for local state (Angular 17+)
- Use `computed()` for derived state

### RxJS
- Use operators: `map`, `filter`, `switchMap`, `catchError`
- Avoid nested subscriptions
- Use `async` pipe in templates
- Unsubscribe in `ngOnDestroy` or use `takeUntil`

### SCSS
- Use Material theming functions
- Follow BEM-like naming for custom classes
- Use CSS custom properties for theming
- Mobile-first media queries

## Extending the Application

### Adding Charts
1. Install: `npm install chart.js ng2-charts`
2. Import in component: `import { BaseChartDirective } from 'ng2-charts'`
3. Add to component imports
4. Configure chart data/options

### Adding PDF Export
1. Already configured with jsPDF + autoTable
2. Use in service: `import * as jsPDF from 'jspdf'`
3. AutoTable: `import 'jspdf-autotable'`

### Adding Internationalization
1. `ng add @angular/localize`
2. Mark strings with `$localize`
3. Extract: `ng extract-i18n`
4. Translate XLIFF files

## Monitoring & Analytics

Consider adding:
- **Error Tracking**: Sentry, LogRocket
- **Analytics**: Google Analytics, Matomo
- **Performance**: Web Vitals, Lighthouse CI
- **Uptime**: Pingdom, UptimeRobot

## Security Checklist

- [ ] HTTPS enforced in production
- [ ] JWT stored securely (consider httpOnly cookies)
- [ ] API rate limiting
- [ ] Input sanitization
- [ ] CORS properly configured
- [ ] Content Security Policy headers
- [ ] Regular dependency updates (`npm audit`)

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Follow code style guidelines
4. Write tests for new functionality
5. Ensure build passes: `ng build`
6. Submit pull request

## Resources

- [Angular Documentation](https://angular.dev)
- [Angular Material](https://material.angular.dev)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [RxJS Operators](https://rxjs.dev/guide/operators)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)