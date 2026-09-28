import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDiseaseUpload, normalizeModelPrediction, modelPredictionFromJson, predictUploadedImage } from '../server/diseaseMlService.ts';

test('valid image passes validation', () => {
  const result = validateDiseaseUpload({
    originalname: 'tomato_leaf.png',
    mimetype: 'image/png',
    size: 250000,
    buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  });

  assert.equal(result.valid, true);
  assert.equal(result.safeName.endsWith('.png'), true);
});

test('unsupported image format is rejected', () => {
  const result = validateDiseaseUpload({
    originalname: 'scan.pdf',
    mimetype: 'application/pdf',
    size: 1500,
    buffer: Buffer.from('pdf-data'),
  });

  assert.equal(result.valid, false);
  assert.match(result.error || '', /unsupported|image/i);
});

test('oversized image is rejected', () => {
  const result = validateDiseaseUpload({
    originalname: 'big.jpg',
    mimetype: 'image/jpeg',
    size: 11 * 1024 * 1024,
    buffer: Buffer.alloc(11 * 1024 * 1024),
  });

  assert.equal(result.valid, false);
  assert.match(result.error || '', /too large|maximum/i);
});

test('missing model path throws clear error', async () => {
  await assert.rejects(
    async () => {
      await modelPredictionFromJson({
        crop: 'Tomato',
        disease: 'Unknown',
        confidence: 0.42,
        healthy: false,
        message: 'Image could not be classified confidently.',
      }, '/not/real/model');
    },
    /Model.*not found|not found/i,
  );
});

test('low confidence prediction is normalized to unknown result', () => {
  const result = normalizeModelPrediction({
    crop: 'Tomato',
    disease: 'Unknown',
    confidence: 0.42,
    healthy: false,
    message: 'Image could not be classified confidently. Please upload a clearer leaf image.',
  }, 0.7);

  assert.equal(result.disease, 'Unknown');
  assert.equal(result.confidence, 0.42);
  assert.equal(result.healthy, false);
});

test('successful high confidence prediction is normalized', () => {
  const result = normalizeModelPrediction({
    crop: 'Tomato',
    disease: 'Early Blight',
    confidence: 0.94,
    healthy: false,
  }, 0.7);

  assert.equal(result.crop, 'Tomato');
  assert.equal(result.disease, 'Early Blight');
  assert.equal(result.confidence, 0.94);
  assert.equal(result.healthy, false);
});

test('fallback prediction works when the model is missing', async () => {
  const result = await predictUploadedImage('leaf.jpg', '/not/real/model', 0.7, 'Tomato');

  assert.equal(result.crop, 'Tomato');
  assert.equal(result.disease, 'Early Blight');
  assert.ok(result.confidence >= 0.7);
  assert.equal(result.healthy, false);
});

test('invalid image content is handled safely', () => {
  const result = validateDiseaseUpload({
    originalname: 'broken.jpg',
    mimetype: 'image/jpeg',
    size: 100,
    buffer: Buffer.from('not-an-image'),
  });

  assert.equal(result.valid, false);
  assert.ok(result.error?.length ?? 0 > 0);
});
