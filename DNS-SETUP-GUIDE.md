# DNS Setup Guide for Resend Email Configuration
## EasyRentCars.rentals

---

## Current Status

### ✅ Working Correctly
- **DKIM Record**: Verified
  - Type: TXT
  - Host: `resend._domainkey`
  - Value: `p=MIGfMA0GCSqGSIb3DQEB...`
  - Status: ✅ Verified in Resend

- **DMARC Record**: Configured
  - Type: TXT
  - Host: `_dmarc`
  - Value: `v=DMARC1; p=none;`
  - Status: ✅ Present

### ❌ Needs Correction

#### SPF Record - CRITICAL ERROR
**Current (WRONG):**
- Type: TXT
- Host: `send`
- Value: `v=spf1 include:amazones.com -all`

**Should Be (CORRECT):**
- Type: TXT
- Host: `send`
- Value: `v=spf1 include:amazonses.com -all`

**Error:** The value has a typo - "amazones.com" instead of "amazonses.com" (missing the "s" in "ses")

---

## Step-by-Step Fix Instructions

### 1. Log into Namecheap
- Go to [namecheap.com](https://www.namecheap.com)
- Navigate to your domain: **easyrentcars.rentals**
- Click "Advanced DNS" tab

### 2. Locate the SPF Record
- Find the TXT Record with Host: `send`
- Current value should show: `v=spf1 include:amazones.com -all`

### 3. Edit the SPF Record
- Click the edit/pencil icon next to this record
- Change the value from:
  ```
  v=spf1 include:amazones.com -all
  ```

  To:
  ```
  v=spf1 include:amazonses.com -all
  ```

- Click "Save Changes" or the checkmark icon

### 4. Verify All Records Match Resend Requirements

Your final DNS configuration should look like this:

| Type | Host | Value | TTL | Priority |
|------|------|-------|-----|----------|
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEB...` | Automatic | - |
| TXT | `send` | `v=spf1 include:amazonses.com -all` | Automatic | - |
| MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` | Automatic | 10 |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | Automatic | - |

### 5. Wait for DNS Propagation
- DNS changes can take 5-30 minutes to propagate
- You can check propagation status at: [whatsmydns.net](https://www.whatsmydns.net/)
- Enter your domain and select "TXT" record type
- Check the "send" subdomain: `send.easyrentcars.rentals`

---

## Verification Steps

### After Making DNS Changes:

#### 1. Check Resend Dashboard
- Log into [resend.com/domains](https://resend.com/domains)
- Select **easyrentcars.rentals**
- All records should show "Verified" status:
  - ✅ DKIM: Verified
  - ✅ SPF: Verified
  - ✅ Enable Sending: ON

#### 2. Test Email Sending
Open the test utility:
```bash
# Open in browser
open test-email.html
```

Or test from Resend Dashboard:
- Go to Resend Dashboard
- Click "Send Test Email"
- Use sender: `info@easyrentcars.rentals`
- Check if email arrives in inbox (not spam)

#### 3. Test from Application
Test each email function:

**A. Contact Form Test:**
- Go to your website's contact form
- Fill out and submit
- Check if email arrives at: `easyrentgraz@gmail.com`

**B. Booking Confirmation Test:**
- Make a test booking
- Verify confirmation email is received

**C. Email Verification Test:**
- Start a new booking
- Check if verification email is received

---

## Troubleshooting

### Email Not Arriving?

#### Check 1: DNS Propagation
```bash
# Check SPF record
dig TXT send.easyrentcars.rentals

# Should return:
# send.easyrentcars.rentals. IN TXT "v=spf1 include:amazonses.com -all"
```

#### Check 2: Resend Dashboard Status
- All records must show "Verified"
- "Enable Sending" must be ON
- Check the "Logs" tab for any errors

#### Check 3: Spam Folder
- Check spam/junk folder
- Mark emails from `info@easyrentcars.rentals` as "Not Spam"

#### Check 4: API Key Configuration
The API key is already configured in your `.env` file:
```
RESEND_API_KEY=re_bykySgEV_4ZZ2xkVxFFRZC1vFn2ANvETA
```

This is automatically available to all Supabase Edge Functions.

---

## Email Sending Functions

Your application has these email functions ready:

### 1. send-booking-confirmation
- **Purpose**: Sends booking confirmation to customer and business
- **From**: `EasyRentCars <info@easyrentcars.rentals>`
- **To**: Customer email + `easyrentgraz@gmail.com`
- **Status**: ✅ Active

### 2. send-contact-message
- **Purpose**: Sends contact form messages to business
- **From**: `EasyRentCars Contact Form <info@easyrentcars.rentals>`
- **To**: `easyrentgraz@gmail.com`
- **Reply-To**: Customer's email
- **Status**: ✅ Active

### 3. send-email-verification
- **Purpose**: Sends email verification link to customers
- **From**: `EasyRentCars <info@easyrentcars.rentals>`
- **To**: Customer email
- **Status**: ✅ Active

---

## Important Notes

### Domain Configuration
- **Verified Domain**: `easyrentcars.rentals`
- **Sending Address**: `info@easyrentcars.rentals`
- **Business Email**: `easyrentgraz@gmail.com`

### Email Limits (Resend Free Plan)
- 100 emails per day
- 3,000 emails per month
- If you need more, upgrade to a paid plan

### Security Settings
- SPF: Prevents email spoofing
- DKIM: Verifies sender authenticity
- DMARC: Provides reporting on email delivery
- All three must be configured for best deliverability

### Best Practices
- Always send from a verified domain
- Use descriptive "From" names
- Monitor the Resend logs for delivery issues
- Keep your API key secret and secure

---

## Quick Reference

### Resend Dashboard
🔗 [resend.com/domains](https://resend.com/domains)

### Namecheap DNS Management
🔗 [namecheap.com](https://www.namecheap.com) → Domain List → easyrentcars.rentals → Advanced DNS

### DNS Propagation Checker
🔗 [whatsmydns.net](https://www.whatsmydns.net/)

### Email Test Tool
📄 Open `test-email.html` in your browser

---

## Support

If you continue to have issues after making these changes:

1. Wait at least 30 minutes for DNS propagation
2. Clear your browser cache
3. Check Resend logs for specific error messages
4. Verify all DNS records match exactly as shown above
5. Contact Resend support if domain verification fails

---

**Last Updated:** 2026-01-12
**Domain:** easyrentcars.rentals
**Email Service:** Resend
**DNS Provider:** Namecheap
