import { useEffect } from 'react';

// Watches all elements with the class "reveal" and adds the class
// "visible" when they scroll into the viewport. This triggers the
// fade-up animation defined in tokens.css.
export function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(el => {
          if (el.isIntersecting) el.target.classList.add('visible');
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}