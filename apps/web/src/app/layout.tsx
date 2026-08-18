import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "Where They Stand", description: "Candidate positions, supported by public evidence." };
const links = [["Find My Races", "/find"], ["The 15 Issues", "/issues"], ["Methodology", "/methodology"], ["About", "/about"]];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><header className="site-header"><div className="shell"><Link className="brand" href="/">Where They Stand</Link><nav aria-label="Primary">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav></div></header><main>{children}</main><footer className="site-footer"><div className="shell">No endorsements. No party inference. Every published stance is sourced.</div></footer></body></html>;
}
