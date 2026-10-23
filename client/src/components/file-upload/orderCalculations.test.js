import {
  calculateOrderQuote,
  isOrderDetailsValid
} from './orderCalculations';

const format = {
  name: '10x15',
  quantityTiers: [
    { minPhotos: 1, maxPhotos: 9, price: 20 },
    { minPhotos: 10, maxPhotos: null, price: 15 }
  ]
};

const validUserInfo = {
  ime: 'Ana',
  prezime: 'Anić',
  telefon: '061123456',
  email: 'ana@example.com'
};

describe('calculateOrderQuote', () => {
  it('calculates total quantity and selects the matching price tier', () => {
    expect(
      calculateOrderQuote(
        [{ brojKomada: 3 }, { brojKomada: 8 }],
        format
      )
    ).toEqual({
      photoCount: 11,
      pricePerPhoto: 15,
      total: 165,
      hasValidQuote: true
    });
  });

  it('returns an unavailable quote when no tier covers the quantity', () => {
    expect(calculateOrderQuote([], format)).toEqual({
      photoCount: 0,
      pricePerPhoto: '',
      total: '',
      hasValidQuote: false
    });
  });

  it('marks unsafe quote totals invalid', () => {
    const expensiveFormat = {
      quantityTiers: [
        { minPhotos: 1, maxPhotos: null, price: Number.MAX_SAFE_INTEGER }
      ]
    };

    expect(
      calculateOrderQuote([{ brojKomada: 2 }], expensiveFormat).hasValidQuote
    ).toBe(false);
  });
});

describe('isOrderDetailsValid', () => {
  const validOrder = {
    userInfo: validUserInfo,
    files: [{ brojKomada: 1 }],
    selectedFormat: format,
    hasValidQuote: true
  };

  it('accepts complete customer details and a valid quote', () => {
    expect(isOrderDetailsValid(validOrder)).toBe(true);
  });

  it('rejects missing contact details, invalid email, no photos, or invalid quote', () => {
    expect(
      isOrderDetailsValid({
        ...validOrder,
        userInfo: { ...validUserInfo, email: 'not-an-email' }
      })
    ).toBe(false);
    expect(
      isOrderDetailsValid({ ...validOrder, files: [] })
    ).toBe(false);
    expect(
      isOrderDetailsValid({ ...validOrder, hasValidQuote: false })
    ).toBe(false);
    expect(
      isOrderDetailsValid({
        ...validOrder,
        userInfo: { ...validUserInfo, telefon: '' }
      })
    ).toBe(false);
  });
});
