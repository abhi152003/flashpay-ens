'use client';

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="showcase-mode">
      <style jsx global>{`
        .showcase-mode header {
          display: none !important;
        }
        .showcase-mode main {
          padding-top: 0 !important;
        }
      `}</style>
      {children}
    </div>
  );
}
