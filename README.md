# PERMINTAAN-JABAR Web App

## Deskripsi Project
Web application untuk manajemen permintaan toko dengan 3 dashboard:
1. **Dashboard UMUM (Sales)** - Input permintaan & monitoring status
2. **Dashboard DM** - Review & approval data
3. **Dashboard SERVICE** - Proses & verifikasi permintaan

## Fitur Utama
- Form input permintaan dengan validasi data dari Google Sheets
- Sistem approval multi-level (Sales → Service → DM)
- Generate nomor surat otomatis (PRMNT/JAB/TH/BULAN/URUT)
- Export PDF resmi dengan cap & tanda tangan
- WhatsApp notification untuk setiap aktivitas
- Status tracking (PENDING, APPROVE, REJECT, DONE)

## Tech Stack
- Frontend: HTML5, CSS3, JavaScript
- Backend: Google Apps Script / Node.js
- Database: Google Sheets
- PDF Generation: html2pdf / pdfmake
- Messaging: WhatsApp Business API

## Struktur Folder
```
├── index.html              # Main app
├── css/
│   └── style.css          # Styling
├── js/
│   ├── app.js             # Main app logic
│   ├── dashboard-umum.js  # Sales dashboard
│   ├── dashboard-dm.js    # DM dashboard
│   ├── dashboard-service.js # Service dashboard
│   ├── api.js             # Google Sheets API
│   ├── pdf.js             # PDF generation
│   └── whatsapp.js        # WhatsApp integration
├── sheets/
│   └── config.js          # Sheet IDs & ranges
└── docs/
    └── requirements.md    # Detailed requirements
```

## Sheet yang Diperlukan
1. **TOKO** - Kolom: A=Nama Toko, B=Sales, C=Area Service
2. **UNIT** - Kolom: A=Unit ID, B=Type (dari 4 digit seri)
3. **DATA** - Kolom: Nomor Surat, Tanggal, Toko, Type, Seri, Detail Barang, Status
4. **CAP** - Kolom: A=Nama Toko, B=Cap (image base64)
5. **PDS** - Kolom: A=Nama Toko, B=Service
6. **DM** - Kolom: A=Nama DM, B=Kontak WhatsApp

## Workflow
```
SALES: Input Form → SALES: Approval
          ↓
    SERVICE: Approval
          ↓
    DM: Final Approval (TTD & Cap)
          ↓
    SERVICE: Download PDF
          ↓
    SERVICE: Change Status → DONE
```

## WhatsApp Notifications
- Sales input form → Kirim ke SERVICE
- Service approve → Kirim ke DM
- DM approve → Kirim ke SERVICE
- Service done → Kirim ke SALES
