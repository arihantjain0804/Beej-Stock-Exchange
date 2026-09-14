import { useEffect } from 'react';

// Watches all elements with the class "reveal" and adds the class
// "visible" when they scroll into the viewport. This triggers the
// fade-up animation defined in tokens.css.
//
// Fix: the original version only ran document.querySelectorAll('.reveal')
// once, on mount. Content that renders later — e.g. CropCards / BeejIndex,
// which wait on an async token fetch — was never queried, so those
// elements never got observed and stayed at opacity:0 forever (only
// "fixed" by remounting the page with an already-warm data cache, e.g.
// navigating Home -> Markets a second time). A MutationObserver now
// watches for newly-added .reveal elements and observes them as they
// appear, so first-load async content reveals correctly too.
export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const observeNew = (root = document) => {
      root.querySelectorAll('.reveal:not(.reveal-observed)').forEach(el => {
        el.classList.add('reveal-observed');
        io.observe(el);
      });
    };

    observeNew(); // whatever's already in the DOM on mount

    const mo = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.addedNodes.length) {
          observeNew();
          break;
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}