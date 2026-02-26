# Email Feature Troubleshooting Guide

## Issues Fixed

### 1. **Improved Email Error Handling** ✅

- **Problem**: Errors in `mail.js` were silently logged without proper tracking
- **Fix**: Enhanced error logging with detailed information and validation checks
- **File Changed**: `WISHLISTGAME-backend/src/utils/mail.js`

### 2. **Email Transport Verification** ✅

- **Problem**: No way to detect if email configuration was broken on startup
- **Fix**: Added `transport.verify()` on startup to check SMTP connection
- **Result**: Backend will now log `✅ Email transport ready` or `❌ Email transport verification failed` at startup

### 3. **Missing Environment Variable Validation** ✅

- **Problem**: If email config vars were missing, errors weren't clear
- **Fix**: Added validation to throw clear error messages for missing `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`
- **Files Changed**: `WISHLISTGAME-backend/src/utils/mail.js`

### 4. **Hardcoded Localhost URL in Email Links** ✅

- **Problem**: Email change link was hardcoded to `http://localhost:3000`, didn't work in production
- **Fix**: Now uses `process.env.APP_URL` (app.url is set to production URL in .env)
- **File Changed**: `WISHLISTGAME-backend/src/controllers/user.controller.js`

### 5. **Better Error Handling in Controllers** ✅

- **Problem**: Email sending errors weren't being caught or logged properly
- **Fix**: Added `.catch()` handlers to capture and log email failures
- **Files Changed**:
  - `WISHLISTGAME-backend/src/controllers/auth.controller.js`
  - `WISHLISTGAME-backend/src/controllers/user.controller.js`

## Verification Checklist

### ✅ Check 1: Environment Variables

Your `.env` should have these variables set:

```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password-here"
EMAIL_FROM="your-email@gmail.com"
APP_URL="https://gameboxd-backend.vercel.app"
```

### ✅ Check 2: Gmail App Password

If using Gmail:

1. **Enable 2-Step Verification** on your Google Account
2. **Generate App Password**:
   - Go to [myaccount.google.com/security](https://myaccount.google.com/security)
   - Find "App passwords" (only visible if 2FA is enabled)
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password (example: `qwer tyui asdf ghjk`)
   - Copy this exact password (including spaces) to `EMAIL_PASS` in `.env`

3. **Do NOT use your regular Gmail password** - App passwords are specifically for this purpose

### ✅ Check 3: Test Email Status

After starting the backend server, check the console output:

```
✓ Loaded .env file
📧 Email Configuration: {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: '***807@gmail.com',
  from: 'fauzannaufal807@gmail.com'
}
✅ Email transport ready
or
❌ Email transport verification failed: [error details]
```

### ✅ Check 4: Test Email Sending

When a user registers, you should see:

```
📧 Sending email to: user@example.com via smtp.gmail.com:587
✅ Email sent successfully: {
  messageId: '<message-id@example.com>',
  to: 'user@example.com',
  subject: 'Activate Your Account',
  response: '250 2.0.0 OK...'
}
```

If there's an error:

```
❌ Email error: {
  message: 'Invalid login: ...',
  code: 'EAUTH',
  ...
}
```

## Common Issues & Solutions

### Issue 1: `EAUTH` Error (Invalid Credentials)

**Symptom**: `Error: Invalid login: ...`
**Cause**: Gmail app password is incorrect or regular password was used
**Solution**:

- Use only Gmail App Password (16 chars with spaces)
- Ensure 2-Step Verification is enabled on Gmail account
- Check for typos or hidden characters in `.env`

### Issue 2: `ECONNREFUSED` Error

**Symptom**: `Error: connect ECONNREFUSED 127.0.0.1:587`
**Cause**: SMTP server connection failed
**Solution**:

- Check if `EMAIL_HOST` is correct (`smtp.gmail.com` for Gmail)
- Verify `EMAIL_PORT` is 587 (for STARTTLS) or 465 (for implicit TLS)
- Check internet connection

### Issue 3: `ETIMEDOUT` Error

**Symptom**: `Error: ETIMEDOUT`
**Cause**: SMTP server not responding
**Solution**:

- May be firewall blocking port 587
- Try `EMAIL_PORT=465` instead
- Try in a different network

### Issue 4: No Error But Email Not Received

**Symptom**: Registration says "check your email" but no email arrives
**Solution**:

- Check **Spam/Junk folder** (Gmail may filter automated emails)
- Verify the console shows `✅ Email sent successfully`
- If no console message, check backend logs for errors
- Test email to a different address

## Deployment to Vercel

When deploying to Vercel, ensure these environment variables are set in Vercel project settings:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
APP_URL=https://gameboxd-backend.vercel.app
FRONTEND_URL=https://your-frontend-url.com
DATABASE_URL=your-database-url
JWT_SECRET=your-secret
RAWG_API_KEY=your-api-key
```

## Testing Email Feature Locally

### Test Registration Email

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "name": "Test User"
  }'
```

Then check:

1. Backend console for email sending logs
2. Your email inbox (and spam folder) for activation email
3. The email should contain an activation link

### Test Email Change

1. Login as user
2. Update profile with new email
3. Backend should send verification email to new address

## Quick Debug Checklist

❌ Email not sending?

- [ ] Check `.env` file exists and has all EMAIL variables
- [ ] Restart backend server (needed to load .env changes)
- [ ] Check backend console for error messages
- [ ] Verify Gmail app password (not regular password)
- [ ] Check if 2-Step Verification is enabled on Gmail
- [ ] Try sending to Spam folder
- [ ] Try different email address

❌ Production (Vercel) email not working?

- [ ] Verify all EMAIL variables in Vercel project settings
- [ ] Check Vercel function logs for error details
- [ ] Try production URL in EMAIL_FROM if not working

## Files Modified

1. `WISHLISTGAME-backend/src/utils/mail.js` - Enhanced error handling and validation
2. `WISHLISTGAME-backend/src/controllers/auth.controller.js` - Better error logging
3. `WISHLISTGAME-backend/src/controllers/user.controller.js` - Fixed hardcoded URL and error handling

## Next Steps

1. Restart backend server
2. Check console for email transport status
3. Test registration with a test email
4. Verify email is received and activation link works
5. If still having issues, share the console error messages for further investigation
