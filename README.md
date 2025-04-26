# Prayer Mate

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## About Prayer Mate

Prayer Mate is a web application that helps users find prayer times at their location and discover mosques nearby. The app provides a user-friendly interface for:

- Finding mosques by name, location, or thier current location
- Viewing detailed prayer times for each mosque
- Searching for mosques with specific prayer times
- Getting directions to mosques
- Viewing mosque photos and information

## Features

### For Users

- **Mosque Search**: Find mosques by name, location, or using your current coordinates
- **Prayer Time Search**: Find mosques with specific prayer times (Fajr, Zohar, Asr, Maghrib, Isha, Juma)
- **Detailed Mosque Pages**: View comprehensive information about each mosque including:
  - Prayer times (regular and special prayers)
  - Location with interactive map
  - Mosque photos
  - Imam information
  - Direction links to Google Maps
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Dark/Light Mode**: Toggle between dark and light themes

### For Imams

- **Mosque Management**: Create and manage mosque information
- **Prayer Time Updates**: Set and update prayer times for regular and special prayers
- **Photo Gallery**: Upload and manage mosque photos

### For Admins

- **Verification Dashboard**: Review and verify mosque submissions
- **Mosque Management**: Approve or reject mosque submissions

## Getting Started

## Live Demo

You can try the live application at [kmwf-prayermate.vercel.app](https://kmwf-prayermate.vercel.app/)

### For Developers

#### Fork and Clone

1. Fork the repository from [github.com/lfgraphics/prayer-mate](https://github.com/lfgraphics/prayer-mate)
2. Clone your forked repository:

```bash

git clone https://github.com/lfgraphics/prayer-mate.git
cd prayer-mate
npm install
# or
yarn install

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.