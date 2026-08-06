export const metadata = {
  title: "Helix — AI Business Development OS for Robinhood Chain",
  description: "Discover partners. Find grants. Raise capital. Grow faster.",
};

export const viewport = {
  themeColor: "#F1F1EC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#F1F1EC" }}>{children}</body>
    </html>
  );
}
