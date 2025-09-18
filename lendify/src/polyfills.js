/**
 * Browser Polyfills for Node.js modules
 * Required for wallet SDKs and other Node.js dependencies
 */

import { Buffer } from 'buffer'
import process from 'process'

// Make Buffer available globally
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer
}

// Make process available globally
if (typeof globalThis.process === 'undefined') {
  globalThis.process = process
}

// Ensure process.env exists
if (!globalThis.process.env) {
  globalThis.process.env = {}
}

// Add any additional polyfills as needed
export { Buffer, process }
