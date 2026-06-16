import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { SeasonCalendar } from './sections.jsx';
import { AppProvider } from '../../context/AppContext';
import { MONTHS } from '../../data/tokens';

afterEach(() => cleanup());

describe('SeasonCalendar', () => {
  it('renders exactly one column for each of the 12 months', () => {
    const { container } = render(
      <AppProvider>
        <SeasonCalendar />
      </AppProvider>
    );

    // Guards against the data source itself drifting away from 12 months
    expect(MONTHS).toHaveLength(12);

    MONTHS.forEach(month => {
      expect(screen.getByText(month)).toBeInTheDocument();
    });

    const columns = container.querySelectorAll('.month-col');
    expect(columns).toHaveLength(12);
  });
});
