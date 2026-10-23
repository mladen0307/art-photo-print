import React, { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';

import UserInfoFields from './UserInfoFields';

const UserInfoFieldsHarness = () => {
  const [userInfo, setUserInfo] = useState({
    ime: '',
    prezime: '',
    email: '',
    telefon: '',
    adresa: '',
    format: '10x15',
    preuzimanje: 'radnja centar'
  });

  return (
    <div>
      <UserInfoFields
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        uploadFinished={false}
        uploading={false}
      />
      <output data-testid="delivery-method">{userInfo.preuzimanje}</output>
    </div>
  );
};

describe('UserInfoFields delivery choices', () => {
  it('shows store addresses and lets the customer select delivery or pickup', () => {
    const { container, getByTestId, getByText, queryByText } = render(
      <UserInfoFieldsHarness />
    );
    const deliveryOption = getByText('Dostava na adresu');
    const pickupOption = getByText('Preuzimanje u radnji');
    const downtownOption = container.querySelector(
      'input[name="pickup-location"][value="radnja centar"]'
    );
    const trosarinaOption = container.querySelector(
      'input[name="pickup-location"][value="radnja trosarina"]'
    );

    expect(getByTestId('delivery-method').textContent).toBe('radnja centar');
    expect(deliveryOption.getAttribute('aria-pressed')).toBe('false');
    expect(pickupOption.getAttribute('aria-pressed')).toBe('true');
    expect(downtownOption.checked).toBe(true);
    expect(trosarinaOption.checked).toBe(false);
    expect(getByText('Karadžićeva 12, Niš')).toBeTruthy();
    expect(
      getByText('Bul. Sv. cara Konstantina bb lokal 10, Niš')
    ).toBeTruthy();

    fireEvent.click(trosarinaOption);
    expect(getByTestId('delivery-method').textContent).toBe(
      'radnja trosarina'
    );

    fireEvent.click(deliveryOption);
    expect(getByTestId('delivery-method').textContent).toBe('kurirska sluzba');
    expect(queryByText('Izaberite radnju')).toBeNull();

    fireEvent.click(pickupOption);
    expect(getByTestId('delivery-method').textContent).toBe('radnja centar');
    expect(getByText('Izaberite radnju')).toBeTruthy();
  });
});
