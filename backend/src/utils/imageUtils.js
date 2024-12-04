const sharp = require('sharp');

exports.compressImageToBase64 = async (imageBuffer) => {
  const compressedImage = await sharp(imageBuffer)
    .resize(256, 256)
    .toFormat('jpeg')
    .jpeg({ quality: 80 }) 
    .toBuffer();
  return `data:image/jpeg;base64,${compressedImage.toString('base64')}`;
};
