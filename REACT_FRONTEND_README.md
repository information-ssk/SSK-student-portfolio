# SSK Student Portfolio - React + Vite Frontend

A modern, type-safe React + Vite frontend for managing student achievements at Sirisakesat School.

## Project Structure

```
src/
├── components/
│   ├── pages/
│   │   ├── HomePage.tsx          # Achievement grid with search & pagination
│   │   ├── LoginPage.tsx         # Login form with auth
│   │   ├── RecordPage.tsx        # Add/edit achievement form
│   │   └── ManagePage.tsx        # User's achievements management
│   ├── common/
│   │   ├── Header.tsx            # Navigation header
│   │   ├── Toast.tsx             # Toast notifications
│   │   ├── DetailModal.tsx       # Achievement detail view
│   │   ├── DeleteModal.tsx       # Delete confirmation modal
│   │   └── CompetitionForm.tsx   # Nested competition form
├── hooks/
│   ├── useAuth.ts                # Authentication state & logic
│   ├── useAchievements.ts        # Achievements data management
│   └── useToast.ts               # Toast notification state
├── services/
│   ├── api.ts                    # AppScript API integration (with retry logic)
│   └── types.ts                  # TypeScript interfaces & types
├── utils/
│   └── helpers.ts                # Pagination, formatting utilities
├── App.tsx                       # Main app component with page routing
├── main.tsx                      # React entry point
└── index.css                     # Tailwind CSS + custom styles
```

## Setup & Installation

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Install Dependencies
```bash
npm install
```

### Environment Configuration
Copy `.env.example` to `.env.local` and update values:
```bash
VITE_APPSCRIPT_URL=https://script.google.com/macros/d/YOUR_SCRIPT_ID/exec
VITE_SHEET_ID=YOUR_SHEET_ID
```

## Development

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

Output goes to `dist/` directory. Ready for deployment to Vercel or any static hosting.

## Key Features

### 🔐 Authentication
- Simple login with email, password, and department
- Token-based session management
- Admin role support
- Auto-login on page reload

### 📊 Achievement Management
- Browse all achievements with search & filtering
- Paginated grid view (9 items per page)
- Filter by competition level
- Create new achievements with complex competition data
- Nested competition form with validation
- File attachment support

### 💾 State Management
Custom React hooks for:
- **useAuth**: Login, logout, token validation, auth state
- **useAchievements**: Load, create, update, delete achievements
- **useToast**: Notification management

### 🎨 Styling
- Tailwind CSS for utility-first design
- Pink gradient background matching Canva site
- Responsive design (mobile-first)
- Custom animations & transitions
- Glass-morphism effects

### 🌐 API Integration
- Typed AppScript endpoint integration
- Automatic retry logic (3 retries with exponential backoff)
- Error handling & user feedback

## Testing Credentials

Default credentials for testing (matched with AppScript):
- **Admin**: admin / sskssk
- **User**: user / sskssk

## API Endpoints

The app integrates with Google Apps Script endpoints:

| Action | Method | Purpose |
|--------|--------|---------|
| `login` | POST | Authenticate user |
| `validateToken` | GET | Verify session token |
| `list` | GET | Fetch all achievements |
| `saveRecord` | POST | Create new achievement |
| `updateRecord` | POST | Update existing achievement |
| `deleteRecord` | GET | Delete achievement |
| `uploadFile` | POST | Upload file to Google Drive |

## Components Overview

### Pages
- **HomePage**: Main grid view with search, filter, pagination
- **LoginPage**: Auth form (email, password, department)
- **RecordPage**: Form to add/edit achievements with nested competitions
- **ManagePage**: User's achievements with edit/delete actions

### Common Components
- **Header**: Sticky navigation with auth status badge
- **DetailModal**: View full achievement details with file preview
- **DeleteModal**: Confirmation before deleting
- **CompetitionForm**: Add multiple competitions with level, result, coach, team info
- **Toast**: Auto-dismiss notifications (success, error, info)

## Performance Features
- Pagination to reduce DOM nodes
- Optimized re-renders with React.memo where applicable
- Lazy loading of images
- Code splitting with dynamic imports
- Tree-shaking unused code

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Static Hosting
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## Configuration via Environment

Update `.env.local`:
- `VITE_APPSCRIPT_URL`: Your Google Apps Script URL
- `VITE_SHEET_ID`: Your Google Sheet ID

## Troubleshooting

### CORS Issues
- Ensure AppScript is deployed as "Execute as" your account
- Verify deployment URL matches in `.env.local`

### File Upload Not Working
- Check Google Drive folder permissions
- Verify service account has access to folder
- Review AppScript logs

### Auth Not Persisting
- Check browser localStorage is enabled
- Verify token is being stored in session storage
- Check AppScript token validation endpoint

## Contributing

Follow these guidelines:
1. Create feature branches from `main`
2. Use TypeScript for all new code
3. Keep components focused and testable
4. Add proper error handling
5. Test in mobile view

## License

Internal use only - Sirisakesat School

---

**Built with ❤️ using React + Vite + TypeScript**
