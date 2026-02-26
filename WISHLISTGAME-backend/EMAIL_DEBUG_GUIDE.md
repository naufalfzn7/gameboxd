# Email Debug Guide - Step by Step

## 🚀 Quick Start - Run Debug Script

Jalankan script ini di terminal untuk debug email configuration:

```bash
# Navigate to backend folder
cd WISHLISTGAME-backend

# Run debug script
node src/debug/emailDebug.js
```

Script ini akan:

1. ✅ Cek semua environment variables
2. ✅ Cek SMTP connection
3. ✅ Coba kirim test email
4. ✅ Show error details jika ada masalah

---

## 📊 Expected Output (Jika Berhasil)

```
✓ Loaded .env file

=====================================
SECTION 1: Environment Variables Check
=====================================

✅ EMAIL_HOST: smtp.gmail.com
✅ EMAIL_PORT: 587
✅ EMAIL_USER: ***807@gmail.com
✅ EMAIL_PASS: ***pdjk
✅ EMAIL_FROM: fauzannaufal807@gmail.com

✅ All required variables are set!

=====================================
SECTION 2: SMTP Connection Test
=====================================

📧 SMTP Details:
   Host: smtp.gmail.com
   Port: 587
   Secure (TLS): false
   User: ***807@gmail.com

🔍 Verifying SMTP connection...

✅ SMTP Connection SUCCESS!
   Email transport is ready to send emails

=====================================
SECTION 3: Send Test Email
=====================================

📧 Sending test email to: fauzannaufal807@gmail.com

✅ Test email sent successfully!

📋 Email Response Details:
   Message ID: <message-id@example.com>
   Response: 250 2.0.0 OK

✅ All tests passed! Your email system is working correctly.
```

---

## ❌ Possible Error Messages & Solutions

### Error 1: "Email configuration incomplete"

```
❌ EMAIL_HOST: NOT SET
❌ EMAIL_USER: NOT SET
❌ EMAIL_PASS: NOT SET
```

**Solusi:**

```bash
# Edit .env file dan pastikan ada:
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

### Error 2: "EAUTH - Authentication failed"

```
❌ SMTP Connection FAILED!

📋 Error Details:
   Message: Invalid login
   Code: EAUTH
   SMTP Response: 534 5.7.8 Username and password not accepted
```

**Penyebab:** Gmail credentials salah atau menggunakan password biasa bukan App Password

**Solusi:**

**Untuk Gmail, WAJIB PAKAI APP PASSWORD, bukan regular password!**

1. **Enable 2-Step Verification:**
   - Buka [myaccount.google.com](https://myaccount.google.com)
   - Klik Security > 2-Step Verification
   - Ikuti prosesnya

2. **Generate App Password:**
   - Buka [myaccount.google.com/security](https://myaccount.google.com/security)
   - Cari "App passwords" (hanya muncul jika 2FA sudah enabled)
   - Select Mail + Windows Computer
   - Google generate 16 character password ex: `qwer tyui asdf ghjk`
   - **COPY PERSIS dengan spacenya!**

3. **Update .env:**

   ```env
   EMAIL_USER="fauzannaufal807@gmail.com"
   EMAIL_PASS="qwer tyui asdf ghjk"  # EXACT 16 chars dengan space!
   ```

4. **Restart backend**

### Error 3: "ECONNREFUSED - Connection refused"

```
❌ SMTP Connection FAILED!

📋 Error Details:
   Message: connect ECONNREFUSED 127.0.0.1:587
   Code: ECONNREFUSED
```

**Penyebab:** Tidak bisa connect ke SMTP server

**Solusi:**

1. **Cek EMAIL_HOST benar:**

   ```env
   EMAIL_HOST="smtp.gmail.com"  # untuk Gmail
   # atau untuk email provider lain, check documentation
   ```

2. **Cek port:**

   ```env
   EMAIL_PORT=587      # untuk STARTTLS (standard)
   # atau
   EMAIL_PORT=465      # untuk implicit TLS
   ```

3. **Cek firewall:**
   - Pastikan ISP tidak blocking port 587 atau 465
   - Coba pakai tethering dari HP atau different network

### Error 4: "ETIMEDOUT - Connection timeout"

```
❌ SMTP Connection FAILED!

