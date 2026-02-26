# 📧 EMAIL DEBUGGING - COMPLETE GUIDE

**Versi: 2.0** | Updated: February 26, 2026

---

## 🎯 QUICK SUMMARY - Apa yang sudah saya fix

✅ Enhanced email error handling dan validation  
✅ Added transport.verify() for SMTP connection check  
✅ Better logging di mail.js dan auth controller  
✅ Fixed hardcoded localhost URL untuk email links  
✅ Added comprehensive debugging tools

**Tapi masih tidak terkirim? Ikuti guide ini:**

---

## 🚀 FASTEST WAY TO DEBUG (3 Langkah)

### Langkah 1: Run Debug Script

```bash
cd WISHLISTGAME-backend
node src/debug/emailDebug.js
```

**Output seharusnya:**

```
✅ SMTP Connection SUCCESS!
✅ Email transport ready
✅ Test email sent successfully!
✅ All tests passed!
```

### Langkah 2: Jika Error - Baca Tabel

| Error                          | Sebab                 | Solusi                         |
| ------------------------------ | --------------------- | ------------------------------ |
| `EAUTH`                        | Password salah        | Gunakan Gmail App Password     |
| `ECONNREFUSED`                 | Tidak connect ke SMTP | Check EMAIL_HOST, try port 465 |
| `NOT SET`                      | Env var missing       | Add ke .env                    |
| Email sent tapi tidak diterima | Gmail filter          | Check spam folder              |

### Langkah 3: Jika Masih Error

Baca section **ERROR TROUBLESHOOTING** di bawah

---

## 📂 DEBUGGING TOOLS YANG SUDAH DIBUAT

### 1. **Debug Script** - Most Important! ⭐

```bash
node src/debug/emailDebug.js
```

**Apa yang dilakukan:**

- Check environment variables
- Verify SMTP connection
- Send test email
- Show detailed error messages

📄 Location: `WISHLISTGAME-backend/src/debug/emailDebug.js`

---

### 2. **Test Registration Script**

```bash
node src/test/testRegistration.js
```

**Apa yang dilakukan:**

- Simulate user registration
- Show backend response
- Guide untuk verify email sent

📄 Location: `WISHLISTGAME-backend/src/test/testRegistration.js`

---

### 3. **Quick Debug Guide** (Read First!)

📄 Location: `WISHLISTGAME-backend/DEBUG_EMAIL_SIMPLE.md`

**Includes:**

- Step-by-step debugging
- Common error solutions
- Gmail App Password setup guide
- Full checklist

---

### 4. **Detailed Debug Guide**

📄 Location: `WISHLISTGAME-backend/EMAIL_DEBUG_GUIDE.md`

**Includes:**

- Expected output examples
- Advanced troubleshooting
- Detailed error explanations
- Tips & tricks

---

## 📋 WHAT'S CHANGED IN CODE

### File 1: `src/utils/mail.js`

```javascript
// Added:
✅ transport.verify() on startup
✅ Environment variable validation
✅ Detailed error logging
✅ Function returns result object
✅ Config logging on startup
```

### File 2: `src/server.js`

```javascript
// Added:
✅ Import transport dari mail.js
   (ini auto-run verify saat server start)
```

### File 3: `src/controllers/auth.controller.js`

```javascript
// Enhanced:
✅ Detailed console logging untuk setiap step
✅ Better error handling (.catch + .then)
✅ Log activation link yang dikirim
✅ Log email sending status
```

### File 4: `src/controllers/user.controller.js`

```javascript
// Fixed:
✅ Hardcoded localhost → process.env.APP_URL
✅ Better error handling
```

---

## ❌ ERROR TROUBLESHOOTING

### Error: `EAUTH` (Invalid login)

**Symptoms:**

```
❌ Email transport verification failed: Invalid login
Code: EAUTH
SMTP Response: 534 5.7.8 Username and password not accepted
```

**Root Cause:** Gmail credentials invalid

**Solution:**

1. Lihat .env file, check EMAIL variables:

```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="???"  # ← This is the problem!
```

2. **EMAIL_PASS HARUS App Password, BUKAN regular password!**

3. Generate App Password:
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification
   - Find "App passwords"
   - Select Mail + Windows Computer
   - Copy 16 char password

4. Update .env:

```env
EMAIL_PASS="copied-password-exactly"
```

5. Restart backend, try again

---

### Error: `ECONNREFUSED` (Connection refused)

**Symptoms:**

```
connect ECONNREFUSED 127.0.0.1:587
Code: ECONNREFUSED
```

**Root Cause:** Cannot connect to SMTP server

**Solution:**

1. Check EMAIL_HOST:

```env
EMAIL_HOST="smtp.gmail.com"  # ← Check this is correct
```

2. Try different port:

```env
EMAIL_PORT=465  # instead of 587
```

3. Check internet connection

4. Try different network (WiFi vs hotspot)

---

### Error: `ETIMEDOUT` (Timeout)

**Symptoms:**

```
ETIMEDOUT
Code: ETIMEDOUT
```

**Root Cause:** SMTP server not responding

**Solution:**

1. Try EMAIL_PORT=465
2. Check internet
3. Try different network
4. May be firewall blocking

---

### Error: `.env file NOT found`

**Solution:**

```bash
# Create .env in WISHLISTGAME-backend folder:
cp .env.example .env
# Then edit and add EMAIL values
nano .env
```

