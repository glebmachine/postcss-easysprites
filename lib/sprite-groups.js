/**
 * Group images by their retina ratio.
 *
 * @param {Array} images - Array of image objects.
 * @returns {Array}
 */
function addSpriteGroups(images) {
  const groupedImages = images.map((image) => {
    const { groups, ratio } = image;
    const imageWithGroup = image;

    // Add any retina groups.
    const retinaGroup = ratio > 1 ? [`@${ratio}x`] : [];

    // Add sprite group to image object.
    imageWithGroup.groups = [...groups, ...retinaGroup];

    return imageWithGroup;
  });

  return [groupedImages];
}

module.exports.addSpriteGroups = addSpriteGroups;
