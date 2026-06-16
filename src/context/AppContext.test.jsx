import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AppProvider, useAppContext } from './AppContext';

afterEach(() => cleanup());

// handleBookmark only exists inside context — this harness exposes it
// through a button + a visible watchlist dump so we can assert on it
// without reaching into React internals.
function BookmarkHarness({ crop }) {
  const { watchlist, handleBookmark } = useAppContext();
  return (
    <div>
      <button onClick={() => handleBookmark(crop)}>toggle</button>
      <span data-testid="watchlist">{JSON.stringify(watchlist)}</span>
    </div>
  );
}

describe('handleBookmark', () => {
  const crop = { id: 'wheat-punjab', name: 'Punjab Wheat' };

  it('adds the crop id to the watchlist on first call', () => {
    render(
      <AppProvider>
        <BookmarkHarness crop={crop} />
      </AppProvider>
    );

    expect(screen.getByTestId('watchlist').textContent).toBe('[]');
    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('watchlist').textContent).toBe(
      JSON.stringify([crop.id])
    );
  });

  it('removes the crop id on a second call to the same crop (toggle behavior)', () => {
    render(
      <AppProvider>
        <BookmarkHarness crop={crop} />
      </AppProvider>
    );

    const button = screen.getByText('toggle');
    fireEvent.click(button); // add
    fireEvent.click(button); // remove
    expect(screen.getByTestId('watchlist').textContent).toBe('[]');
  });
});
