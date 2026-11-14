# Billing Management System - Progressive Web App

A modern, full-featured Progressive Web App (PWA) for billing and invoice management built with Angular 20, Angular Material, and service workers for offline capabilities.

## Features

- **User Authentication**: Local demo registration and login
- **Dashboard**: Billing metrics, locally rendered charts, and recent activity
- **Invoice Management**: Create, edit, delete invoices with line items, tax calculations, and status tracking
- **Customer Management**: Full CRUD operations with search functionality
- **Reports & Analytics**: Generate local revenue, outstanding, customer history, and invoice reports as PDF or CSV
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **PWA Support**: Offline capabilities, installable, service worker caching
- **Modern UI**: Angular Material with custom theming

## Tech Stack

- **Framework**: Angular 20 (Standalone Components)
- **UI Library**: Angular Material 20
- **Charts**: Angular-rendered billing charts
- **PDF Generation**: jsPDF
- **Authentication**: Local demo authentication (not production-secure)
- **PWA**: Angular Service Worker
- **Styling**: SCSS with Material theming
- **Language**: TypeScript 5.x

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or yarn
- Angular CLI 20+

## Installation

```bash
# Clone the repository
cd "C:\Sarvesh\PWA\Billing Management System"

# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at `http://localhost:4200`

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth/           # Login & Register components
│   │   ├── dashboard/      # Dashboard with metrics & charts
│   │   ├── invoice/        # Invoice list, form, detail
│   │   ├── customer/       # Customer list & form
│   │   └── reports/        # Reports & export functionality
│   ├── services/           # API services (auth, invoice, customer, report)
│   ├── guards/             # Route guards (auth, login)
│   ├── interceptors/       # HTTP interceptors (auth token)
│   ├── models/             # TypeScript interfaces
│   ├── app.config.ts       # Application configuration
│   ├── app.routes.ts       # Routing configuration
│   └── app.ts              # Root component
├── assets/
public/
└── icons/                  # PWA icons
├── styles.scss             # Global styles & Material theme
└── index.html              # Main HTML template
```

## Configuration

### Service Worker

The PWA is configured via `ngsw-config.json` with:
- App shell caching (prefetch)
- Static asset and PWA icon caching (prefetch)
- Navigation fallback for offline support

### Color Theme

Custom theme defined in `styles.scss`:
- Primary: Indigo (#3346a8)
- Accent: Teal (#087f82)
- Status colors: Green, amber, and red

## Local Demo Data

The app does not require an API. Users, customers, and invoices are stored in browser `localStorage` and remain on that browser. The seeded demo account is `demo@billing.app` / `demo123`. Local demo authentication is not a secure substitute for a production identity provider or server-issued JWT.

## Building for Production

```bash
# Build production bundle
npm run build

# The output will be in dist/billing-management-system/
```

### PWA Production Checklist

1. **HTTPS Required**: Service workers only work over HTTPS (or localhost)
2. **Icons**: Replace placeholder icons in `src/assets/icons/` with actual PNG files
3. **Manifest**: Verify `manifest.webmanifest` has correct URLs
4. **Service Worker**: Test offline functionality in production

## Testing

```bash
# Run unit tests
npm test

# Run e2e tests (if configured)
npm run e2e
```

## Deployment

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/billing-management-system /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Static Hosting (Netlify, Vercel, Firebase)

1. Build: `npm run build`
2. Deploy `dist/billing-management-system/` folder
3. Configure redirects for SPA routing

## Security Considerations

- Demo authentication data is stored in localStorage and is not suitable for production
- Route guards protect authenticated routes
- Input validation is applied to forms
- Add server-side authentication, authorization, and validation before production use

## Performance Optimization

- Lazy-loaded routes for code splitting
- OnPush change detection (where applicable)
- Service worker caching strategies
- Optimized bundle sizes with production build
- Image optimization for icons

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

## Troubleshooting

### Service Worker Not Registering
- Ensure HTTPS (or localhost)
- Check browser console for errors
- Verify `ngsw-worker.js` is served correctly

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Angular CLI version matches project: `ng version`

### PWA Not Installable
- Verify manifest.json is accessible
- Check all required icons exist under `public/icons/`
- Ensure service worker is registered
- Test with Lighthouse PWA audit

## Development Guidelines

### Code Style
- Use standalone components
- Follow Angular style guide
- Use reactive forms for complex forms
- Implement OnPush change detection where possible
- Use RxJS operators for async operations

### Adding New Features
1. Create models in `src/app/models/`
2. Add service in `src/app/services/`
3. Create components in `src/app/components/`
4. Add routes in `app.routes.ts`
5. Update navigation in `app.ts`

## License

MIT License - feel free to use for personal or commercial projects.

## Support

For issues and feature requests, please create an issue in the repository.
