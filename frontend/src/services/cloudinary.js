import logger from '../utils/logger';

/**
 * Uploads a file to Cloudinary using the unsigned upload API.
 * 
 * @param {File} file - The image file to upload.
 * @param {Function} [onProgress] - Optional callback to receive upload progress percentage (0 to 100).
 * @returns {Promise<string>} Promise that resolves to the secure URL of the uploaded image.
 */
export const uploadToCloudinary = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset || cloudName === 'your_cloud_name_here' || uploadPreset === 'your_unsigned_preset_name') {
      const errMsg = 'Cloudinary environment variables VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET must be configured.';
      logger.error('uploadToCloudinary Config Error:', errMsg);
      reject(new Error(errMsg));
      return;
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const xhr = new XMLHttpRequest();

    xhr.open('POST', url, true);

    // Track upload progress
    if (xhr.upload && onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      });
    }

    // Handle response
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.secure_url) {
            logger.firebase('Cloudinary Upload Success', response.secure_url);
            resolve(response.secure_url);
          } else {
            reject(new Error('Cloudinary response did not return secure_url.'));
          }
        } catch (err) {
          logger.error('Cloudinary JSON Parse Error:', err);
          reject(new Error('Failed to parse Cloudinary response.'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          const errorMsg = errorResponse.error?.message || `Upload failed with status ${xhr.status}`;
          logger.error('Cloudinary API Error:', errorMsg);
          reject(new Error(errorMsg));
        } catch {
          const rawError = `Upload failed with status ${xhr.status}`;
          logger.error('Cloudinary Request Failure:', rawError);
          reject(new Error(rawError));
        }
      }
    });

    // Handle network errors
    xhr.addEventListener('error', () => {
      const errorMsg = 'Network error occurred during Cloudinary upload.';
      logger.error('Cloudinary Network Error:', errorMsg);
      reject(new Error(errorMsg));
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    xhr.send(formData);
  });
};
