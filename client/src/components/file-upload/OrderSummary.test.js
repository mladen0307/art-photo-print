import React from 'react';
import { render } from '@testing-library/react';

import OrderSummary from './OrderSummary';

describe('OrderSummary', () => {
  it('shows the selected format, photo icon, and order total', () => {
    const { getByText, getByTestId } = render(
      <OrderSummary
        format="10x15"
        photoCount={3}
        pricePerPhoto={20}
        total={60}
        courierDelivery
      />
    );

    expect(getByText('10x15')).toBeTruthy();
    expect(getByTestId('order-summary-photo-icon').textContent).toBe(
      'photo_library'
    );
    expect(getByText('3 fotografije')).toBeTruthy();
    expect(getByText('60 rsd')).toBeTruthy();
    expect(getByText('Poštarina se obračunava posebno')).toBeTruthy();
  });

  it('keeps unavailable prices explicit', () => {
    const { getByText } = render(
      <OrderSummary
        photoCount={0}
        pricePerPhoto=""
        total=""
      />
    );

    expect(getByText('nije dostupna')).toBeTruthy();
    expect(getByText('nije dostupno')).toBeTruthy();
    expect(getByText('0 fotografija')).toBeTruthy();
  });
});
