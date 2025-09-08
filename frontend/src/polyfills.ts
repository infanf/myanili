// Buffer polyfill
import { Buffer } from 'buffer';

// Extend Window interface to include Buffer
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

// Make Buffer available globally
window.Buffer = Buffer;
// Use type assertion for globalThis to avoid circular reference
(globalThis as typeof globalThis & { Buffer: typeof Buffer }).Buffer = Buffer;
