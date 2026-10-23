import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import UploadNavigation from './UploadNavigation';

const defaultProps = {
  step: 1,
  filesSelected: true,
  catalogLoading: false,
  catalogError: '',
  selectedFormat: { name: '10x15' },
  hasValidQuote: true,
  userFieldsValid: false,
  uploading: false,
  uploadFinishedSuccessfully: false,
  photoCount: 2,
  pricePerPhoto: 20,
  total: 40,
  courierDelivery: false,
  onPrevious: jest.fn(),
  onNext: jest.fn()
};

describe('UploadNavigation', () => {
  it('disables continuing while there are no files or no valid quote', () => {
    const { getByText, rerender } = render(
      <UploadNavigation {...defaultProps} filesSelected={false} />
    );

    expect(getByText('Dalje').closest('button').disabled).toBe(true);

    rerender(
      <UploadNavigation {...defaultProps} hasValidQuote={false} />
    );
    expect(getByText('Dalje').closest('button').disabled).toBe(true);
  });

  it('advances when the quote and catalog are valid', () => {
    const onNext = jest.fn();
    const { getByText } = render(
      <UploadNavigation {...defaultProps} onNext={onNext} />
    );

    fireEvent.click(getByText('Dalje'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('shows and invokes back navigation on later steps', () => {
    const onPrevious = jest.fn();
    const { getByText } = render(
      <UploadNavigation
        {...defaultProps}
        step={2}
        onPrevious={onPrevious}
      />
    );

    fireEvent.click(getByText('Nazad'));
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it('disables submit until customer details are valid', () => {
    const { getByText, rerender } = render(
      <UploadNavigation {...defaultProps} step={3} userFieldsValid={false} />
    );

    expect(getByText('Pošalji').closest('button').disabled).toBe(true);

    rerender(
      <UploadNavigation {...defaultProps} step={3} userFieldsValid />
    );
    expect(getByText('Pošalji').closest('button').disabled).toBe(false);
  });
});