---

### Email Sent But Not Receiving

**Check:**

1. **Backend console** - see "✅ Email sent successfully"?
   - YES → Email was sent successfully, problem di sisi penerima
   - NO → Email sending failed, check console error

2. **Check spam/junk folder**
   - Gmail sering filter automated emails

3. **Try test dari debug script:**

   ```bash
   node src/debug/emailDebug.js
   ```

   - Should send to sender email
   - Check if received

4. **Try send ke email berbeda:**
   ```bash
   node src/test/testRegistration.js
   ```

   - Use different email provider
   - Try @yahoo.com, @outlook.com, etc

---

## 📊 WHAT YOU SHOULD SEE

### ✅ SUCCESS - Backend Console (Server Start)

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
```

### ✅ SUCCESS - User Register

```
============================================================
🔐 REGISTRATION REQUEST RECEIVED
============================================================
📧 Email: test@gmail.com
👤 Name: Test User

✓ Validating input...
✓ Validation passed
✓ Checking if user already exists...
✓ User does not exist, creating...
✓ User created successfully, ID: abc123...

📧 Preparing activation email...
   From: fauzannaufal807@gmail.com
   To: test@gmail.com
   Subject: Activate Your Account
   Link: https://gameboxd-backend.vercel.app/api/auth/activate/abc123...

🚀 Sending activation email...
✅ Email sent successfully to: test@gmail.com
============================================================
```

### ❌ ERROR - Backend Console (Server Start)

```
❌ Email transport verification failed: Invalid login
```

Then check error solutions above.

---

## 🔍 STEP BY STEP DEBUG PROCESS

### Step 1: Verify Environment Variables

```bash
# Check .env file exists and has EMAIL vars
cat .env | grep EMAIL
```

Should show:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-password
EMAIL_FROM=your-email@gmail.com
```

### Step 2: Restart Backend

```bash
# Press Ctrl+C to stop
# Then restart:
npm run dev
```

Check console for "✅ Email transport ready"

### Step 3: Run Debug Script

```bash
node src/debug/emailDebug.js
```

If SUCCESS → email system OK
If ERROR → follow error troubleshooting above

### Step 4: Test Registration

```bash
node src/test/testRegistration.js
```

Check:

1. Response shows success
2. Backend console shows email sent
3. Check email inbox

### Step 5: Click Activation Link

- Open email received
- Click activation button
- Should show success page

### Step 6: Try Login

```
Email: (registered email)
Password: (registered password)
```

Should login successfully if account is active

---

## 🎯 PRODUCTION DEPLOYMENT (Vercel)

Make sure these env vars are set in Vercel:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
APP_URL=https://your-deployed-backend.vercel.app
FRONTEND_URL=https://your-deployed-frontend.com
```

⚠️ **Important:**

- EMAIL_PASS must be Gmail App Password
- Do NOT commit .env to Git
- Use Vercel UI to set env vars

---

## 📞 IF STILL NOT WORKING

Share the following:

1. **Output dari:**

   ```bash
   node src/debug/emailDebug.js
   ```

2. **Backend console logs** saat register

3. **Current .env values** (HIDE PASSWORD):

   ```
   EMAIL_HOST=??
   EMAIL_PORT=??
   EMAIL_USER=??
   EMAIL_PASS=***hidden
   EMAIL_FROM=??
   ```

4. **What you've tried:**
   - Gmail App Password setup?
   - 2-Step Verification enabled?
   - Restarted backend?
   - Checked spam folder?

---

## ✅ FINAL CHECKLIST

Before asking for help:

- [ ] .env file created in WISHLISTGAME-backend folder
- [ ] EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_FROM set
- [ ] EMAIL_PASS is Gmail App Password (16 chars), not regular password
- [ ] Gmail account has 2-Step Verification enabled
- [ ] Backend restarted after .env changes
- [ ] Console shows "✅ Email transport ready"
- [ ] Run debug script: `node src/debug/emailDebug.js`
- [ ] Debug script shows SUCCESS
- [ ] Test registration with real email
- [ ] Check inbox + spam folder
- [ ] Email received successfully

If all checked → **Email system working!** 🎉

---

## 📚 REFERENCE FILES

| File                                 | Purpose                  |
| ------------------------------------ | ------------------------ |
| `src/debug/emailDebug.js`            | Run to test email config |
| `src/test/testRegistration.js`       | Test registration flow   |
| `DEBUG_EMAIL_SIMPLE.md`              | Simple guide             |
| `EMAIL_DEBUG_GUIDE.md`               | Detailed guide           |
| `src/utils/mail.js`                  | Email sending logic      |
| `src/controllers/auth.controller.js` | Registration handler     |
| `.env.example`                       | Template for .env        |

---

## 🔗 USEFUL LINKS

- **Gmail Security Settings:** https://myaccount.google.com/security
- **Generate App Password:** https://myaccount.google.com/apppasswords
- **Enable 2FA:** https://support.google.com/accounts/answer/1066447
- **Nodemailer Docs:** https://nodemailer.com
- **Gmail SMTP Help:** https://support.google.com/mail/answer/7126229

---

**Created:** February 26, 2026  
**Status:** Complete Email Debugging & Enhancement  
**Next Step:** Run `node src/debug/emailDebug.js` 🚀
