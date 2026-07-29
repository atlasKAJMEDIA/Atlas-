export const metadata = {
  title: "Atlas — AI Business Development OS for Robinhood Chain",
  description: "Discover partners. Find grants. Raise capital. Grow faster.",
};

export const viewport = {
  themeColor: "#E3E3E1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#E3E3E1" }}>{children}</body>
    </html>
  );
}
