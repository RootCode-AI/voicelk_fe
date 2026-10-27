import test from 'node:test';
import assert from 'node:assert/strict';
import { canSelectModel, isAvailable, selectedModelKey } from './modelSelection.js';

const models = [
  { key: 'speaker_02_v2', defaultVoice: false, status: 'AVAILABLE', tag: 'New' },
  { key: 'speaker_03', defaultVoice: true, status: 'AVAILABLE' },
  { key: 'speaker_02_v2_1', defaultVoice: false, status: 'COMING_SOON' },
  { key: 'speaker_01', defaultVoice: false, status: 'RETIRED' },
  { key: 'speaker_02', defaultVoice: false, status: 'AVAILABLE' },
];
test('signed-out selection ignores a saved or previously selected restricted model', () => {
  assert.equal(selectedModelKey(models, 'speaker_02', true, 'speaker_02'), 'speaker_03');
  assert.equal(canSelectModel(models[0], true), false);
  assert.equal(canSelectModel(models[1], true), true);
});
test('signed-in selection carries the Home choice into the first Chat request', () => {
  assert.equal(selectedModelKey(models, 'speaker_02', false, 'speaker_03'), 'speaker_02');
  assert.equal(canSelectModel(models[0], false), true);
});
test('unavailable selection falls back to an available saved model or default', () => {
  assert.equal(selectedModelKey(models, 'removed', false, 'speaker_02'), 'speaker_02');
  assert.equal(selectedModelKey(models, 'removed', false, 'removed'), 'speaker_03');
});
test('retired and coming-soon voices are listed but never selected', () => {
  assert.equal(canSelectModel(models[2], false), false);
  assert.equal(canSelectModel(models[3], false), false);
  assert.equal(selectedModelKey(models, 'speaker_01', false, 'speaker_01'), 'speaker_03');
  assert.equal(selectedModelKey(models, 'speaker_02_v2_1', false, 'speaker_02'), 'speaker_02');
});
test('both speaker 02 releases can be chosen side by side', () => {
  assert.equal(selectedModelKey(models, 'speaker_02', false, 'speaker_02_v2'), 'speaker_02');
  assert.equal(selectedModelKey(models, 'speaker_02_v2', false, 'speaker_02'), 'speaker_02_v2');
});
test('a voice without a status is treated as available', () => {
  assert.equal(isAvailable({ key: 'speaker_03' }), true);
  assert.equal(isAvailable(undefined), false);
});
test('missing catalog or default never invents a selectable guest model', () => {
  assert.equal(selectedModelKey([], 'speaker_02', false), '');
  assert.equal(selectedModelKey(models.filter(model => !model.defaultVoice), 'speaker_02', true), '');
  assert.equal(canSelectModel(undefined, true), false);
});
