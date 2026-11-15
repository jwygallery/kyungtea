import {
  AboutArticle,
  ArchiveSpecimen,
  ContactConfig,
  ContentBlock,
  HomeSlide,
  JournalPost,
  KyungDataset,
} from '../types/cms';

export const ADMIN_PASSCODE = 'kyung';
export const STORAGE_KEY = 'kyung_cms_data_v1';
export const INQUIRIES_STORAGE_KEY = 'kyung_inquiries_v1';
export const GITHUB_CONFIG_KEY = 'kyung_github_sync_config_v1';

export const INITIAL_HOME_SLIDES: HomeSlide[] = [
  {
    id: 'slide-1',
    imageUrl: './images/about_infusion_vessel_1794702914601.jpg',
  },
  {
    id: 'slide-2',
    imageUrl: './images/archive_morus_alba_1794702915918.jpg',
  },
  {
    id: 'slide-3',
    imageUrl: './images/journal_roasting_pan_1794702919281.jpg',
  },
];

export const INITIAL_DATASET: KyungDataset = {
  version: 1,
  updatedAt: '2026-11-14T00:00:00.000Z',
  homeSlides: INITIAL_HOME_SLIDES,
  about: {
    title: '달이지 않고 10~30초 단시간에 우려내는 한국 토종 임산물 보타니컬 아카이브',
    subtitle: 'HERBARIUM ARCHIVE & RAPID INFUSION PROTOCOL',
    updatedDate: '2026. 11',
    blocks: [
      {
        id: 'about-blk-1',
        type: 'image',
        content: './images/about_botanical_herbarium_1794702912883.jpg',
        caption: 'FIG 01. 서울 보타니컬 표본실 작업대 — 채집된 한국 토종 상엽(Morus alba)의 엽맥과 조직 검수',
      },
      {
        id: 'about-blk-2',
        type: 'text',
        content:
          '오랜 시간 한국의 산야초와 임산물은 약탕기 속에서 수 시간 동안 무겁게 달여 마시는 ‘탕약(湯藥)’의 영역에 머물러 있었습니다. 그러나 긴 시간 끓여내는 방식은 식물이 지닌 가장 섬세한 휘발성 방향 화합물(Volatile Aromatic Compounds)을 공기 중으로 날려버리고, 탄닌과 섬유질의 과도한 용출로 인해 떫고 탁한 뒷맛만을 남깁니다.\n\n모던 보타니컬 티 하우스 ‘kyung(경)’은 한국 토종 임산물을 대하는 이 오래된 관습을 해체합니다. 우리는 산림에서 채집한 잎과 줄기, 뿌리와 수피를 식물 표본실(Herbarium)의 엄밀한 기준으로 분류하고, 정밀한 열처리(살청·배전)와 균일한 커팅 규격을 통해 단 10초에서 30초 사이의 짧은 침출만으로도 가장 투명하고 입체적인 향미를 추출하는 조제 프로토콜을 설계합니다.',
      },
      {
        id: 'about-blk-3',
        type: 'image',
        content: './images/about_infusion_vessel_1794702914601.jpg',
        caption: 'FIG 02. 95°C / 20초 1차 침출액 — 달이지 않고 단시간에 추출하여 맑은 황록색 수색과 숭늉의 고소함을 응축한 다관',
      },
      {
        id: 'about-blk-4',
        type: 'text',
        content:
          '해발고도와 일교차, 토양의 배수성과 채집 시기의 기온은 잎 한 장에 축적되는 아미노산과 폴리페놀의 밀도를 결정합니다. kyung의 모든 아카이브 넘버는 산지의 위도·경도 좌표(Coordinates)와 해발고도(Altitude), 솥의 온도와 배전 시간, 그리고 밀리미터(mm) 단위의 절단 규격을 있는 그대로 기록합니다.\n\n커피의 에스프레소나 정통 다도의 우림법처럼, 그램(g) 단위의 정량과 초(s) 단위의 추출 시퀀스(20s → 15s → 25s → 40s)를 따를 때 비로소 한국 숲의 식물은 첫 잔의 청량한 풀내음부터 마지막 잔의 묵직한 곡물 단맛까지 시간축을 따라 변주되는 감각적 스펙트럼을 드러냅니다.',
      },
    ],
  },
  archives: [
    {
      id: 'archive-001',
      archiveNo: 'Archive No. 001',
      title: '상엽 뽕잎',
      nameKo: '상엽 뽕잎',
      scientificName: 'Morus alba',
      originCoords: '충북 영동 · 36°10\'N 127°46\'E',
      altitude: 'ALT 480M',
      processingSpec: '220°C 살청 · 유념 · 210°C 배전 · 12mm 컷팅',
      extractionProtocol: '3.5g / 150ml / 95°C / 20s → 15s → 25s → 40s',
      flavorComponents: '구수한 숭늉·곡물 향 / 카페인 0.0% / 루틴·DNJ',
      imageUrl: './images/archive_morus_alba_1794702915918.jpg',
      harvestSeason: '늦봄 첫 서리 전 상단 3~5엽 선별 채집',
      specimenNotes:
        '소백산맥 자락 충북 영동 해발 480m 일교차 지대에서 자생·재배된 산뽕나무(Morus alba) 잎 표본. 220°C 무쇠 솥 살청으로 풋내(청취)를 즉각 제어한 뒤, 세밀한 유념으로 세포막을 파쇄하고 210°C 고온 배전을 거쳐 단 20초 침출만으로도 갓 지은 가마솥 숭늉과 볶은 현미의 구수한 단맛이 피어오르도록 표준화하였다.',
    },
  ],
  journals: [
    {
      id: 'journal-001',
      issueNo: 'ISSUE 01',
      title: '충북 영동 480M, 첫 서리가 내리기 전의 상엽(桑葉)과 220°C 살청의 기록',
      date: '2026. 10',
      summary:
        '북위 36도 10분, 동경 127도 46분. 안개가 걷히지 않은 영동의 산비탈에서 채집한 뽕잎이 12mm의 균일한 표본으로 제다되기까지의 현장 노트.',
      blocks: [
        {
          id: 'j1-blk-1',
          type: 'image',
          content: './images/journal_yeongdong_mountain_1794702916882.jpg',
          caption: 'PLATE 01. 충북 영동군 해발 480m 산지 — 새벽 안개와 큰 일교차가 잎의 당도와 가바(GABA)·루틴 함량을 끌어올린다.',
        },
        {
          id: 'j1-blk-2',
          type: 'text',
          content:
            '영동의 산기슭은 밤사이 내려앉은 냉기와 강줄기에서 피어오른 안개가 오전 아홉 시까지 머무는 지형이다. 상엽(뽕잎)은 흔히 누에의 사료나 민간 요법의 건조 잎으로만 소비되어 왔으나, 해발 480m 이상의 마사토 경사지에서 자란 잎은 조직이 치밀하고 감칠맛을 내는 유리아미노산의 함량이 평지 대비 월등히 높다.\n\n우리는 가지 끝에서 세 번째부터 다섯 번째 사이의 성숙 엽만을 채집한다. 너무 어린 잎은 배전 시 타기 쉽고, 너무 억센 하단 잎은 단시간 침출 시 수렴성(떫은맛)이 앞서기 때문이다.',
        },
        {
          id: 'j1-blk-3',
          type: 'image',
          content: './images/journal_roasting_pan_1794702919281.jpg',
          caption: 'PLATE 02. 220°C 살청(殺靑) 및 210°C 배전 공정 — 수분을 제어하고 마이야르 반응을 유도하는 결정적 구간.',
        },
        {
          id: 'j1-blk-4',
          type: 'text',
          content:
            '채집 후 시들기(위조)를 거친 잎은 12mm 정방형 규격으로 정밀 컷팅된다. 원엽 그대로 제다할 경우 잎맥과 잎살의 두께 차이로 인해 열전달이 불균일해지고, 찻잔 속에서 우러나는 속도가 느려지기 때문이다.\n\n12mm로 절단된 잎은 220°C의 솥에서 빠르게 살청하여 산화 효소를 불활성화하고, 가벼운 유념 후 210°C에서 정밀 배전된다. 그 결과 95°C의 뜨거운 물을 붓고 정확히 20초를 기다렸을 때, 풀내음 대신 정갈한 숭늉과 구운 율무의 향기가 선명하게 피어오르는 ARCHIVE NO. 001이 완성된다.',
        },
      ],
    },
  ],
  contact: {
    title: 'B2B SAMPLE KIT & ARCHIVE COLLABORATION',
    introText:
      'kyung은 파인다이닝, 스페셜티 커피 바, 부티크 호텔, 건축 및 라이프스타일 공간을 위한 보타니컬 원물 큐레이션과 맞춤 추출 프로토콜(SOP) 및 B2B 샘플 키트를 제공합니다. 샘플 키트 신청 및 협업 문의는 우측 양식을 통해 접수해 주시기 바랍니다.',
    email: 'archive@kyung-tea.kr',
    addressHours: '서울특별시 종로구 자하문로 표본실 (Tue–Sat 11:00–19:00 / By Appointment)',
    socialHandle: '@kyung.botanical',
    inquiryTypes: [
      'B2B 원물 샘플 키트 신청 (Sample Kit Request)',
      '파인다이닝 · 카페 티 페어링 납품 (Wholesale & Pairing)',
      '브랜드 · 전시 공간 조제 협업 (Bespoke Archive Collaboration)',
      '프레스 · 미디어 취재 문의 (Press & Editorial)',
    ],
  },
};

