import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Footer } from './sections.jsx';
import { AppProvider } from '../../context/AppContext';

afterEach(() => cleanup());

describe('Footer', () => {
  it('renders the three column headings', () => {
    render(
      <AppProvider>
        <Footer />
      </AppProvider>
    );

    ['Platform', 'Company', 'Legal & Compliance'].forEach(heading => {
      expect(screen.getByText(heading)).toBeInTheDocument();
    });
  });
});
