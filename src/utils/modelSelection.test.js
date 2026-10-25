import test from 'node:test';
import assert from 'node:assert/strict';
import { canSelectModel, selectedModelKey } from './modelSelection.js';

const models = [
  { key: 'speaker_01', defaultVoice: false },
  { key: 'speaker_02', defaultVoice: false },
  { key: 'speaker_03', defaultVoice: true },
];
test('signed-out selection ignores a saved or previously selected restricted model', () => {
  assert.equal(selectedModelKey(models, 'speaker_01', true, 'speaker_02'), 'speaker_03');
  assert.equal(canSelectModel(models[0], true), false);
  assert.equal(canSelectModel(models[2], true), true);
});
test('signed-in selection carries the Home choice into the first Chat request', () => {
  assert.equal(selectedModelKey(models, 'speaker_01', false, 'speaker_03'), 'speaker_01');
  assert.equal(canSelectModel(models[0], false), true);
});
test('unavailable selection falls back to an available saved model or default', () => {
  assert.equal(selectedModelKey(models, 'removed', false, 'speaker_02'), 'speaker_02');
  assert.equal(selectedModelKey(models, 'removed', false, 'removed'), 'speaker_03');
});
test('missing catalog or default never invents a selectable guest model', () => {
  assert.equal(selectedModelKey([], 'speaker_01', false), '');
  assert.equal(selectedModelKey(models.slice(0, 2), 'speaker_01', true), '');
  assert.equal(canSelectModel(undefined, true), false);
});
