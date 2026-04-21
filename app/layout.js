import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: 'Bookin App',
  description: 'تطبيق لإيجارات يشمل راس البر و دمياط الجديدة',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
