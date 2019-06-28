const async = require('async');

/**
 * Group images by their retina ratio.
 *
 * @param {Array} imageCollection - Array of image objects.
 * @param {object} opts - Options passed to the plugin.
 * @returns {Promise}
 */
function applyGroupBy(imageCollection, opts) {
  return new Promise((resolve, reject) => {
    async.reduce(
      opts.groupBy,
      imageCollection,
      (images, group, next) => {
        async.map(
          images,
          (image, done) => {
            new Promise((res) => {
              res(group(image));
            })
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
