import cloudinary from '../../utils/cloudinary';
import logger from '../../config/loggingConfig';

// TODO: should be able to remove this I think, since multer is handling the uploads to DigitalOcean on its own
export const uploadImage = async (publicId: string, file: Express.Multer.File, folder: string) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      public_id: publicId,
      resource_type: 'image',
      overwrite: true
    });
    logger.info('Image has been uploaded successfully');
    return result.secure_url;
  } catch (error: any) {
    logger.error(`Failed to upload image: ${error.message}`);
    throw new Error(`Failed to upload images: ${error.message}`);
  }
};