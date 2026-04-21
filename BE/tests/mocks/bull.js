// Mock Bull queue — dùng jest.fn() để spy enqueue calls trong tests
const mockAdd     = jest.fn().mockResolvedValue({ id: 'mock-job-id' });
const mockProcess = jest.fn();
const mockOn      = jest.fn();

const mockQueue = { add: mockAdd, process: mockProcess, on: mockOn };

module.exports = {
  createQueue: jest.fn().mockReturnValue(mockQueue),
  queues: {
    interviewQueue: mockQueue,
    feedbackQueue:  mockQueue,
  },
  // Export mockQueue để test file có thể assert
  __mockQueue: mockQueue,
};
