# 🐛 CARA DEBUG EMAIL - LANGKAH DEMI LANGKAH

## 📌 TL;DR - Solusi Cepat (99% Kasus)

Jika email tidak terkirim, 99% penyebabnya adalah **Gmail App Password salah**.

**Ikuti ini:**

```
1. Buka: https://myaccount.google.com/security
2. Enable "2-Step Verification" (jika belum)
3. Cari "App passwords"
4. Select Mail + Windows Computer
5. Copy password yang di-generate (persis, dengan spaces)
6. Update di .env FILE:
   EMAIL_PASS="paste-here-exactly-16-chars"
7. Restart backend
8. Test register
```

Kalau masih tidak jalan, ikuti step lebih detail di bawah ⬇️

---

## 🔧 DEBUGGING STEP BY STEP

### STEP 1: Jalankan Debug Script

Buka terminal di folder `WISHLISTGAME-backend/` dan jalankan:

```bash
node src/debug/emailDebug.js
```

**Script ini akan:**

- ✅ Check semua environment variables
- ✅ Cek SMTP connection
- ✅ Coba kirim test email
- ✅ Show error details

---

### STEP 2: Interpretasi Output Script

#### ✅ JIKA BERHASIL (SUCCESS)

Output terakhir akan seperti ini:

```
✅ All tests passed! Your email system is working correctly.

🚀 Next steps:
   1. Check your email inbox for the test email
   2. Check spam/junk folder if not in inbox
   3. If you received it, registration emails will work!
```

**ARTINYA:** Email system sudah OK, silakan test register user.

---

#### ❌ JIKA ERROR - LIHAT TABEL INI

| Error Message                   | Penyebab                            | Solusi                                                      |
| ------------------------------- | ----------------------------------- | ----------------------------------------------------------- |
| **❌ EMAIL_HOST: NOT SET**      | .env tidak ada EMAIL_HOST           | Edit .env, tambah `EMAIL_HOST="smtp.gmail.com"`             |
| **❌ EMAIL_USER: NOT SET**      | .env tidak ada EMAIL_USER           | Edit .env, tambah `EMAIL_USER="your-email@gmail.com"`       |
| **❌ EMAIL_PASS: NOT SET**      | .env tidak ada EMAIL_PASS           | Edit .env, tambah `EMAIL_PASS="app-password"`               |
| **Code: EAUTH** (Invalid login) | Password salah / bukan App Password | Gunakan Gmail App Password (16 char) bukan regular password |
| **Code: ECONNREFUSED**          | Tidak bisa connect ke SMTP          | Cek EMAIL_HOST, cek internet, coba port 465                 |
| **Code: ETIMEDOUT**             | Timeout connect ke SMTP             | Cek internet, coba port 465, coba network lain              |
| **Connection timeout**          | Firewall blocking port              | Coba port 465, atau different network                       |

---

### STEP 3: KHUSUS GMAIL - Cara Dapat App Password

**⚠️ PENTING:** Gmail requires App Password, bukan regular password!

#### Sub-Step 3.1: Enable 2-Step Verification

1. Buka https://myaccount.google.com
2. Klik **Security** di kiri
3. Cari **2-Step Verification**
4. Klik dan ikuti prosesnya
5. Verify dengan SMS atau authenticator

#### Sub-Step 3.2: Generate App Password

1. Setelah 2FA enabled, buka kembali https://myaccount.google.com/security
2. Scroll ke bawah, cari **App passwords**
3. Klik "App passwords"
4. Select:
   - Select the app: **Mail**
   - Select the device: **Windows Computer**
5. Google akan generate password 16 char, seperti: `qwer tyui asdf ghjk`
6. **COPY PERSIS** (jangan edit, jangan remove spaces)

#### Sub-Step 3.3: Update .env

```env
EMAIL_PASS="qwer tyui asdf ghjk"
```

**⚠️ PERHATIAN:**

- Copy PERSIS dengan spacenya
- Jangan remove atau edit karakternya
- Jangan pakai regular Gmail password
- Jangan share password ini ke public

---

### STEP 4: Edit .env File (Jika Belum)

Lokasi file: `WISHLISTGAME-backend/.env`

Harus memiliki:

```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="fauzannaufal807@gmail.com"
EMAIL_PASS="qwer tyui asdf ghjk"
EMAIL_FROM="fauzannaufal807@gmail.com"
```

**Tips:**

- Tidak boleh ada trailing spaces
- String harus di-quote
- Jangan ada extra line di ujung file

---

### STEP 5: Restart Backend

Setelah update .env:

```bash
# Stop backend (Ctrl+C)
# Restart:
npm run dev
# atau
node src/server.js
```

**Yang harus keluar di console:**

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

**Jika keluar "❌ Email transport verification failed:", ada masalah config.**

---

### STEP 6: Test Register User

1. Buka frontend (http://localhost:5173)
2. Go to Register
3. Fill form:
   - Email: `test123@gmail.com` (use real email you can access)
   - Password: `Password123!`
   - Name: `Test User`
4. Click Register

**Yang harus terjadi:**

- Frontend: "Register successful. Check your email..."
- Backend console: `✅ Email sent successfully`
- Gmail inbox: Activation email menerima dalam 10 detik

---

### STEP 7: Kalo Email Tidak Terima

1. **Check spam/junk folder** (Gmail sering filter)
2. **Backend console, check:**

   ```
   📧 Sending email to: test123@gmail.com via smtp.gmail.com:587
   ✅ Email sent successfully: [message details]
   ```

   - Jika ada ini = email berhasil kirim
   - Email tidak diterima = firewall/filter sisi Gmail

3. **Try test dengan email dari provider berbeda:**
   - Coba `@gmail.com` → `@yahoo.com` dst
   - Ada kemungkinan Gmail filter terlalu ketat

---

## 📋 FULL CHECKLIST

- [ ] .env file exists di `WISHLISTGAME-backend/`
- [ ] .env memiliki semua EMAIL variables
- [ ] EMAIL_USER adalah email Gmail valid
- [ ] EMAIL_PASS adalah App Password (16 char), bukan regular password
- [ ] Gmail account memiliki 2-Step Verification enabled
- [ ] Backend restarted setelah .env update
- [ ] Console menunjukkan `✅ Email transport ready`
- [ ] Run `node src/debug/emailDebug.js` → SUCCESS
- [ ] Test email diterima ke inbox
- [ ] Test registration email diterima

---

## 🆘 Masih tidak bisa?

**Run this and share output:**

```bash
# Terminal di WISHLISTGAME-backend folder:
node src/debug/emailDebug.js
```

**Share:**

1. Exact error message dari script
2. Backend console logs saat register
3. Screenshot .env EMAIL variables (without PASSWORD)
4. Screenshot Gmail account 2FA settings

---

## ✅ Setelah Email Jalan

Kalau debug script SUCCESS dan test email diterima:

1. User register dengan email real
2. Cek email inbox
3. Click activation link
4. Account seharusnya active
5. Bisa login

🎉 **EMAIL FEATURE WORKING!**

---

## 🔗 Useful Links

- Gmail Account Security: https://myaccount.google.com/security
- Enable 2FA: https://myaccount.google.com/security#howtoremoveaccount
- App Passwords: https://myaccount.google.com/apppasswords
- Nodemailer Docs: https://nodemailer.com/
- Gmail SMTP Settings: https://support.google.com/mail/answer/7126229
