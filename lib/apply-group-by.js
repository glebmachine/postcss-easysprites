const { pluginOptions } = require('./plugin-options');

/**
 * Checks if an image is retina, and adds any to the images groups.
 *
 * @param {Array} images - Array of image objects.
 * @param {Function} group - Function that will group by retina ratio.
 * @returns {Array}
 */
async function mapImageGroup(images, group) {
  return Promise.all(
    images.map(async (image) => {
      const groupedImage = await group(image);

      if (groupedImage) {
        image.groups.push(groupedImage);
      }

      return image;
    })
  );
}

/**
 * Group images by their retina ratio.
 *
 * @param {Array} imageCollection - Array of image objects.
 * @returns {Array}
 */
async function applyGroupBy(imageCollection) {
  const opts = pluginOptions.getAll();

  return Promise.all([
    opts.groupBy.reduce(async (images, group) => {
      const groupedImages = await mapImageGroup(images, group);
      return groupedImages;
    }, imageCollection),
  ]);
}

exports.applyGroupBy = applyGroupBy;
