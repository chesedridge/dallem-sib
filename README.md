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

## GA4 Analytics Sync

The main page can show recent GA4 traffic metrics. GA collects page views in the browser, and `GET` or `POST /api/analytics/sync-ga` syncs GA4 aggregate data into Google Sheets.

### 1. Configure GA4

1. Use the Firebase-linked GA4 property `527817023`.
2. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to the Firebase web stream measurement ID `G-K7092CYHWZ`.
3. Enable the Google Analytics Data API in the same Google Cloud project used by the service account.
4. Add the service account email as a GA property viewer.

### 2. Configure sync environment variables

```bash
GA_PROPERTY_ID=527817023
GA_REPORT_START_DATE=30daysAgo
GA_REPORT_END_DATE=today
GA_PAGE_PATH=/
GOOGLE_SHEETS_ANALYTICS_SHEET_GID=1695159350
GOOGLE_SHEETS_ANALYTICS_SHEET_NAME=
ANALYTICS_SYNC_SECRET=long_random_secret
```

The sync endpoint writes these columns in the configured analytics sheet tab and updates rows by date:

- A: `날짜`
- B: `일간 '/' 라우트 뷰 수`
- C: `유니크 유저 수`
- D: `/페이지 내 버튼 클릭수`

When `GOOGLE_SHEETS_ANALYTICS_SHEET_GID` is set, the app resolves the tab name from the sheet gid. The current production gid `1695159350` resolves to `시트6`.

### 3. Trigger the sync

Call the endpoint from Cloud Scheduler after deployment:

```bash
curl -X POST \
  -H "x-analytics-sync-secret: $ANALYTICS_SYNC_SECRET" \
  https://your-domain.example/api/analytics/sync-ga
```

Example Cloud Scheduler job:

```bash
gcloud scheduler jobs create http sync-ga-to-sheets \
  --location=asia-east1 \
  --schedule="0 * * * *" \
  --time-zone="Asia/Seoul" \
  --uri="https://dallem-sib--dallem-sib.asia-east1.hosted.app/api/analytics/sync-ga" \
  --http-method=POST \
  --headers="x-analytics-sync-secret=$ANALYTICS_SYNC_SECRET"
```

Hourly is enough for "today so far" style reporting. Daily is enough if the main page should only show completed daily totals.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
