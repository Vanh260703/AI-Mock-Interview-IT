module.exports = {
  uploader: {
    upload_stream: jest.fn((_options, cb) => {
      cb(null, { secure_url: 'https://res.cloudinary.com/test/mock-file.mp4' });
      return { end: jest.fn(), on: jest.fn() };
    }),
  },
  config: jest.fn(),
};
