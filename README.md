This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
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

---

Tailwind is a must
next or react, next sounds good.

(This will involve contingency.)

Single national park. Booking pop up. Throbber. Reviews carousel. Pictures of animals, vistas, ticket type tabs

pages: home, booking =>confirmation =>booking summary, payment, history(requries login)
does user have to login to buy tickets? Make login mandatory for simplification.

increase/decrease count components

Homepage
• Overview of the National Park
• Ticket types (Zoo Entry, Safari, Combo, etc.)
• Display available safari timings

Ticket Booking Page
• Select ticket type
• Select quantity
• Select safari timing
• Auto-calculate total amount

Booking Summary Page
• Display selected ticket details
• Total amount
• User details form

Payment Page
• Payment methods:
o UPI
o Netbanking
o Debit Card
• On “Pay Now”, call backend API
• Automatic “success” result after 2–3 seconds

Booking Confirmation Page
• Booking ID
• Ticket details
• Timing
• Amount paid

Booking History (Optional)
Requires login
• Show list of past bookings


Additional Requirements
• Form validations
• Loading states
• Error messages
• Responsive design
• API integration with backend