📋 Error Details:
   Message: ETIMEDOUT
   Code: ETIMEDOUT
```

**Penyebab:** SMTP server tidak respond (timeout)

**Solusi:**

1. Try port 465 instead:
   ```env
   EMAIL_PORT=465
   ```
2. Cek internet connection
3. Try dari different network

### Error 5: ".env file NOT found"

```
❌ .env file NOT found!
```

**Solusi:**

```bash
# Create .env file di WISHLISTGAME-backend folder
# Copy dari .env.example dan update values:
cp .env.example .env
nano .env  # edit dengan EMAIL credentials
```

---

## 🔍 Debug Manual - Check di Backend Console

Ketika user register, restart backend dan lihat console:

### ✅ Yang seharusnya keluar (SUCCESS):

```javascript
✓ Loaded .env file
DATABASE_URL at server startup: { exists: true, value: 'postgresql://...' }

📧 Email Configuration: {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: '***807@gmail.com',
  from: 'fauzannaufal807@gmail.com'
}

✅ Email transport ready

[User registers...]

📧 Sending email to: user123@example.com via smtp.gmail.com:587
✅ Email sent successfully: {
  messageId: '<message-id@gmail.com>',
  to: 'user123@example.com',
  subject: 'Activate Your Account',
  response: '250 2.0.0 OK'
}
```

### ❌ Yang seharusnya tidak keluar (FAILED):

```javascript
❌ Email transport verification failed: Invalid login

[User registers...]

📧 Sending email to: user123@example.com via smtp.gmail.com:587
❌ Email error: {
  message: 'Invalid login',
  code: 'EAUTH',
  response: '534 5.7.8 Username and password not accepted'
}
```

---

## 📝 Checklist - Step by Step

### Step 1: Verify .env File

- [ ] `.env` file exists di `WISHLISTGAME-backend/` folder
- [ ] Semua EMAIL variables ada
- [ ] Tidak ada trailing spaces di values
- [ ] EMAIL_PASS adalah App Password (16 chars), bukan regular password

### Step 2: Run Debug Script

- [ ] Terminal buka di `WISHLISTGAME-backend` folder
- [ ] Jalankan: `node src/debug/emailDebug.js`
- [ ] Lihat output dan identifikasi error

### Step 3: Check Gmail Setup (jika pakai Gmail)

- [ ] Google Account memiliki 2-Step Verification enabled
- [ ] Generate App Password dari [myaccount.google.com/security](https://myaccount.google.com/security)
- [ ] Copy EXACT app password (dengan spaces) ke `.env`

### Step 4: Restart & Test

- [ ] Restart backend server
- [ ] Check console untuk "✅ Email transport ready"
- [ ] Create test user dengan email yang bisa diakses
- [ ] Check inbox/spam folder untuk activation email

### Step 5: If Still Not Working

- [ ] Run debug script again: `node src/debug/emailDebug.js`
- [ ] Share exact error message dari debug output
- [ ] Check backend console logs saat register

---

## 🆘 Masih Tidak Berhasil?

Kalau masih ada error, ikuti ini:

1. **Jalankan debug script:**

   ```bash
   node src/debug/emailDebug.js
   ```

2. **Copy exact error message** dari output

3. **Share:**
   - Exact error message
   - .env configuration (hide sensitive values)
   - Backend console logs saat register
   - Email provider (Gmail / SendGrid / etc)

---

## 🔐 Security Notes

- **JANGAN share EMAIL_PASS** di public atau Git
- **JANGAN commit .env** ke version control
- Use `.env.example` untuk template, `.env` untuk secrets
- Change APP_PASSWORD regularly untuk security

---

## ✅ Setelah Email Working

Kalau debug script berhasil:

1. Test user registration dengan email real
2. Check inbox untuk activation email
3. Click activation link
4. User harus menjadi `isActive: true` di database

Kalau semua works, email feature sudah siap! 🎉
