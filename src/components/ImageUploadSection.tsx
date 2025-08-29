import React, { useState, useRef } from 'react';
import { Upload, X, Plus, Trash2, Link, Image as ImageIcon } from 'lucide-react';
import { cloudflareService } from '../services/cloudflareService';

interface ImageUploadSectionProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  title: string;
  description: string;
  orientation: 'horizontal' | 'vertical';
  neighborhood?: string;
  barracaNumber?: string;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  images,
  onImagesChange,
  title,
  description,
  orientation,
  neighborhood,
  barracaNumber
}) => {
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate that neighborhood is provided
    if (!neighborhood) {
      setUploadError('Please fill in the Neighborhood before uploading images');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100);

        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 10MB.`);
        }

        // Generate folder path based on neighborhood and barraca number
        let folderPath = 'barracas';
        if (neighborhood) {
          const neighborhoodPath = neighborhood.toLowerCase().replace(/\s+/g, '-');
          if (barracaNumber) {
            // Use the actual barraca number if provided, removing leading zeros
            const cleanBarracaNumber = barracaNumber.replace(/^0+/, '') || '0';
            folderPath = `${neighborhoodPath}/${cleanBarracaNumber}`;
          } else {
            // Use the barraca name in lowercase if no number is provided
            folderPath = `${neighborhoodPath}/name`;
          }
        }
        
        // Upload to Cloudflare
        const result = await cloudflareService.uploadImage(file, folderPath);
        
        if (result.success && result.url) {
          // Add the uploaded image URL to the list
          onImagesChange([...images, result.url]);
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addUrlInput = () => {
    onImagesChange([...images, 'https://images.cariocacoastalclub.com/']);
  };

  const updateUrl = (index: number, url: string) => {
    const newImages = [...images];
    newImages[index] = url;
    onImagesChange(newImages);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const reorderImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  const validateImageUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-lg font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        
        {/* Upload Mode Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setUploadMode('upload')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              uploadMode === 'upload'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-1" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('url')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              uploadMode === 'url'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Link className="h-4 w-4 inline mr-1" />
            URL
          </button>
        </div>
      </div>

                {/* Upload Mode */}
          {uploadMode === 'upload' && (
            <div className="space-y-4">
              {/* Validation Warning */}
              {!neighborhood && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-yellow-700">
                      Please fill in <strong>Neighborhood</strong> before uploading images
                    </span>
                  </div>
                </div>
              )}
              
              {/* Upload Area */}
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                !neighborhood 
                  ? 'border-yellow-300 bg-yellow-50' 
                  : 'border-gray-300 hover:border-beach-500'
              }`}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            
            {isUploading ? (
              <div className="space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beach-500 mx-auto"></div>
                <p className="text-sm text-gray-600">Uploading images...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-beach-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">{Math.round(uploadProgress)}%</p>
              </div>
            ) : (
              <div>
                <Upload className={`mx-auto h-12 w-12 mb-3 ${
                  !neighborhood ? 'text-yellow-400' : 'text-gray-400'
                }`} />
                <p className={`text-sm mb-2 ${
                  !neighborhood ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {!neighborhood 
                    ? 'Fill in Neighborhood to enable upload'
                    : 'Click to upload or drag and drop'
                  }
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  PNG, JPG, GIF, WebP up to 10MB each
                </p>
                                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!neighborhood}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      !neighborhood
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-beach-500 text-white hover:bg-beach-600'
                    }`}
                  >
                  Choose Files
                </button>
              </div>
            )}
          </div>

          {/* Upload Error */}
          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <X className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-sm text-red-700">{uploadError}</span>
              </div>
            </div>
          )}

          {/* Cloudflare Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center">
              <ImageIcon className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-sm text-blue-700">
                Images will be uploaded to Cloudflare R2 for fast, global delivery
              </span>
            </div>
          </div>
        </div>
      )}

      {/* URL Mode */}
      {uploadMode === 'url' && (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center">
              <Link className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-sm text-blue-700">
                Use <code className="bg-blue-100 px-1 rounded">https://images.cariocacoastalclub.com/</code> for images already uploaded to Cloudflare
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={addUrlInput}
            className="text-beach-600 hover:text-beach-800 flex items-center text-sm bg-beach-50 px-3 py-1 rounded-lg hover:bg-beach-100 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Image URL
          </button>
        </div>
      )}

      {/* Image List */}
      {images.length > 0 && (
        <div className="space-y-3">
          {images.map((image, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1">
                {uploadMode === 'url' ? (
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    placeholder="https://images.cariocacoastalclub.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-sm text-gray-600 truncate block">
                      {image || 'No URL'}
                    </span>
                  </div>
                )}
                
                {image && (
                  <div className="mt-2">
                    {!validateImageUrl(image) && (
                      <div className="text-red-500 text-xs mb-1">Invalid URL format</div>
                    )}
                    <img
                      src={image}
                      alt={`${orientation} image ${index + 1}`}
                      className={`object-cover rounded-lg border border-gray-200 ${
                        orientation === 'horizontal' 
                          ? 'w-full h-32' 
                          : 'w-24 h-32'
                      }`}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-1">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => reorderImage(index, index - 1)}
                    className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    title="Move up"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                )}
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => reorderImage(index, index + 1)}
                    className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    title="Move down"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  title="Remove image"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="text-gray-500">
            <ImageIcon className="mx-auto h-12 w-12 mb-3" />
            <p className="text-sm">No {orientation} images added</p>
            <p className="text-xs text-gray-400 mt-1">
              {uploadMode === 'upload' 
                ? 'Upload images for better display' 
                : 'Add image URLs for better display'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadSection;
