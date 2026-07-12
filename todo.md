# GaFiwSHOP Purple - TODO

## Phase 2: Database Schema
- [x] สร้างตาราง products (id, name, category, price, original_price, image, description, is_active)
- [x] สร้างตาราง product_stock (id, product_id, account, password, is_sold, sold_at)
- [x] สร้างตาราง orders (id, user_id, product_id, stock_id, amount, status, account_delivered, created_at)
- [x] สร้างตาราง topups (id, user_id, amount, slip_url, status, approved_by, created_at)
- [x] สร้างตาราง announcements (id, title, content, type, image_url, likes, views, created_at)
- [x] สร้างตาราง flash_sales (id, product_id, sale_price, end_at, is_active)
- [x] เพิ่ม balance field ใน users table
- [x] Run migration SQL

## Phase 3: Backend API
- [x] products router (list, get, categories)
- [x] orders router (create, list, get by user)
- [x] topup router (submit, list, approve/reject by admin)
- [x] announcements router (list, create, like)
- [x] flash_sale router (list active, get by product)
- [x] admin router (stats, manage products, stock, topups)
- [x] stock router (add stock, get count)
- [x] user router (balance, profile)

## Phase 4: Frontend - Theme & Layout
- [x] ตั้งค่า CSS variables ธีมสีม่วง-ขาว
- [x] เพิ่ม Google Fonts (Noto Sans Thai)
- [x] สร้าง Bottom Navigation Bar (mobile)
- [x] สร้าง Top Navigation Bar (desktop)
- [x] สร้าง Home Page (Flash Sale, Banner Slider, Menu, Recent Orders, Stats, FAQ)
- [x] Flash Sale countdown timer
- [x] Banner/Hero Slider
- [x] Recommended Menu icons
- [x] Real-time recent orders feed
- [x] Shop statistics section
- [x] FAQ accordion

## Phase 5: Frontend - Feature Pages
- [x] หน้า Products (แยกหมวดหมู่, ค้นหา, filter)
- [x] หน้า Product Detail
- [x] หน้า Top Up (อัพโหลดสลิป)
- [x] หน้า Order History
- [x] หน้า Profile / Account
- [x] หน้า Announcements + Detail
- [x] Login ผ่าน Manus OAuth

## Phase 6: Admin Panel
- [x] Admin Dashboard (สถิติ)
- [x] จัดการสินค้า (CRUD)
- [x] จัดการสต็อก (เพิ่ม account/password)
- [x] จัดการการเติมเงิน (อนุมัติ/ปฏิเสธ)
- [x] จัดการประกาศ (CRUD)
- [x] จัดการ Flash Sale
- [x] ดูประวัติออเดอร์ทั้งหมด

## Phase 7: GitHub & Deploy
- [x] Push code ไปยัง GitHub repo boynaa1122-ui/Apps-stem-online
- [ ] Deploy บน Vercel (ผู้ใช้ทำเอง)
- [ ] Setup Supabase (ผู้ใช้ทำเอง)
