# Seeding Initial Data

You have a few options to populate your Supabase database with initial content:

## Option 1: Use the Admin Dashboard (Easiest)

1. Go to `http://localhost:3000/admin`
2. Log in with your Supabase admin credentials
3. Use the admin interface to add:
   - **Projects** (portfolio work)
   - **Testimonials** (client quotes)
   - **Metrics** (homepage stats like "50+ Projects Delivered")

This is the recommended way since you can see the UI and test the CMS functionality!

## Option 2: Import via Supabase Dashboard

1. Go to your Supabase dashboard → **Table Editor**
2. Select a table (e.g., `projects`)
3. Click "Insert row" and fill in the fields
4. Repeat for each item

## Option 3: SQL Insert (Quick Bulk Import)

Run this in your Supabase **SQL Editor** to add sample data:

```sql
-- Insert sample projects
INSERT INTO projects (title, slug, keyframe_image, short_description, badge, metric_value, metric_label, show_on_work_page, show_on_homepage, "order") VALUES
('Strategy Consulting Platform', 'strategy-consulting-platform', 'https://images.unsplash.com/photo-1759143545924-0ea00615a054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc2NTMzMjI3OHww&ixlib=rb-4.1.0&q=80&w=1080', 'Professional website that helped a consulting firm book 12 clients in the first month.', 'Web Design', '98', 'Performance', true, true, 1),
('Creative Agency Rebrand', 'creative-agency-rebrand', 'https://images.unsplash.com/photo-1613988753173-8db625c972c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWJzaXRlJTIwZGVzaWduJTIwbGFwdG9wfGVufDF8fHx8MTc2NTQ1Mjg3M3ww&ixlib=rb-4.1.0&q=80&w=1080', 'Complete website redesign that increased inbound leads by 340% in 60 days.', 'Redesign', '340%', 'Lead Increase', true, true, 2),
('Wellness App Prototype', 'wellness-app-prototype', 'https://images.unsplash.com/photo-1630734242356-a6f858790740?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwZGVzaWduJTIwbW9ja3VwfGVufDF8fHx8MTc2NTQzMjI1Mnww&ixlib=rb-4.1.0&q=80&w=1080', 'Interactive prototype that secured $200K seed funding and validated product-market fit.', 'App Design', '$200K', 'Funding Raised', true, true, 3);

-- Insert sample testimonials
INSERT INTO testimonials (name, role, company, quote, "order", show_on_homepage) VALUES
('Sarah Johnson', 'Founder', 'Strategy Partners', 'DoneWell transformed our online presence. Within a month of launching, we booked 12 new clients. Their attention to detail and understanding of our business was exceptional.', 1, true),
('Michael Chen', 'Creative Director', 'Studio Bright', 'The redesign exceeded all expectations. Our lead generation increased by 340% in just 60 days. The team was professional, responsive, and truly understood our vision.', 2, true);

-- Insert sample metrics
INSERT INTO metrics (value, label, "order") VALUES
('50+', 'Projects Delivered', 1),
('98%', 'Client Satisfaction', 2),
('2 weeks', 'Average Timeline', 3),
('24/7', 'Support Available', 4);
```

## What to Add

### Projects
- **Title**: Project name
- **Slug**: URL-friendly version (e.g., `strategy-consulting-platform`)
- **Keyframe Image**: Hero/thumbnail image URL
- **Short Description**: Brief summary (shown on cards)
- **Badge**: Category tag (e.g., "Web Design", "Redesign")
- **Metric Value/Label**: Stats to display (e.g., "98" / "Performance")
- **Show on Work Page**: Toggle visibility
- **Show on Homepage**: Toggle for featured projects
- **Order**: Display order (lower = first)
- **Rich Text Fields** (optional): `summary`, `problem`, `objective`, `our_actions`, `results`, `result_metrics`

### Testimonials
- **Name, Role, Company**: Client info
- **Quote**: Testimonial text
- **Image** (optional): Client photo
- **Order**: Display order
- **Show on Homepage**: Toggle visibility

### Metrics
- **Value**: The number/stat (e.g., "50+", "98%")
- **Label**: Description (e.g., "Projects Delivered")
- **Order**: Display order

## Testing Checklist

After adding data:
- [ ] Visit `http://localhost:3000` - homepage should show featured projects
- [ ] Visit `http://localhost:3000/work` - should show all work page projects
- [ ] Click a project - detail page should load
- [ ] Check admin dashboard - all CRUD operations work
- [ ] Test adding/editing/deleting items in admin



