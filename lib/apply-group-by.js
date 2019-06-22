const async = require('async');
const Q = require('q');

/**
 * Group images by their retina ratio.
 *
 * @param {Array} imageCollection - Array of image objects.
 * @param {object} opts - Options passed to the plugin.
 * @returns {Promise}
 */
function applyGroupBy(imageCollection, opts) {
  return Q.Promise((resolve, reject) => {
    async.reduce(
      opts.groupBy,
      imageCollection,
      (images, group, next) => {
        async.map(
          images,
          (image, done) => {
            new Q(group(image))
              .then((groupedImage) => {
                if (groupedImage) {
                  image.groups.push(groupedImage);
                }
                done(null, image);
              })
              .catch(done);
          },
          next
        );
      },
      (err, images) => {
        if (err) {
          return reject(err);
        }

        return resolve([images, opts]);
      }
    );
  });
}

exports.applyGroupBy = applyGroupBy;
