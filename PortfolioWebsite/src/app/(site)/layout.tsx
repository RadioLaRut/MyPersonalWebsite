import CustomCursor from "@/components/layout/CustomCursor";
import ComponentDesignCommitRefresh from "@/components/layout/ComponentDesignCommitRefresh";
import Navigation from "@/components/layout/Navigation";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { isTestingMode } from "@/lib/site-mode";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const testingMode = isTestingMode();

  return (
    <>
      {testingMode ? (
        <>
          <ComponentDesignCommitRefresh />
          <div className="site-grid-debug" aria-hidden="true">
            <div className="site-grid-debug__grid grid-container">
              {Array.from({ length: 12 }, (_, index) => (
                <span key={`site-grid-debug-${index + 1}`} className="site-grid-debug__column" />
              ))}
            </div>
          </div>
        </>
      ) : null}
      <SmoothScroll>
        <CustomCursor />
        <Navigation />
        {children}
      </SmoothScroll>
    </>
  );
}
