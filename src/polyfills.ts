// Polyfills for MSW
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'text-encoding';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.Response = Response as any;
global.BroadcastChannel = class BroadcastChannel {
  constructor() {}
  postMessage() {}
  close() {}
  onmessage = null;
  onmessageerror = null;
};

// Polyfills for streams
global.ReadableStream = class ReadableStream {};
global.WritableStream = class WritableStream {};
global.TransformStream = class TransformStream {};