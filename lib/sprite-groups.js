/**
 * Group images by their retina ratio.
 *
 * @param {Array} images - Array of image objects.
 * @returns {Array}
 */
function addSpriteGroups(images) {
  const groupedImages = images.map((image) => {
    const { groups, ratio } = image;
    const spriteGroups = [];

    // Add any existing groups.
    spriteGroups.push(...groups);

    // Add any retina groups.
    if (ratio > 1) {
      spriteGroups.push(`@${ratio}x`);
    }

    const imageWithGroup = image;
    // Add sprite group to image object.
    imageWithGroup.groups = spriteGroups;

    return imageWithGroup;
  });

  return [groupedImages];
}

exports.addSpriteGroups = addSpriteGroups;
