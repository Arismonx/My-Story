# My Story

สมุดบันทึกเรื่องราวส่วนตัว ใช้ได้ทั้งคอมพิวเตอร์และมือถือ ข้อมูลเก็บในเครื่องของคุณ

- จดบันทึก บันทึกอัตโนมัติ พร้อมวันที่จดและวันที่แก้ไขล่าสุด
- ค้นหา, จัดกลุ่มตามวัน
- Export เป็น `.md` หรือ `.txt` (ทีละโน้ตหรือทั้งหมด)
- ติดตั้งลงมือถือได้ (PWA) และใช้ออฟไลน์ได้

## เริ่มใช้งาน
```bash
nvm use
npm install
npm run dev
```

## Deploy ขึ้น GitHub Pages
1. push ขึ้น GitHub (branch `main`)
2. Settings → Pages → Source: **GitHub Actions**
3. workflow `.github/workflows/deploy.yml` จะ build แล้ว deploy ให้ทุกครั้งที่ push

## ติดตั้งบนมือถือ
- **Android (Chrome):** เมนู ⋮ → "ติดตั้งแอป" / "เพิ่มลงในหน้าจอหลัก"
- **iPhone (Safari):** ปุ่มแชร์ → "เพิ่มไปยังหน้าจอโฮม"

> โน้ตเก็บในเบราว์เซอร์ของแต่ละเครื่อง ถ้าล้างข้อมูลเว็บไซต์โน้ตจะหาย ให้ export เก็บไว้เป็นระยะ

## เวอร์ชัน
ดู [CHANGELOG.md](CHANGELOG.md) · เอกสารออกแบบ [docs/BLUEPRINT.md](docs/BLUEPRINT.md)

## เจอบัค?
เขียนลง [docs/BUGS.md](docs/BUGS.md) ใต้ **📥 Inbox** แล้วสั่ง `/fix-bugs` ใน Claude Code
