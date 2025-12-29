# Email Domain Authentication Setup for donewellco.com

## Overview
This guide will help you set up SPF, DKIM, and DMARC records for `donewellco.com` to improve email deliverability and prevent spoofing.

## Current Status
- ✅ **DKIM**: Passing (already configured)
- ❓ **SPF**: Need to verify
- ❌ **DMARC**: Not configured (needs to be added)

## Step 1: Verify Domain in Resend

1. **Log into Resend Dashboard**
   - Go to [resend.com](https://resend.com) and sign in
   - Navigate to **Domains** in the sidebar

2. **Check if `donewellco.com` is verified**
   - If not verified, click **Add Domain**
   - Enter `donewellco.com`
   - Resend will provide DNS records you need to add

3. **Add Resend's DNS Records** (if not already done)
   Resend will show you these records:
   - **SPF Record** (TXT record for root domain)
   - **DKIM Records** (CNAME records - usually 2-3 records)
   - **Domain Verification** (TXT record)

## Step 2: Check Current SPF Record

Before adding DMARC, verify your SPF record exists:

1. **Use an online tool to check:**
   - Go to [MXToolbox SPF Record Lookup](https://mxtoolbox.com/spf.aspx)
   - Enter `donewellco.com`
   - Check if an SPF record exists

2. **What you should see:**
   ```
   v=spf1 include:_spf.resend.com ~all
   ```
   Or similar (Resend will provide the exact record)

3. **If SPF is missing:**
   - Add it in your DNS provider (wherever you manage DNS for donewellco.com)
   - Record type: `TXT`
   - Host/Name: `@` or `donewellco.com` (root domain)
   - Value: `v=spf1 include:_spf.resend.com ~all`

## Step 3: Add DMARC Record (Recommended: Start with Monitoring)

### Phase 1: Monitor First (Recommended Start)

Add this DMARC record to monitor emails without blocking anything:

1. **Go to your DNS provider** (wherever you manage DNS for donewellco.com)
   - Common providers: Cloudflare, GoDaddy, Namecheap, Google Domains, etc.

2. **Add a new TXT record:**
   - **Record Type**: `TXT`
   - **Host/Name**: `_dmarc`
   - **Value**: 
     ```
     v=DMARC1; p=none; rua=mailto:dmarc-reports@donewellco.com
     ```
   - **TTL**: 3600 (or default)

3. **Important Notes:**
   - Replace `dmarc-reports@donewellco.com` with an email you can access
   - This will send you reports about email authentication
   - `p=none` means "monitor only" - no emails will be blocked

4. **Wait for DNS propagation** (usually 5 minutes to 48 hours)

### Phase 2: Verify DMARC is Working

After adding the record, verify it:

1. **Check DMARC record:**
   - Go to [MXToolbox DMARC Record Lookup](https://mxtoolbox.com/dmarc.aspx)
   - Enter `donewellco.com`
   - Should show your DMARC record

2. **Test with Mail Tester:**
   - Go to [mail-tester.com](https://www.mail-tester.com)
   - Send a test email to the address they provide
   - Check the DMARC score (should improve)

3. **Monitor reports:**
   - Check `dmarc-reports@donewellco.com` for DMARC aggregate reports
   - These come daily/weekly and show authentication results

### Phase 3: Gradually Tighten (After 1-2 Weeks)

Once you've monitored for 1-2 weeks and confirmed everything works:

1. **Move to Quarantine:**
   ```
   v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@donewellco.com
   ```
   - This sends failed emails to spam (not rejected)
   - Monitor for another 1-2 weeks

2. **Move to Reject (Final):**
   ```
   v=DMARC1; p=reject; rua=mailto:dmarc-reports@donewellco.com
   ```
   - This rejects emails that fail authentication
   - Only use after confirming everything works perfectly

## Step 4: Verify Everything is Working

### Quick Verification Checklist

- [ ] SPF record exists and includes Resend
- [ ] DKIM records are added (from Resend)
- [ ] DMARC record is added (start with `p=none`)
- [ ] Domain is verified in Resend dashboard
- [ ] Test email passes all checks on mail-tester.com

### Tools to Verify

1. **MXToolbox** - Check individual records:
   - [SPF Check](https://mxtoolbox.com/spf.aspx)
   - [DMARC Check](https://mxtoolbox.com/dmarc.aspx)
   - [DKIM Check](https://mxtoolbox.com/dkim.aspx)

2. **Mail Tester** - Overall deliverability:
   - [mail-tester.com](https://www.mail-tester.com)
   - Send test email, get comprehensive score

3. **Resend Dashboard**:
   - Check domain verification status
   - View email logs and delivery status

## Common DNS Providers Instructions

### Cloudflare
1. Log into Cloudflare
2. Select `donewellco.com` domain
3. Go to **DNS** → **Records**
4. Click **Add record**
5. Select **TXT** type
6. Name: `_dmarc`
7. Content: `v=DMARC1; p=none; rua=mailto:dmarc-reports@donewellco.com`
8. Click **Save**

### GoDaddy
1. Log into GoDaddy
2. Go to **My Products** → **DNS**
3. Click **Add** in the Records section
4. Type: **TXT**
5. Name: `_dmarc`
6. Value: `v=DMARC1; p=none; rua=mailto:dmarc-reports@donewellco.com`
7. TTL: 600 seconds
8. Click **Save**

### Namecheap
1. Log into Namecheap
2. Go to **Domain List** → **Manage** for donewellco.com
3. Go to **Advanced DNS** tab
4. Click **Add New Record**
5. Type: **TXT Record**
6. Host: `_dmarc`
7. Value: `v=DMARC1; p=none; rua=mailto:dmarc-reports@donewellco.com`
8. TTL: Automatic
9. Click **Save**

## Troubleshooting

### DMARC record not showing up?
- Wait 5-60 minutes for DNS propagation
- Check for typos in the record name (`_dmarc` not `dmarc`)
- Verify you're adding it to the correct domain

### Emails still failing?
- Make sure SPF includes Resend: `include:_spf.resend.com`
- Verify DKIM records from Resend are added
- Check Resend dashboard shows domain as verified

### Want to see what's happening?
- Check DMARC reports sent to your email
- Use mail-tester.com for detailed analysis
- Check Resend dashboard for delivery logs

## Next Steps

1. **Immediate**: Add DMARC record with `p=none` (monitoring mode)
2. **Week 1-2**: Monitor DMARC reports, verify all emails pass
3. **Week 3-4**: Move to `p=quarantine` if everything looks good
4. **Week 5+**: Move to `p=reject` for maximum protection

## Questions?

- Resend Support: [resend.com/support](https://resend.com/support)
- DMARC Guide: [dmarcian.com/dmarc-in-10-minutes](https://dmarcian.com/dmarc-in-10-minutes/)

