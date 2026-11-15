import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_DATASET,
  verifyAdminPasscode,
  moveItemUp,
  moveItemDown,
  addBlock,
  updateBlock,
  removeBlock,
  addArchiveSpecimen,
  deleteArchiveSpecimen,
  upsertJournalPost,
  deleteJournalPost,
  updateContactConfig,
  parseExtractionProtocol,
  encodeUtf8ToBase64,
  decodeBase64ToUtf8,
  resolveDatasetPriority,
  addHomeSlide,
  updateHomeSlide,
  removeHomeSlide,
  INITIAL_HOME_SLIDES,
} from './cmsLogic';

test('verifyAdminPasscode validates kyung passcode accurately', () => {
  assert.equal(verifyAdminPasscode('kyung'), true);
  assert.equal(verifyAdminPasscode(' kyung '), true);
  assert.equal(verifyAdminPasscode('KYUNG'), false);
  assert.equal(verifyAdminPasscode('wrong'), false);
});

test('INITIAL_DATASET contains exactly 1 initial Archive (NO. 001) and 1 initial Journal (ISSUE 01)', () => {
  assert.equal(INITIAL_DATASET.archives.length, 1);
  assert.equal(INITIAL_DATASET.archives[0].archiveNo, 'Archive No. 001');
  assert.equal(INITIAL_DATASET.archives[0].title, '상엽 뽕잎');
  assert.equal(INITIAL_DATASET.archives[0].nameKo, '상엽 뽕잎');
  assert.equal(INITIAL_DATASET.archives[0].scientificName, 'Morus alba');

  assert.equal(INITIAL_DATASET.journals.length, 1);
  assert.equal(INITIAL_DATASET.journals[0].issueNo, 'ISSUE 01');
});

test('moveItemUp and moveItemDown reorder Journal posts and blocks cleanly', () => {
  const list = ['ISSUE 01', 'ISSUE 02', 'ISSUE 03'];
  assert.deepEqual(moveItemUp(list, 0), ['ISSUE 01', 'ISSUE 02', 'ISSUE 03']);
  assert.deepEqual(moveItemUp(list, 1), ['ISSUE 02', 'ISSUE 01', 'ISSUE 03']);
  assert.deepEqual(moveItemDown(list, 1), ['ISSUE 01', 'ISSUE 03', 'ISSUE 02']);
  assert.deepEqual(moveItemDown(list, 2), ['ISSUE 01', 'ISSUE 02', 'ISSUE 03']);
});

test('ContentBlock operations add, update, and remove blocks', () => {
  const blocks = INITIAL_DATASET.about.blocks;
  const added = addBlock(blocks, 'text', '새로운 문단입니다.', '', 'test-blk-99');
  assert.equal(added.length, blocks.length + 1);
  assert.equal(added[added.length - 1].content, '새로운 문단입니다.');

  const updated = updateBlock(added, 'test-blk-99', { content: '수정된 문단입니다.' });
  assert.equal(updated[updated.length - 1].content, '수정된 문단입니다.');

  const removed = removeBlock(updated, 'test-blk-99');
  assert.equal(removed.length, blocks.length);
});

test('Archive specimen add and delete mutations work properly', () => {
  const next = addArchiveSpecimen(INITIAL_DATASET.archives, {
    id: 'archive-002',
    archiveNo: 'ARCHIVE NO. 002',
    nameKo: '감잎',
    scientificName: 'Diospyros kaki',
    originCoords: '경북 상주 · 36°24\'N 128°09\'E',
    altitude: 'ALT 320M',
    processingSpec: '200°C 증제 · 유념 · 10mm 컷팅',
    extractionProtocol: '3.0g / 150ml / 90°C / 25s → 20s → 35s',
    flavorComponents: '은은한 과실 산미 · 담백한 단맛 / 카페인 0.0% / 비타민 C·탄닌',
  });
  assert.equal(next.length, 2);
  assert.equal(next[1].archiveNo, 'ARCHIVE NO. 002');

  const afterDel = deleteArchiveSpecimen(next, 'archive-002');
  assert.equal(afterDel.length, 1);
});

test('Journal upsert and delete work properly', () => {
  const created = upsertJournalPost(INITIAL_DATASET.journals, {
    id: 'journal-002',
    issueNo: 'ISSUE 02',
    title: '지리산 하동 야생 쑥의 채집과 배전',
    date: '2026. 11',
    blocks: [],
  });
  assert.equal(created.length, 2);

  const edited = upsertJournalPost(created, {
    id: 'journal-002',
    issueNo: 'ISSUE 02',
    title: '수정된 하동 야생 쑥 기록',
    date: '2026. 11',
    blocks: [],
  });
  assert.equal(edited.length, 2);
  assert.equal(edited[1].title, '수정된 하동 야생 쑥 기록');

  const deleted = deleteJournalPost(edited, 'journal-002');
  assert.equal(deleted.length, 1);
});

test('Contact config update merges fields accurately', () => {
  const updated = updateContactConfig(INITIAL_DATASET.contact, {
    email: 'b2b@kyung-tea.kr',
  });
  assert.equal(updated.email, 'b2b@kyung-tea.kr');
  assert.equal(updated.title, INITIAL_DATASET.contact.title);
});

test('parseExtractionProtocol extracts dose, water, temp, and infusion seconds array', () => {
  const parsed = parseExtractionProtocol('3.5g / 150ml / 95°C / 20s → 15s → 25s → 40s');
  assert.equal(parsed.dose, '3.5g');
  assert.equal(parsed.waterVolume, '150ml');
  assert.equal(parsed.temperature, '95°C');
  assert.deepEqual(parsed.infusionSeconds, [20, 15, 25, 40]);
});

test('UTF-8 Base64 encoding and decoding preserves Korean characters for GitHub API', () => {
  const original = JSON.stringify({ title: '상엽 뽕잎 · 충북 영동 220°C 살청' });
  const encoded = encodeUtf8ToBase64(original);
  const decoded = decodeBase64ToUtf8(encoded);
  assert.equal(decoded, original);
});

test('resolveDatasetPriority chooses the dataset with the newer updatedAt timestamp', () => {
  const older = { ...INITIAL_DATASET, updatedAt: '2026-11-10T00:00:00.000Z' };
  const newer = {
    ...INITIAL_DATASET,
    updatedAt: '2026-11-15T12:00:00.000Z',
    contact: { ...INITIAL_DATASET.contact, email: 'remote@kyung.kr' },
  };
  const resolved = resolveDatasetPriority(older, newer);
  assert.equal(resolved.contact.email, 'remote@kyung.kr');
});

test('HomeSlide operations add, update, and remove 4:3 slides properly', () => {
  const added = addHomeSlide(INITIAL_HOME_SLIDES, './images/new_slide.jpg', 'slide-99');
  assert.equal(added.length, INITIAL_HOME_SLIDES.length + 1);
  assert.equal(added[added.length - 1].imageUrl, './images/new_slide.jpg');

  const updated = updateHomeSlide(added, 'slide-99', './images/updated_slide.jpg');
  assert.equal(updated[updated.length - 1].imageUrl, './images/updated_slide.jpg');

  const removed = removeHomeSlide(updated, 'slide-99');
  assert.equal(removed.length, INITIAL_HOME_SLIDES.length);
});

