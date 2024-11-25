import * as faceapi from 'face-api.js';

export const compareFaceDescriptors = (descriptor1, descriptor2) => {
  try {
    // Convert descriptors to Float32Array
    const d1 = new Float32Array(Object.values(descriptor1));
    const d2 = new Float32Array(Object.values(descriptor2));
    
    return faceapi.euclideanDistance(d1, d2);
  } catch (error) {
    console.error('Error comparing descriptors:', error);
    return Infinity;
  }
};