export function verifyAdminPasscode(input: string): boolean {
  return input.trim() === ADMIN_PASSCODE;
}

export function moveItemUp<T>(items: readonly T[], index: number): T[] {
  if (index <= 0 || index >= items.length) {
    return [...items];
  }
  const next = [...items];
  const temp = next[index - 1];
  next[index - 1] = next[index];
  next[index] = temp;
  return next;
}

export function moveItemDown<T>(items: readonly T[], index: number): T[] {
  if (index < 0 || index >= items.length - 1) {
    return [...items];
  }
  const next = [...items];
  const temp = next[index + 1];
  next[index + 1] = next[index];
  next[index] = temp;
  return next;
}

export function addBlock(
  blocks: readonly ContentBlock[],
  type: 'text' | 'image',
  content: string,
  caption?: string,
  id?: string
): ContentBlock[] {
  const newBlock: ContentBlock = {
    id: id || `blk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    content,
    caption: caption || '',
  };
  return [...blocks, newBlock];
}

export function updateBlock(
  blocks: readonly ContentBlock[],
  id: string,
  patch: Partial<Omit<ContentBlock, 'id'>>
): ContentBlock[] {
  return blocks.map((b) => (b.id === id ? { ...b, ...patch } : b));
}

export function removeBlock(blocks: readonly ContentBlock[], id: string): ContentBlock[] {
  return blocks.filter((b) => b.id !== id);
}

export function addHomeSlide(
  slides: readonly HomeSlide[],
  imageUrl: string,
  id?: string
): HomeSlide[] {
  return [
    ...slides,
    {
      id: id || `slide-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      imageUrl,
    },
  ];
}

