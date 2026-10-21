import { ViewTransition, type ReactNode } from "react";

/**
 * Wrap each page's content in this so moving between pages crossfades smoothly.
 * It must sit in page.tsx, not the layout: layouts stay mounted between pages, so they never animate.
 */
export function Page({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
