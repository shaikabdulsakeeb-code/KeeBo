const cloudinary = require('../config/cloudinary');

// Helper to upload buffer to cloudinary via stream
const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error('File or file buffer is missing'));
    }
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: folder, 
        resource_type: 'auto',
        type: 'upload'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(file.buffer);
  });
};

// Helper to delete from Cloudinary by URL
const deleteFromCloudinary = async (url) => {
    if (!url || url === 'default.jpg' || !url.includes('cloudinary')) return;
    try {
        const parts = url.split('/');
        const fileNameWithExt = parts.pop();
        const folderPath = parts.slice(parts.indexOf('upload') + 2).join('/');
        const publicId = folderPath ? `${folderPath}/${fileNameWithExt.split('.')[0]}` : fileNameWithExt.split('.')[0];
        
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Cloudinary deletion failed:', error);
    }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};
