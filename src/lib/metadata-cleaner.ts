/**
 * Metadata Cleaner & Camera EXIF Synthesizer
 * 
 * 1. Strips all C2PA manifests (APP11 0xFFEB), Adobe XMP AI markers (APP1 0xFFE1),
 *    Photoshop IPTC records (APP13 0xFFED), and generator comment headers (COM 0xFFFE).
 * 2. Injects authentic, realistic camera EXIF metadata (Apple iPhone 15 Pro, iPhone 14 Pro,
 *    Sony Alpha, Canon EOS, Samsung Galaxy S24 Ultra) with genuine capture timestamps,
 *    aperture, focal lengths, and ISO ratings.
 */

export interface CameraProfile {
  make: string;
  model: string;
  software: string;
  lensModel: string;
  focalNum: number;
  focalDen: number;
  fNum: number;
  fDen: number;
  expNum: number;
  expDen: number;
  iso: number;
}

export const REALISTIC_CAMERAS: CameraProfile[] = [
  {
    make: 'Apple',
    model: 'iPhone 15 Pro',
    software: '17.6.1',
    lensModel: 'iPhone 15 Pro back triple camera 6.86mm f/1.78',
    focalNum: 686,
    focalDen: 100,
    fNum: 178,
    fDen: 100,
    expNum: 1,
    expDen: 120,
    iso: 64,
  },
  {
    make: 'Apple',
    model: 'iPhone 14 Pro',
    software: '17.5.1',
    lensModel: 'iPhone 14 Pro back triple camera 6.86mm f/1.78',
    focalNum: 686,
    focalDen: 100,
    fNum: 178,
    fDen: 100,
    expNum: 1,
    expDen: 100,
    iso: 80,
  },
  {
    make: 'Sony',
    model: 'ILCE-7M4',
    software: 'ILCE-7M4 v3.01',
    lensModel: 'FE 24-70mm F2.8 GM II',
    focalNum: 35,
    focalDen: 1,
    fNum: 28,
    fDen: 10,
    expNum: 1,
    expDen: 250,
    iso: 100,
  },
  {
    make: 'Canon',
    model: 'Canon EOS R6 Mark II',
    software: 'Firmware Version 1.3.0',
    lensModel: 'RF24-70mm F2.8 L IS USM',
    focalNum: 50,
    focalDen: 1,
    fNum: 28,
    fDen: 10,
    expNum: 1,
    expDen: 200,
    iso: 125,
  },
  {
    make: 'Samsung',
    model: 'SM-S928B',
    software: 'S928BXXU1AXCA',
    lensModel: 'Samsung Galaxy S24 Ultra Primary Camera',
    focalNum: 63,
    focalDen: 10,
    fNum: 17,
    fDen: 10,
    expNum: 1,
    expDen: 160,
    iso: 50,
  },
];

