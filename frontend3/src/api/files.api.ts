import apiClient from './client';

/**
 * File upload API functions
 */

export interface FileUploadResponse {
  filename: string;
  url: string;
  originalFilename: string;
  size: string;
  contentType: string;
}

export const filesApi = {
  /**
   * Upload event poster image
   * @param file - Image file to upload
   * @returns Upload response with file URL
   */
  uploadPoster: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<FileUploadResponse>(
      '/api/files/upload/poster',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  /**
   * Delete event poster
   * @param filename - Filename to delete
   */
  deletePoster: async (filename: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/api/files/poster/${filename}`
    );
    return response.data;
  },

  /**
   * Get default poster URL
   */
  getDefaultPosterUrl: async (): Promise<{ url: string }> => {
    const response = await apiClient.get<{ url: string }>('/api/files/poster/default-url');
    return response.data;
  },
};

