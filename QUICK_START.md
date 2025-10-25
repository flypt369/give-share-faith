# Give ✝ Share - Quick Start Guide

## What You Have

A complete, production-ready mutual aid platform with:

- Landing page with local success stories
- 3-part questionnaire (Needs, Gifts, Prayers)
- Voice input support
- 4 languages (EN, ES, HT, ZH)
- High contrast accessibility mode
- Resource matching system
- 501(c)(3) compliance built-in
- Database schema ready for deployment

## File Structure

```
project/
├── supabase/
│   └── migrations/
│       └── 20250101000000_init_give_share_platform.sql  ← Apply this to Supabase
├── src/
│   ├── components/     ← UI components
│   ├── contexts/       ← Global state
│   ├── lib/            ← Utilities (DB, translations, AI)
│   └── types/          ← TypeScript types
├── App.tsx             ← Main app component
├── .env                ← Environment variables (UPDATE EIN!)
└── Documentation files
```

## 3-Step Setup

### 1. Apply Database Migration

Go to your Supabase project:
1. Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20250101000000_init_give_share_platform.sql`
3. Paste and run
4. Verify 10 tables were created

### 2. Update EIN

Edit `.env`:
```bash
VITE_ORGANIZATION_EIN=XX-XXXXXXX
```

Update database:
```sql
UPDATE platform_config
SET value = '"XX-XXXXXXX"'
WHERE key = 'ein';
```

### 3. Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

## Testing the Platform

1. **Landing Page**: You should see sample stories rotating
2. **Language**: Click globe icon to change language
3. **High Contrast**: Click moon icon
4. **Voice Input**: Click microphone on any text field (requires HTTPS or localhost)
5. **Questionnaire**: Complete all 3 sections
6. **Results**: View matched resources

## Adding Your Data

### Add Stories

```sql
INSERT INTO stories (zip_code, category, anonymized_text, active)
VALUES ('10001', 'food', 'Your local success story here', true);
```

### Add Organizations

```sql
INSERT INTO organizations (name, org_type, contact_email, zip_code, verified)
VALUES ('Local Church Name', 'church', 'contact@church.org', '10001', true)
RETURNING id;
```

### Add Resources

```sql
INSERT INTO resources (org_id, category, name, description, zip_codes_served, active)
VALUES
  ('org-id-from-above', 'food', 'Food Pantry',
   'Free groceries every Wednesday',
   ARRAY['10001', '10002'], true);
```

## Deploy to Production

### Option 1: Vercel
```bash
npm run build
# Connect GitHub repo to Vercel
# Set environment variables in Vercel dashboard
```

### Option 2: Netlify
```bash
npm run build
# Drag dist/ folder to Netlify
# Or connect GitHub repo
```

### Option 3: AWS Amplify
```bash
# Connect GitHub repo
# Build command: npm run build
# Publish directory: dist
```

## Key Features to Show Users

1. **"It speaks my language"** - 4 language support
2. **"I can use my voice"** - Voice input on all text fields
3. **"It's easy to see"** - High contrast mode + large text
4. **"It helps my neighbors"** - Hyperlocal ZIP-based matching
5. **"It respects my privacy"** - No login required, anonymous sessions
6. **"It's faith-based but inclusive"** - Rooted in compassion, open to all

## Common Customizations

### Change Default ZIP
```sql
UPDATE platform_config
SET value = '"YOUR_ZIP"'
WHERE key = 'default_zip_code';
```

### Add More Translations
Edit `src/lib/translations.ts` and add your language:
```typescript
export const translations = {
  en: { ... },
  es: { ... },
  yourlang: { ... }  // Add here
};
```

### Customize Prayer Generation
Edit `src/lib/textClassification.ts`:
```typescript
export function generatePrayer(requestText: string, language: string = 'en'): string {
  // Customize prayer templates
}
```

## Production Checklist

- [ ] EIN updated in `.env` and database
- [ ] Migration applied to Supabase
- [ ] Real organizations added
- [ ] Local stories added
- [ ] Voice tested in production (requires HTTPS)
- [ ] All 4 languages tested
- [ ] Mobile responsive tested
- [ ] Keyboard navigation tested
- [ ] Screen reader tested

## Support

Refer to:
- `SETUP.md` - Detailed setup guide
- `PLATFORM_FEATURES.md` - Complete feature list
- Database migration file - Inline documentation

## Emergency Fixes

### Build Fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database Issues
Re-run migration SQL or check Supabase logs

### Voice Not Working
Requires HTTPS in production (Chrome/Edge have best support)

---

**You're ready to launch!** The platform is fully functional. Just add your local data and deploy.
