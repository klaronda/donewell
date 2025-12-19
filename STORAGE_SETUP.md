# Supabase Storage Setup

## Bucket Configuration

Your storage bucket `site-assets` is already created. You need to configure it for public access.

## Step 1: Make Bucket Public

1. Go to Supabase Dashboard → **Storage** → **Policies**
2. Select bucket: `site-assets`
3. Click "New Policy" → "For full customization"
4. Create a policy for **SELECT** (public read access):

```sql
-- Policy name: Public read access
-- Allowed operation: SELECT
-- Policy definition:
bucket_id = 'site-assets'
```

Or use the simpler template:
- **Policy name**: `Public read access`
- **Allowed operation**: `SELECT`
- **Policy definition**: `true` (allows everyone to read)

## Step 2: Allow Authenticated Uploads

Create another policy for **INSERT** (authenticated uploads):

```sql
-- Policy name: Authenticated uploads
-- Allowed operation: INSERT
-- Policy definition:
bucket_id = 'site-assets' AND auth.role() = 'authenticated'
```

Or use template:
- **Policy name**: `Authenticated uploads`
- **Allowed operation**: `INSERT`
- **Policy definition**: `auth.role() = 'authenticated'`

## Step 3: Allow Authenticated Deletes (Optional)

If you want users to be able to delete images:

```sql
-- Policy name: Authenticated deletes
-- Allowed operation: DELETE
-- Policy definition:
bucket_id = 'site-assets' AND auth.role() = 'authenticated'
```

## Folder Structure

Images will be uploaded to:
- **Projects**: `site-assets/projects/{projectId}/{timestamp}-{filename}.{ext}`
- **Testimonials**: `site-assets/testimonials/{testimonialId}/{timestamp}-{filename}.{ext}` (for future use)

## Testing

After setting up policies:
1. Go to admin dashboard
2. Edit or create a project
3. Click "Upload to Supabase" button
4. Select an image
5. Image should upload and URL should appear in the input field
6. Save the project
7. Verify the image is accessible at the public URL

## Troubleshooting

### "new row violates row-level security policy"
- Make sure you're logged in (authenticated)
- Check that INSERT policy is set correctly

### "The resource already exists"
- The code automatically handles this by adding a timestamp prefix
- If you see this error, the retry logic should handle it

### Images not displaying
- Check that SELECT policy allows public read access
- Verify the URL is correct (should be a Supabase Storage URL)
- Check browser console for CORS errors



