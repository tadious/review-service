const create = (reviewId, media) => ({
  review_id: reviewId,
  filename: media.filename,
  type: media.type,
  width: media.width,
  height: media.height,
});

const expose = media => ({
  id: media.get('id'),
  createdAt: media.get('created_at'),
  updatedAt: media.get('updated_at'),
  type: media.get('type'),
  filename: media.get('filename'),
  width: media.get('width'),
  height: media.get('height'),
});

module.exports = {
  create,
  expose,
};