export function updateHomeSlide(
  slides: readonly HomeSlide[],
  id: string,
  imageUrl: string
): HomeSlide[] {
  return slides.map((s) => (s.id === id ? { ...s, imageUrl } : s));
}

export function removeHomeSlide(slides: readonly HomeSlide[], id: string): HomeSlide[] {
  return slides.filter((s) => s.id !== id);
}

export function getArchiveImageUrls(
  specimen: Pick<ArchiveSpecimen, 'imageUrl' | 'imageUrls'>
): string[] {
  if (specimen.imageUrls && specimen.imageUrls.length > 0) {
    const cleaned = specimen.imageUrls.map((u) => u.trim()).filter(Boolean);
    if (cleaned.length > 0) return cleaned;
  }
  if (specimen.imageUrl && specimen.imageUrl.trim()) {
    return [specimen.imageUrl.trim()];
  }
  return [];
}

export function normalizeArchiveImages(specimen: ArchiveSpecimen): ArchiveSpecimen {
  const rawList =
    specimen.imageUrls !== undefined
      ? specimen.imageUrls
      : specimen.imageUrl
        ? [specimen.imageUrl]
        : [];
  const cleanUrls = rawList.map((u) => u.trim()).filter(Boolean);
  return {
    ...specimen,
    imageUrls: cleanUrls,
    imageUrl: cleanUrls[0] || '',
  };
}

