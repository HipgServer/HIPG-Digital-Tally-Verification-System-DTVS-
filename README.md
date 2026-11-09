# HIPG Digital Tally & Verification System (DTVS)

Enterprise-grade Digital Vehicle Tally, Inspection, and Verification System developed for **Hambantota International Port Group (HIPG)**, Sri Lanka.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Glassmorphic enterprise palette
- **Icons**: Lucide React
- **Database**: Mongoose & MongoDB (with automatic resilient file fallback)
- **PWA & Offline**: IndexedDB, Service Worker (`public/sw.js`), Background Heartbeat Synchronization
- **Verification**: QR Code Generation (`qrcode`) & Gate Verification Terminal
- **Reporting**: Professional Corporate PDF Generator (`jspdf`) & Dataset CSV Export

## Getting Started

1. **Install Dependencies**:
```bash
npm install
```

2. **Run Development Server**:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build & Production**:
```bash
npm run build
npm start
```

## Seed Demo Accounts
You can log in directly or use the one-click quick role switcher in the UI:
- **Security Officer**: `security01` / `pass123` (Badge: HIPG-SEC-104)
- **Supervisor**: `supervisor01` / `pass123` (Badge: HIPG-SUP-012)
- **Administrator**: `admin` / `admin123` (Badge: HIPG-ADM-001)
- **CSD**: `csd01` / `pass123` (Badge: HIPG-CSD-005)
- **Security Viewer**: `viewer01` / `pass123` (Badge: HIPG-GAT-201)
- **Delivery Driver**: `driver01` / `pass123` (Badge: LOG-DRV-882)

## MONGODB_URI=mongodb+srv://chathuzpmc_db_user: vtuRmx4ls0DQNqKE@cluster0 iufsjec.mongodb.net/
