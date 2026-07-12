# 🎬 GaFiwSHOP - ร้านขายบัญชี Streaming ออนไลน์

![GaFiwSHOP](https://img.shields.io/badge/GaFiwSHOP-Streaming%20Store-blueviolet?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=flat-square)

---

## 📱 ภาพรวมโครงการ

**GaFiwSHOP** คือเว็บแอพพลิเคชันสำหรับขายบัญชี Streaming (Netflix, Disney+, YouTube Premium, HBO Max, VIU, Spotify, Prime Video) แบบอัตโนมัติ พร้อมระบบชำระเงิน Stripe, เติมเงิน, Admin Panel ครบครัน

### ✨ ฟีเจอร์หลัก

- 🎯 **Flash Sale พร้อม Countdown Timer** - แสดงส่วนลดราคาแบบเรียลไทม์
- 🛒 **ระบบตะกร้าสินค้า** - ซื้อสินค้าอัตโนมัติพร้อมส่ง account/password ทันที
- 💳 **Stripe Payment Integration** - ชำระเงินด้วยบัตรเครดิต/เดบิต
- 💰 **ระบบเติมเงิน** - รองรับสลิปธนาคาร + Stripe
- 👤 **ระบบสมาชิก** - สมัคร/เข้าสู่ระบบ พร้อมแสดงยอดเงิน
- 📊 **Admin Panel** - จัดการสินค้า สต็อก เติมเงิน ประกาศ Flash Sale สถิติ
- 📱 **Mobile-First Design** - ดีไซน์ธีมสีม่วง-ขาว เหมาะสำหรับมือถือ
- 🔔 **Real-time Updates** - ประวัติสั่งซื้อและประกาศข่าวสารอัปเดตแบบ real-time
- 🎨 **Modern UI/UX** - ใช้ Tailwind CSS 4 + shadcn/ui components

---

## 🚀 ฟีเจอร์ทั้งหมด

### หน้าผู้ใช้ (User Pages)

| หน้า | ฟีเจอร์ |
|---|---|
| **Home** | Flash Sale, Banner Slider, Menu, Recent Orders, Stats, FAQ |
| **Products** | ค้นหา Filter สินค้า แยกหมวดหมู่ |
| **Product Detail** | ข้อมูลสินค้า ราคา สต็อก ปุ่มซื้อ (Balance + Stripe) |
| **Cart** | ตะกร้าสินค้า ชำระเงิน |
| **Top Up** | เติมเงินผ่านสลิป + Stripe |
| **Orders** | ประวัติการสั่งซื้อ ข้อมูล account/password |
| **Profile** | ข้อมูลผู้ใช้ ยอดเงิน ประวัติเติมเงิน |
| **Announcements** | ข่าวสารและประกาศจากร้าน |

### Admin Panel

| หน้า | ฟีเจอร์ |
|---|---|
| **Dashboard** | สถิติ (ยอดขาย, ผู้ใช้, สต็อก, เติมเงิน) |
| **Products** | เพิ่ม/แก้ไข/ลบสินค้า |
| **Stock Management** | เพิ่มสต็อก account/password |
| **Top-ups** | อนุมัติ/ปฏิเสธคำขอเติมเงิน |
| **Announcements** | สร้างประกาศข่าวสาร |
| **Flash Sales** | สร้าง Flash Sale พร้อม countdown |
| **Orders** | ดูประวัติออเดอร์ทั้งหมด |

---

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **React 19** - UI Library
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component Library
- **Wouter** - Routing
- **tRPC** - Type-safe API calls
- **Framer Motion** - Animations

### Backend
- **Express.js** - Web Server
- **tRPC** - RPC Framework
- **Drizzle ORM** - Database ORM
- **MySQL/TiDB** - Database
- **Stripe SDK** - Payment Processing
- **Node.js** - Runtime

### DevOps & Deployment
- **Vite** - Build Tool
- **Vercel** - Hosting (Optional)
- **GitHub** - Version Control
- **Docker** - Containerization (Optional)

---

## 📋 ข้อกำหนดระบบ

### ก่อนการติดตั้ง
- **Node.js** v18+ 
- **pnpm** v10+ (Package Manager)
- **MySQL/TiDB** Database
- **Stripe Account** (สำหรับ Payment)
- **GitHub Account** (สำหรับ Repository)

---

## 🔧 คู่มือการติดตั้ง

### 1️⃣ Clone Repository

```bash
git clone https://github.com/boynaa1122-ui/Apps-stem-online.git
cd Apps-stem-online
```

### 2️⃣ ติดตั้ง Dependencies

```bash
pnpm install
```

### 3️⃣ ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ในโฟลเดอร์ root:

```env
# Database
DATABASE_URL=mysql://username:password@localhost:3306/gafiwshop

# JWT Secret (สร้างค่าสุ่ม 32+ ตัวอักษร)
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars

# OAuth (Manus)
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Owner Info
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-open-id

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

### 4️⃣ สร้าง Database Schema

```bash
# Generate Drizzle migrations
pnpm drizzle-kit generate

# Apply migrations (ถ้าใช้ Manus built-in DB)
# หรือรัน SQL ด้วย GUI
```

### 5️⃣ เรียกใช้ Development Server

```bash
pnpm dev
```

เปิด http://localhost:3000 ในเบราว์เซอร์

---

## 📦 Build & Production

### Build สำหรับ Production

```bash
pnpm build
```

### เรียกใช้ Production Server

```bash
pnpm start
```

---

## 🚀 Deployment Guide

### Deploy บน Vercel

1. **Push โค้ดขึ้น GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **เชื่อมต่อ Vercel**
   - ไปที่ https://vercel.com
   - คลิก "New Project"
   - เลือก GitHub Repository
   - ตั้งค่า Environment Variables

3. **ตั้งค่า Environment Variables ใน Vercel**
   - ไปที่ Settings → Environment Variables
   - เพิ่มตัวแปรทั้งหมดจาก `.env.local`

4. **Deploy**
   - คลิก "Deploy"
   - รอให้ deployment เสร็จ

### Deploy บน Railway / Render

ขั้นตอนคล้ายกับ Vercel แต่ต้องตั้งค่า:
- Build Command: `pnpm run build`
- Start Command: `pnpm start`
- Port: `3000`

---

## 🔐 ตั้งค่า Stripe

### 1. สร้าง Stripe Account
- ไปที่ https://stripe.com
- สมัครสมาชิก
- ยืนยันตัวตน (KYC)

### 2. ได้รับ API Keys
- ไปที่ Dashboard → Developers → API Keys
- Copy `Secret Key` และ `Publishable Key`
- เพิ่มลงใน `.env.local`

### 3. ตั้งค่า Webhook
- ไปที่ Developers → Webhooks
- คลิก "Add endpoint"
- URL: `https://yourdomain.com/api/stripe/webhook`
- เลือก Events:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
- Copy Webhook Secret
- เพิ่มลงใน `STRIPE_WEBHOOK_SECRET`

### 4. ทดสอบ Payment
- ใช้ Test Card: `4242 4242 4242 4242`
- Expiry: `12/25`
- CVC: `123`

---

## 👨‍💼 Admin Setup

### สร้าง Admin User

1. **สมัครสมาชิกปกติก่อน**
   - ไปที่เว็บ → เข้าสู่ระบบ

2. **เปลี่ยนเป็น Admin**
   - เข้า Database GUI
   - รัน SQL:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

3. **เข้า Admin Panel**
   - ไปที่ `/admin`
   - ตรวจสอบว่าเข้าได้

### เพิ่มสินค้า

1. ไปที่ Admin → Products
2. คลิก "Add Product"
3. กรอกข้อมูล:
   - ชื่อสินค้า
   - หมวดหมู่
   - ราคา
   - รูปภาพ (URL)
4. คลิก "Save"

### เพิ่มสต็อก

1. ไปที่ Admin → Stock Management
2. เลือกสินค้า
3. ใส่ account/password แต่ละบรรทัด:
   ```
   email@example.com:password123
   email2@example.com:password456
   ```
4. คลิก "Add Stock"

### สร้าง Flash Sale

1. ไปที่ Admin → Flash Sales
2. คลิก "Create Flash Sale"
3. เลือกสินค้า
4. ตั้งราคาลด
5. ตั้งเวลา Countdown
6. คลิก "Save"

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  balance DECIMAL(12, 2) DEFAULT 0.00,
  stripeCustomerId VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  categoryId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  imageUrl TEXT,
  isActive BOOLEAN DEFAULT TRUE,
  soldCount INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  productId INT NOT NULL,
  productName VARCHAR(255),
  amount DECIMAL(10, 2),
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  accountDelivered TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Top-ups Table
```sql
CREATE TABLE topups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  amount DECIMAL(10, 2),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  slipUrl TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Testing

### ทดสอบ Payment Flow

```bash
# 1. เข้าสู่ระบบ
# 2. ไปที่ Products
# 3. เลือกสินค้า
# 4. คลิก "💳 Stripe Checkout"
# 5. ใส่ Test Card: 4242 4242 4242 4242
# 6. ยืนยัน
```

### ทดสอบ Top-up

```bash
# 1. ไปที่ Top Up
# 2. ใส่จำนวนเงิน
# 3. คลิก "💳 Stripe - ฿XXX"
# 4. ทำการชำระเงิน
```

### ทดสอบ Admin Functions

```bash
# 1. เข้า Admin Panel (/admin)
# 2. ทดสอบแต่ละ section:
#    - Dashboard (ดูสถิติ)
#    - Products (เพิ่ม/แก้ไข)
#    - Stock (เพิ่มสต็อก)
#    - Top-ups (อนุมัติ)
#    - Flash Sales (สร้าง)
```

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**วิธีแก้:** ตรวจสอบว่า MySQL/TiDB ทำงานอยู่ และ `DATABASE_URL` ถูกต้อง

### Stripe Webhook ไม่ทำงาน
```
Error: Webhook signature verification failed
```
**วิธีแก้:**
1. ตรวจสอบ `STRIPE_WEBHOOK_SECRET` ถูกต้อง
2. ตรวจสอบ Webhook endpoint ที่ Stripe Dashboard
3. ดู Stripe Logs ที่ Developers → Webhooks

### Payment ไม่สำเร็จ
```
Error: Your card was declined
```
**วิธีแก้:**
1. ใช้ Test Card ที่ถูกต้อง: `4242 4242 4242 4242`
2. ตรวจสอบว่า Stripe ยังอยู่ในโหมด Test
3. ตรวจสอบ `VITE_STRIPE_PUBLISHABLE_KEY` ถูกต้อง

### Admin Panel ไม่แสดง
```
Error: Access Denied
```
**วิธีแก้:**
1. ตรวจสอบว่า user มี role = 'admin'
2. รัน SQL: `UPDATE users SET role = 'admin' WHERE id = 1;`

---

## 📈 Performance Tips

### Optimization
- ใช้ CDN สำหรับรูปภาพ
- Enable Compression ใน Nginx/Apache
- ตั้งค่า Cache Headers
- ใช้ Database Indexes

### Monitoring
- ติดตั้ง Sentry สำหรับ Error Tracking
- ใช้ Google Analytics สำหรับ User Behavior
- ตรวจสอบ Server Logs อย่างสม่ำเสมอ

---

## 📝 License

MIT License - ใช้งานได้อย่างอิสระ

---

## 👨‍💻 Support & Contact

- **GitHub Issues:** https://github.com/boynaa1122-ui/Apps-stem-online/issues
- **Email:** back3329@gmail.com
- **Documentation:** ดูไฟล์ `DEPLOY_GUIDE.md`

---

## 🎁 Bonus Features

### สามารถเพิ่มได้ในอนาคต
- ✅ Subscription Management (สมัครสมาชิกรายเดือน)
- ✅ Referral Program (แนะนำเพื่อน)
- ✅ Coupon/Promo Codes
- ✅ Email Notifications
- ✅ SMS Notifications
- ✅ Two-Factor Authentication (2FA)
- ✅ API Documentation (Swagger)
- ✅ Mobile App (React Native)

---

## 🙏 ขอบคุณ

สร้างด้วย ❤️ โดย GaFiwSHOP Team

**Happy Selling! 🚀**
