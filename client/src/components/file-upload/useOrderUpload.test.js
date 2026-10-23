import React from 'react';
import { act, render } from '@testing-library/react';
import axios from 'axios';
import M from 'materialize-css';

import useOrderUpload from './useOrderUpload';
import resizeFile from '../../helpers/resizeFile';

jest.mock('axios');
jest.mock('materialize-css', () => ({
  toast: jest.fn()
}));
jest.mock('../../helpers/resizeFile', () => jest.fn());

const file = {
  name: 'photo.jpg',
  type: 'image/jpeg',
  size: 100,
  brojKomada: 2,
  preview: 'preview.jpg'
};
const files = [file];
const userInfo = {
  ime: 'Ana',
  prezime: 'Anić',
  email: 'ana@example.com'
};

let currentUpload;

const HookHarness = ({ canSubmit = true }) => {
  currentUpload = useOrderUpload({
    files,
    userInfo,
    canSubmit
  });

  return (
    <div>
      <span data-testid="uploading">{String(currentUpload.uploading)}</span>
      <span data-testid="progress">{String(currentUpload.uploadProgress)}</span>
      <span data-testid="file-progress">
        {currentUpload.fileUploadPercentage[0]
          ? currentUpload.fileUploadPercentage[0].value
          : 'not-started'}
      </span>
      <span data-testid="result-status">
        {currentUpload.resultMessage.status}
      </span>
      <span data-testid="result-message">
        {currentUpload.resultMessage.message}
      </span>
      <span data-testid="finished">
        {String(currentUpload.uploadFinishedSuccessfully)}
      </span>
    </div>
  );
};

const submitEvent = { preventDefault: jest.fn() };

describe('useOrderUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resizeFile.mockImplementation(uploadFile => Promise.resolve(uploadFile));
    axios.post.mockImplementation(url => {
      if (url === '/api/v1/uploads/session') {
        return Promise.resolve({ data: { data: { uploadId: 'upload-1' } } });
      }
      if (url === '/api/v1/uploads/signature') {
        return Promise.resolve({
          data: { data: { key: 'photo-key', url: 'https://upload.test/photo' } }
        });
      }
      return Promise.resolve({});
    });
    axios.put.mockImplementation((url, uploadFile, config) => {
      config.onUploadProgress({ loaded: 50, total: 100 });
      return Promise.resolve();
    });
  });

  it('tracks file and overall progress and marks a successful order complete', async () => {
    const { getByTestId } = render(<HookHarness />);

    await act(async () => {
      await currentUpload.submitOrder(submitEvent);
    });

    expect(getByTestId('file-progress').textContent).toBe('50');
    expect(getByTestId('progress').textContent).toBe('100');
    expect(getByTestId('uploading').textContent).toBe('false');
    expect(getByTestId('result-status').textContent).toBe('success');
    expect(getByTestId('finished').textContent).toBe('true');
    expect(axios.post).toHaveBeenCalledWith(
      '/api/v1/orders',
      expect.objectContaining({
        uploadId: 'upload-1',
        photos: [
          expect.objectContaining({
            r2Key: 'photo-key',
            fileName: 'photo.jpg',
            brojKomada: 2
          })
        ]
      }),
      { withCredentials: true }
    );
    expect(M.toast).toHaveBeenCalledWith({
      html: 'Fotografije su sačuvane'
    });
  });

  it('reports upload failures and does not submit an order', async () => {
    axios.post.mockImplementation(url => {
      if (url === '/api/v1/uploads/session') {
        return Promise.resolve({ data: { data: { uploadId: 'upload-1' } } });
      }
      return Promise.reject(new Error('signature failed'));
    });

    const { getByTestId } = render(<HookHarness />);

    await act(async () => {
      await currentUpload.submitOrder(submitEvent);
    });

    expect(getByTestId('uploading').textContent).toBe('false');
    expect(getByTestId('result-status').textContent).toBe('fail');
    expect(getByTestId('finished').textContent).toBe('false');
    expect(axios.post).not.toHaveBeenCalledWith(
      '/api/v1/orders',
      expect.anything(),
      expect.anything()
    );
    expect(M.toast).toHaveBeenCalledWith({ html: 'Došlo je do greške' });
  });

  it('reports order submission failures after uploads complete', async () => {
    axios.post.mockImplementation(url => {
      if (url === '/api/v1/uploads/session') {
        return Promise.resolve({ data: { data: { uploadId: 'upload-1' } } });
      }
      if (url === '/api/v1/uploads/signature') {
        return Promise.resolve({
          data: { data: { key: 'photo-key', url: 'https://upload.test/photo' } }
        });
      }
      return Promise.reject(new Error('order submission failed'));
    });

    const { getByTestId } = render(<HookHarness />);

    await act(async () => {
      await currentUpload.submitOrder(submitEvent);
    });

    expect(getByTestId('uploading').textContent).toBe('false');
    expect(getByTestId('result-status').textContent).toBe('fail');
    expect(getByTestId('finished').textContent).toBe('false');
    expect(getByTestId('progress').textContent).toBe('100');
    expect(M.toast).toHaveBeenCalledWith({ html: 'Došlo je do greške' });
  });

  it('rejects submission when the catalog quote is unavailable', async () => {
    const { getByTestId } = render(<HookHarness canSubmit={false} />);

    await act(async () => {
      await currentUpload.submitOrder(submitEvent);
    });

    expect(getByTestId('result-status').textContent).toBe('fail');
    expect(getByTestId('result-message').textContent).toBe(
      'Cenovnik nije dostupan. Pokušajte ponovo kasnije.'
    );
    expect(axios.post).not.toHaveBeenCalled();
    expect(axios.put).not.toHaveBeenCalled();
  });
});