export function addArchiveSpecimen(
  archives: readonly ArchiveSpecimen[],
  specimen: Omit<ArchiveSpecimen, 'id'> & { id?: string }
): ArchiveSpecimen[] {
  const created: ArchiveSpecimen = normalizeArchiveImages({
    ...specimen,
    title: specimen.title || specimen.nameKo,
    id: specimen.id || `archive-${Date.now()}`,
  });
  const existingIdx = archives.findIndex((a) => a.id === created.id);
  if (existingIdx >= 0) {
    const next = [...archives];
    next[existingIdx] = created;
    return next;
  }
  return [...archives, created];
}

export function deleteArchiveSpecimen(
  archives: readonly ArchiveSpecimen[],
  id: string
): ArchiveSpecimen[] {
  return archives.filter((item) => item.id !== id);
}

export function upsertJournalPost(
  journals: readonly JournalPost[],
  post: JournalPost
): JournalPost[] {
  const existingIdx = journals.findIndex((j) => j.id === post.id);
  if (existingIdx >= 0) {
    const next = [...journals];
    next[existingIdx] = post;
    return next;
  }
  return [...journals, post];
}

export function deleteJournalPost(journals: readonly JournalPost[], id: string): JournalPost[] {
  return journals.filter((j) => j.id !== id);
}

export function updateContactConfig(
  current: ContactConfig,
  next: Partial<ContactConfig>
): ContactConfig {
  return {
    ...current,
    ...next,
  };
}

export interface ParsedExtractionProtocol {
  dose: string;
  waterVolume: string;
  temperature: string;
  infusionSeconds: number[];
  rawInfusions: string;
}

export function parseExtractionProtocol(protocol: string): ParsedExtractionProtocol {
  const parts = protocol.split('/').map((s) => s.trim());
  const dose = parts[0] || '3.5g';
  const waterVolume = parts[1] || '150ml';
  const temperature = parts[2] || '95°C';
  const rawInfusions = parts.slice(3).join(' / ') || '20s → 15s → 25s → 40s';

  const matches = rawInfusions.match(/(\d+)\s*s/gi) || [];
  const infusionSeconds = matches
    .map((m) => parseInt(m.replace(/[^\d]/g, ''), 10))
    .filter((n) => !Number.isNaN(n) && n > 0);

  return {
    dose,
    waterVolume,
    temperature,
    infusionSeconds: infusionSeconds.length > 0 ? infusionSeconds : [20, 15, 25, 40],
    rawInfusions,
  };
}

export function encodeUtf8ToBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeBase64ToUtf8(base64: string): string {
  const cleaned = base64.replace(/\s/g, '');
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(cleaned, 'base64').toString('utf-8');
  }
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function resolveDatasetPriority(
  localData: KyungDataset | null,
  remoteData: KyungDataset | null
): KyungDataset {
  if (!localData && !remoteData) return INITIAL_DATASET;
  if (!localData) return remoteData!;
  if (!remoteData) return localData;

  const localTime = Date.parse(localData.updatedAt || '1970-01-01T00:00:00Z');
  const remoteTime = Date.parse(remoteData.updatedAt || '1970-01-01T00:00:00Z');

  if (Number.isNaN(localTime)) return remoteData;
  if (Number.isNaN(remoteTime)) return localData;

  return remoteTime >= localTime ? remoteData : localData;
}