function getRandomProfile(): CameraProfile & { dateTime: string } {
  const profile = REALISTIC_CAMERAS[Math.floor(Math.random() * REALISTIC_CAMERAS.length)];
  // Timestamp: random time within the last 48 hours
  const date = new Date(Date.now() - Math.floor(Math.random() * 48 * 3600 * 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateTime = `${date.getFullYear()}:${pad(date.getMonth() + 1)}:${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return { ...profile, dateTime };
}

function buildCameraExifApp1(profile: CameraProfile & { dateTime: string }): Uint8Array {
  const ifd0TagCount = 9;
  const ifd0Size = 2 + ifd0TagCount * 12 + 4;

  const exifSubTagCount = 8;
  const exifSubSize = 2 + exifSubTagCount * 12 + 4;

  const ifd0Offset = 8;
  const exifSubOffset = ifd0Offset + ifd0Size;
  const dataOffsetStart = exifSubOffset + exifSubSize;

  let currentDataOffset = dataOffsetStart;
  const dataEntries: { offset: number; bytes: Uint8Array }[] = [];

  function addString(str: string) {
    const s = str.endsWith('\0') ? str : str + '\0';
    const bytes = new TextEncoder().encode(s);
    const offset = currentDataOffset;
    dataEntries.push({ offset, bytes });
    currentDataOffset += bytes.length;
    if (currentDataOffset % 2 !== 0) {
      dataEntries.push({ offset: currentDataOffset, bytes: new Uint8Array([0]) });
      currentDataOffset += 1;
    }
    return { offset, count: bytes.length };
  }

  function addRational(num: number, den: number) {
    const bytes = new Uint8Array(8);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, num, true);
    view.setUint32(4, den, true);
    const offset = currentDataOffset;
    dataEntries.push({ offset, bytes });
    currentDataOffset += 8;
    return offset;
  }

  const makeData = addString(profile.make);
  const modelData = addString(profile.model);
  const softwareData = addString(profile.software);
  const dateData = addString(profile.dateTime);
  const xResOffset = addRational(72, 1);
  const yResOffset = addRational(72, 1);

  const expTimeOffset = addRational(profile.expNum, profile.expDen);
  const fNumOffset = addRational(profile.fNum, profile.fDen);
  const dateOrigData = addString(profile.dateTime);
  const dateDigData = addString(profile.dateTime);
  const focalOffset = addRational(profile.focalNum, profile.focalDen);
  const lensModelData = addString(profile.lensModel);

  const tiffBytes = new Uint8Array(currentDataOffset);
  const view = new DataView(tiffBytes.buffer);

  // TIFF Header: 'II' (Little-endian 0x4949) + 42 + IFD0 offset
  view.setUint16(0, 0x4949, false);
  view.setUint16(2, 42, true);
  view.setUint32(4, ifd0Offset, true);

  // IFD0
  let p = ifd0Offset;
  view.setUint16(p, ifd0TagCount, true); p += 2;

  // Make (0x010F, ASCII)
  view.setUint16(p, 0x010F, true); view.setUint16(p + 2, 2, true); view.setUint32(p + 4, makeData.count, true); view.setUint32(p + 8, makeData.offset, true); p += 12;
  // Model (0x0110, ASCII)
  view.setUint16(p, 0x0110, true); view.setUint16(p + 2, 2, true); view.setUint32(p + 4, modelData.count, true); view.setUint32(p + 8, modelData.offset, true); p += 12;
  // Orientation (0x0112, SHORT, value 1)
  view.setUint16(p, 0x0112, true); view.setUint16(p + 2, 3, true); view.setUint32(p + 4, 1, true); view.setUint16(p + 8, 1, true); view.setUint16(p + 10, 0, true); p += 12;
  // XResolution (0x011A, RATIONAL)
  view.setUint16(p, 0x011A, true); view.setUint16(p + 2, 5, true); view.setUint32(p + 4, 1, true); view.setUint32(p + 8, xResOffset, true); p += 12;
  // YResolution (0x011B, RATIONAL)
  view.setUint16(p, 0x011B, true); view.setUint16(p + 2, 5, true); view.setUint32(p + 4, 1, true); view.setUint32(p + 8, yResOffset, true); p += 12;
  // ResolutionUnit (0x0128, SHORT, value 2 = inches)
  view.setUint16(p, 0x0128, true); view.setUint16(p + 2, 3, true); view.setUint32(p + 4, 1, true); view.setUint16(p + 8, 2, true); view.setUint16(p + 10, 0, true); p += 12;
  // Software (0x0131, ASCII)
  view.setUint16(p, 0x0131, true); view.setUint16(p + 2, 2, true); view.setUint32(p + 4, softwareData.count, true); view.setUint32(p + 8, softwareData.offset, true); p += 12;
  // DateTime (0x0132, ASCII)
  view.setUint16(p, 0x0132, true); view.setUint16(p + 2, 2, true); view.setUint32(p + 4, dateData.count, true); view.setUint32(p + 8, dateData.offset, true); p += 12;
  // ExifIFDPointer (0x8769, LONG)
  view.setUint16(p, 0x8769, true); view.setUint16(p + 2, 4, true); view.setUint32(p + 4, 1, true); view.setUint32(p + 8, exifSubOffset, true); p += 12;

  view.setUint32(p, 0, true); p += 4; // next IFD = 0

  // Exif Sub-IFD
  p = exifSubOffset;
  view.setUint16(p, exifSubTagCount, true); p += 2;

  // ExposureTime (0x829A, RATIONAL)
  view.setUint16(p, 0x829A, true); view.setUint16(p + 2, 5, true); view.setUint32(p + 4, 1, true); view.setUint32(p + 8, expTimeOffset, true); p += 12;
  // FNumber (0x829D, RATIONAL)
  view.setUint16(p, 0x829D, true); view.setUint16(p + 2, 5, true); view.setUint32(p + 4, 1, true); view.setUint32(p + 8, fNumOffset, true); p += 12;
  // ISOSpeedRatings (0x8827, SHORT)
  view.setUint16(p, 0x8827, true); view.setUint16(p + 2, 3, true); view.setUint32(p + 4, 1, true); view.setUint16(p + 8, profile.iso, true); view.setUint16(p + 10, 0, true); p += 12;
  // ExifVersion (0x9000, UNDEFINED, "0232")
  view.setUint16(p, 0x9000, true); view.setUint16(p + 2, 7, true); view.setUint32(p + 4, 4, true);
  tiffBytes.set(new TextEncoder().encode('0232'), p + 8); p += 12;
  // DateTimeOriginal (0x9003, ASCII)
  view.setUint16(p, 0x9003, true); view.setUint16(p + 2, 2, true); view.setUint32(p + 4, dateOrigData.count, true); view.setUint32(p + 8, dateOrigData.offset, true); p += 12;
  // DateTimeDigitized (0x9004, ASCII)
  view.setUint16(p, 0x9004, true); view.setUint16(p + 2, 2, true); view.setUint32(p + 4, dateDigData.count, true); view.setUint32(p + 8, dateDigData.offset, true); p += 12;
  // FocalLength (0x920A, RATIONAL)
  view.setUint16(p, 0x920A, true); view.setUint16(p + 2, 5, true); view.setUint32(p + 4, 1, true); view.setUint32(p + 8, focalOffset, true); p += 12;
  // LensModel (0xA434, ASCII)
  view.setUint16(p, 0xA434, true); view.setUint16(p + 2, 2, true); view.setUint32(p + 4, lensModelData.count, true); view.setUint32(p + 8, lensModelData.offset, true); p += 12;

  view.setUint32(p, 0, true); p += 4; // next IFD = 0

  // Copy data entries
  for (const entry of dataEntries) {
    tiffBytes.set(entry.bytes, entry.offset);
  }

  // Wrap in JPEG APP1 segment: 0xFF, 0xE1, <length 2 bytes>, 'Exif\0\0', <tiffBytes>
  const exifHeader = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]); // "Exif\0\0"
  const payloadLength = 2 + exifHeader.length + tiffBytes.length;
  const app1Segment = new Uint8Array(2 + payloadLength);
  const app1View = new DataView(app1Segment.buffer);

  app1Segment[0] = 0xFF;
  app1Segment[1] = 0xE1;
  app1View.setUint16(2, payloadLength, false); // Big-endian
  app1Segment.set(exifHeader, 4);
  app1Segment.set(tiffBytes, 10);

  return app1Segment;
}

/**
 * Strips all C2PA, AI, XMP, IPTC, and comment segments from JPEG bytes
 * and injects a genuine, authentic camera EXIF profile.
 */
export function stripAiAndInjectRealMetadata(inputBytes: Uint8Array): Uint8Array {
  // Validate JPEG SOI marker
  if (inputBytes.length < 4 || inputBytes[0] !== 0xFF || inputBytes[1] !== 0xD8) {
    return inputBytes;
  }

  const chunks: Uint8Array[] = [new Uint8Array([0xFF, 0xD8])];
  let p = 2;
  const len = inputBytes.length;
  const view = new DataView(inputBytes.buffer, inputBytes.byteOffset, inputBytes.byteLength);

  // Generate authentic camera EXIF segment
  const app1Exif = buildCameraExifApp1(getRandomProfile());
  chunks.push(app1Exif);

  while (p < len) {
    if (inputBytes[p] !== 0xFF) {
      chunks.push(inputBytes.subarray(p));
      break;
    }

    const marker = inputBytes[p + 1];

    if (marker === 0xD9) {
      // EOI
      chunks.push(new Uint8Array([0xFF, 0xD9]));
      break;
    }

    if (marker === 0xDA) {
      // SOS (Start of Scan) - all following bytes until EOI are scan data
      chunks.push(inputBytes.subarray(p));
      break;
    }

    // Standalone markers
    if (marker === 0x01 || (marker >= 0xD0 && marker <= 0xD7)) {
      chunks.push(new Uint8Array([0xFF, marker]));
      p += 2;
      continue;
    }

    if (p + 4 > len) {
      chunks.push(inputBytes.subarray(p));
      break;
    }

    const segmentLength = view.getUint16(p + 2, false);
    const segmentTotal = 2 + segmentLength;

    // Filter segments:
    // 0xEB: APP11 (C2PA manifests / JUMBF boxes)
    // 0xE1: APP1 (old EXIF or XMP containing AI markers)
    // 0xED: APP13 (Photoshop IPTC)
    // 0xFE: COM (generator comments like "Midjourney", "Prompt: ...")
    const isC2PA = marker === 0xEB;
    const isApp1 = marker === 0xE1;
    const isApp13 = marker === 0xED;
    const isComment = marker === 0xFE;

    if (isC2PA || isApp1 || isApp13 || isComment) {
      // Strip segment
      p += segmentTotal;
    } else {
      // Keep valid JPEG structure (DQT 0xDB, SOF0 0xC0, DHT 0xC4, APP0 0xE0, etc.)
      chunks.push(inputBytes.subarray(p, p + segmentTotal));
      p += segmentTotal;
    }
  }

  // Calculate total size and combine
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}
