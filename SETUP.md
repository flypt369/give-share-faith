# Give ✝ Share Platform - Setup Guide

## Overview

Give ✝ Share is a full-stack, accessible, multilingual, faith-rooted mutual aid platform serving the NYC/Tri-State area. The platform connects neighbors in need with those who can give—individuals, churches, small businesses, foundations, and corporations—while offering prayer support and hyperlocal resource matching.

## Prerequisites

- Node.js 18+ and npm
- Access to Supabase project (already configured)

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Apply Database Migrations**

   The database schema is defined in `supabase/migrations/20250101000000_init_give_share_platform.sql`. This file needs to be applied to your Supabase database.

   To apply the migration, you have several options:
   - Use the Supabase Dashboard SQL Editor to copy and run the migration file
   - Use the Supabase CLI if available
   - The migration includes all necessary tables, security policies, and sample data

3. **Configure Environment Variables**

   Update the `.env` file with your actual 501(c)(3) EIN:
   ```env
   VITE_ORGANIZATION_EIN=your-actual-ein-here
   ```

   The Supabase credentials are already configured.

4. **Update Platform Configuration**

   Once the database migration is applied, update the platform configuration in the `platform_config` table:
   ```sql
   UPDATE platform_config
   SET value = '"your-actual-ein"'
   WHERE key = 'ein';
   ```

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

6. **Build for Production**
   ```bash
   npm run build
   ```

## Database Schema

The platform includes 10 main tables:

- **anonymous_sessions**: Anonymous user sessions for privacy
- **needs**: User needs (food, shelter, employment, spiritual, other)
- **gifts**: User offers to give (various categories)
- **prayers**: Prayer requests with AI-generated compassionate responses
- **organizations**: Verified churches, nonprofits, businesses, foundations
- **resources**: Resources offered by organizations
- **matches**: AI-calculated matches between needs, gifts, and resources
- **stories**: Anonymized success stories for the landing page
- **admin_users**: Pastor/admin portal access
- **platform_config**: Platform configuration including EIN

All tables have Row Level Security (RLS) enabled with appropriate policies.

## Key Features

### 1. First-Impression Experience
- Rotating anonymized local stories from user's ZIP code
- Clear 501(c)(3) nonprofit badge on all screens

### 2. AI-Powered Questionnaire
- Three sections: Needs, Gifts, Prayers
- Text input with voice-to-text support (Web Speech API)
- Large, labeled icon buttons for accessibility
- Dynamic tax deduction information for institutional givers
- AI classification of free-text into categories

### 3. Multilingual Support
- English, Spanish, Haitian Creole, Mandarin
- Easy language switching in header

### 4. Accessibility Features (WCAG 2.1 AA)
- Semantic HTML with ARIA labels
- Keyboard navigation support
- High-contrast mode toggle
- Large tap targets (minimum 44x44px)
- Voice input/output via Web Speech API
- Screen reader friendly

### 5. 501(c)(3) Compliance
- Persistent footer with EIN on every screen
- Tax deduction disclaimers for institutional givers
- Thank you message with tax information
- Configurable EIN via environment variable and database

### 6. Local Resource Matching
- ZIP-code based matching
- Real-time filtering by category
- Integration with verified organizations
- Detailed resource information with contact details

## Admin Portal (Future Enhancement)

The database schema includes support for a pastor/admin portal:
- Role-based access (pastor, church_admin, verified_org, super_admin)
- Organization management
- Resource capacity updates
- Anonymous need viewing by ZIP
- Prayer request opt-in

## Kiosk Mode

The platform supports kiosk deployment:
- Auto-ZIP via device config with manual override
- No PII stored without explicit consent
- Session-based tracking for privacy
- Full-screen capable

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with custom accessibility features
- **Database**: Supabase (PostgreSQL with RLS)
- **Icons**: Lucide React
- **Voice**: Web Speech API
- **Deployment**: Static hosting (Netlify, Vercel, etc.)

## Privacy & Security

- No PII stored without explicit informed consent
- Anonymous session tracking
- Row Level Security on all database tables
- ZIP code based matching only
- Session data cleared on browser close
- HTTPS required for production

## Customization

### Update Organization EIN
1. Update `.env`: `VITE_ORGANIZATION_EIN=XX-XXXXXXX`
2. Update database: Run SQL to update `platform_config` table

### Add More Stories
Insert into the `stories` table:
```sql
INSERT INTO stories (zip_code, category, anonymized_text, active)
VALUES ('10001', 'food', 'Your anonymized story here', true);
```

### Configure Default ZIP Code
Update `platform_config`:
```sql
UPDATE platform_config
SET value = '"10001"'
WHERE key = 'default_zip_code';
```

### Add Organizations and Resources
Use the database to add verified organizations and their resources:
```sql
INSERT INTO organizations (name, org_type, contact_email, zip_code, verified)
VALUES ('Your Church Name', 'church', 'contact@church.org', '10001', true);
```

## Testing Accessibility

1. **Keyboard Navigation**: Tab through all interactive elements
2. **Screen Reader**: Test with NVDA, JAWS, or VoiceOver
3. **Voice Input**: Test in Chrome (best support for Web Speech API)
4. **High Contrast**: Toggle high contrast mode in settings
5. **Mobile**: Test on actual devices for touch targets

## Browser Support

- Chrome/Edge: Full support including voice features
- Firefox: Full support (limited voice on some systems)
- Safari: Full support on iOS/macOS (voice support varies)

## Deployment Checklist

- [ ] Update EIN in `.env` and database
- [ ] Apply all database migrations
- [ ] Add real organization data
- [ ] Add local success stories
- [ ] Test all accessibility features
- [ ] Configure domain/SSL
- [ ] Test on mobile devices
- [ ] Set up error monitoring
- [ ] Configure analytics (privacy-respecting)

## Support & Contact

This platform is designed to serve communities with dignity and compassion. For technical support or questions about deployment, refer to the inline documentation in the code.

---

**"Give ✝ Share connects neighbors in need with those who can give—rooted in compassion, designed for dignity."**
