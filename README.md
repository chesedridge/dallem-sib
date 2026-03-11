This is a [Next.js](https://nextjs.org) project for a PHQ-9 survey flow.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Google Sheets Storage

Survey responses from `/apply` are saved through `POST /api/survey-results`, then appended to Google Sheets.

### 1. Create and share a sheet

1. Create a Google Sheet.
2. Create a Google Cloud service account and enable the Google Sheets API.
3. Share the sheet with the service account email as an editor.
4. Copy the spreadsheet ID from the sheet URL.

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values.

Recommended for servers and deployment platforms:

```bash
GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=base64_encoded_service_account_json
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SHEETS_SHEET_NAME=Sheet1
```

Local fallback if you want to keep separate fields:

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SHEETS_SHEET_NAME=Sheet1
```

`GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` is the safest option in production because it avoids PEM line-break parsing issues.

### 3. Saved columns

The API writes these columns automatically:

- `접수일`
- `개인정보수집동의`
- `닉네임`
- `연락처`
- `지역`
- `문항1` to `문항9`
- `총점`
- `위험단계`

If the target sheet is empty, the header row is created automatically on row 3, and data starts from row 4.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
