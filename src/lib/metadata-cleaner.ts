/**
 * Metadata Cleaner & Comprehensive Camera EXIF Synthesizer
 * 
 * 1. Strips all C2PA manifests (APP11 0xFFEB), Adobe XMP AI markers (APP1 0xFFE1),
 *    Photoshop IPTC records (APP13 0xFFED), and generator comment headers (COM 0xFFFE).
 * 2. Injects authentic, comprehensive camera EXIF metadata:
 *    - Hardware: Camera make, model, lens make, lens model, lens specifications, firmware version.
 *    - Shooting Parameters: Shutter speed, aperture (F-number), ISO, exposure program, metering mode, flash mode.
 *    - Sensor Characteristics: One-chip color area sensor, sRGB color space, white balance, focal length in 35mm.
 *    - Precision Timestamps: DateTimeOriginal, DateTimeDigitized, subsecond fractions, and timezone offset (+05:30).
 *    - Smartphone GPS IFD: Authentic latitude, longitude, altitude, image direction, and GPS timestamp.
 */

export interface CameraProfile {
  make: string;
  model: string;
  software: string;
  lensMake: string;
  lensModel: string;
  lensSpec: [number, number][]; // [focalMin, focalMax, fMin, fMax] as rationals
  focalNum: number;
  focalDen: number;
  focal35: number;
  fNum: number;
  fDen: number;
  expNum: number;
  expDen: number;
  iso: number;
  hasGps: boolean;
}

export interface GpsLocation {
  latRef: 'N' | 'S';
  lat: [number, number][]; // [deg, min, sec]
  lonRef: 'E' | 'W';
  lon: [number, number][];
  alt: [number, number];   // [meters, 1]
}

export const REALISTIC_CAMERAS: CameraProfile[] = [
  {
    make: 'Apple',
    model: 'iPhone 15 Pro',
    software: '17.6.1',
    lensMake: 'Apple',
    lensModel: 'iPhone 15 Pro back triple camera 6.86mm f/1.78',
    lensSpec: [[686, 100], [686, 100], [178, 100], [178, 100]],
    focalNum: 686,
    focalDen: 100,
    focal35: 24,
    fNum: 178,
    fDen: 100,
    expNum: 1,
    expDen: 120,
    iso: 64,
    hasGps: true,
  },
  {
    make: 'Apple',
    model: 'iPhone 14 Pro',
    software: '17.5.1',
    lensMake: 'Apple',
    lensModel: 'iPhone 14 Pro back triple camera 6.86mm f/1.78',
    lensSpec: [[686, 100], [686, 100], [178, 100], [178, 100]],
    focalNum: 686,
    focalDen: 100,
    focal35: 24,
    fNum: 178,
    fDen: 100,
    expNum: 1,
    expDen: 100,
    iso: 80,
    hasGps: true,
  },
  {
    make: 'Sony',
    model: 'ILCE-7M4',
    software: 'ILCE-7M4 v3.01',
    lensMake: 'Sony',
    lensModel: 'FE 24-70mm F2.8 GM II',
    lensSpec: [[24, 1], [70, 1], [28, 10], [28, 10]],
    focalNum: 35,
    focalDen: 1,
    focal35: 35,
    fNum: 28,
    fDen: 10,
    expNum: 1,
    expDen: 250,
    iso: 100,
    hasGps: false,
  },
  {
    make: 'Canon',
    model: 'Canon EOS R6 Mark II',
    software: 'Firmware Version 1.3.0',
    lensMake: 'Canon',
    lensModel: 'RF24-70mm F2.8 L IS USM',
    lensSpec: [[24, 1], [70, 1], [28, 10], [28, 10]],
    focalNum: 50,
    focalDen: 1,
    focal35: 50,
    fNum: 28,
    fDen: 10,
    expNum: 1,
    expDen: 200,
    iso: 125,
    hasGps: false,
  },
  {
    make: 'Samsung',
    model: 'SM-S928B',
    software: 'S928BXXU1AXCA',
    lensMake: 'Samsung',
    lensModel: 'Samsung Galaxy S24 Ultra Primary Camera',
    lensSpec: [[63, 10], [63, 10], [17, 10], [17, 10]],
    focalNum: 63,
    focalDen: 10,
    focal35: 23,
    fNum: 17,
    fDen: 10,
    expNum: 1,
    expDen: 160,
    iso: 50,
    hasGps: true,
  },
];

export const SAMPLE_LOCATIONS: GpsLocation[] = [
  { latRef: 'N', lat: [[28, 1], [36, 1], [4215, 100]], lonRef: 'E', lon: [[77, 1], [12, 1], [3140, 100]], alt: [216, 1] }, // Delhi
  { latRef: 'N', lat: [[19, 1], [4, 1], [3820, 100]], lonRef: 'E', lon: [[72, 1], [52, 1], [5910, 100]], alt: [14, 1] },   // Mumbai
  { latRef: 'N', lat: [[12, 1], [58, 1], [2310, 100]], lonRef: 'E', lon: [[77, 1], [35, 1], [4520, 100]], alt: [920, 1] },  // Bengaluru
  { latRef: 'N', lat: [[26, 1], [55, 1], [1120, 100]], lonRef: 'E', lon: [[75, 1], [47, 1], [3210, 100]], alt: [431, 1] },  // Jaipur
];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function buildCameraExifApp1(
  profile: CameraProfile = REALISTIC_CAMERAS[Math.floor(Math.random() * REALISTIC_CAMERAS.length)],
  loc: GpsLocation = SAMPLE_LOCATIONS[Math.floor(Math.random() * SAMPLE_LOCATIONS.length)],
  timestampDate: Date = new Date(Date.now() - getRandomInt(1, 24) * 3600 * 1000)
): Uint8Array {
  const hasGps = profile.hasGps && !!loc;
  const ifd0TagCount = hasGps ? 10 : 9;
  const ifd0Size = 2 + ifd0TagCount * 12 + 4;

  const exifSubTagCount = 29;
  const exifSubSize = 2 + exifSubTagCount * 12 + 4;

  const gpsTagCount = hasGps ? 13 : 0;
  const gpsSize = hasGps ? 2 + gpsTagCount * 12 + 4 : 0;

  const ifd0Offset = 8;
  const exifSubOffset = ifd0Offset + ifd0Size;
  const gpsOffset = exifSubOffset + exifSubSize;
  const dataOffsetStart = hasGps ? gpsOffset + gpsSize : gpsOffset;

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
    return { offset, count: bytes.length, raw: bytes };
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

  function addSRational(num: number, den: number) {
    const bytes = new Uint8Array(8);
    const view = new DataView(bytes.buffer);
    view.setInt32(0, num, true);
    view.setInt32(4, den, true);
    const offset = currentDataOffset;
    dataEntries.push({ offset, bytes });
    currentDataOffset += 8;
    return offset;
  }

  function addRationals(arr: [number, number][]) {
    const bytes = new Uint8Array(arr.length * 8);
    const view = new DataView(bytes.buffer);
    arr.forEach(([n, d], idx) => {
      view.setUint32(idx * 8, n, true);
      view.setUint32(idx * 8 + 4, d, true);
    });
    const offset = currentDataOffset;
    dataEntries.push({ offset, bytes });
    currentDataOffset += bytes.length;
    return offset;
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const d = timestampDate;
  const dtStr = `${d.getFullYear()}:${pad(d.getMonth() + 1)}:${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const dateStamp = `${d.getFullYear()}:${pad(d.getMonth() + 1)}:${pad(d.getDate())}`;
  const subsecStr = String(getRandomInt(100, 999));
  const tzStr = '+05:30';

  const makeData = addString(profile.make);
  const modelData = addString(profile.model);
  const softwareData = addString(profile.software);
  const dtData = addString(dtStr);
  const dtOrigData = addString(dtStr);
  const dtDigData = addString(dtStr);
  const tzData = addString(tzStr);
  const subsecData = addString(subsecStr);
  const lensMakeData = addString(profile.lensMake);
  const lensModelData = addString(profile.lensModel);

  const xResOffset = addRational(72, 1);
  const yResOffset = addRational(72, 1);
  const expTimeOffset = addRational(profile.expNum, profile.expDen);
  const fNumOffset = addRational(profile.fNum, profile.fDen);
  const focalOffset = addRational(profile.focalNum, profile.focalDen);
  const apexShutter = Math.round(Math.log2(profile.expDen / profile.expNum) * 100);
  const shutterSpeedOffset = addSRational(apexShutter, 100);
  const apexAperture = Math.round(2 * Math.log2(profile.fNum / profile.fDen) * 100);
  const apertureOffset = addRational(apexAperture, 100);
  const brightnessOffset = addSRational(getRandomInt(200, 450), 100);
  const expBiasOffset = addSRational(0, 100);
  const lensSpecOffset = addRationals(profile.lensSpec);

  let latOffset = 0;
  let lonOffset = 0;
  let altOffset = 0;
  let gpsTimeOffset = 0;
  let gpsDateData = { count: 0, offset: 0, raw: new Uint8Array() };
  let speedOffset = 0;
  let dirOffset = 0;

  if (hasGps) {
    latOffset = addRationals(loc.lat);
    lonOffset = addRationals(loc.lon);
    altOffset = addRational(loc.alt[0], loc.alt[1]);
    gpsTimeOffset = addRationals([[d.getUTCHours(), 1], [d.getUTCMinutes(), 1], [d.getUTCSeconds(), 1]]);
    gpsDateData = addString(dateStamp);
    speedOffset = addRational(0, 1);
    dirOffset = addRational(getRandomInt(50, 310), 1);
  }

  const tiffBytes = new Uint8Array(currentDataOffset);
  const view = new DataView(tiffBytes.buffer);

  // TIFF Header
  view.setUint16(0, 0x4949, false); // Little-endian 'II'
  view.setUint16(2, 42, true);
  view.setUint32(4, ifd0Offset, true);

  // IFD0
  let p = ifd0Offset;
  view.setUint16(p, ifd0TagCount, true); p += 2;
  const setTag = (tag: number, type: number, count: number, valOrOffset: number, inlineBytes?: Uint8Array) => {
    view.setUint16(p, tag, true);
    view.setUint16(p + 2, type, true);
    view.setUint32(p + 4, count, true);
    if (inlineBytes) {
      tiffBytes.set(inlineBytes, p + 8);
    } else if (type === 3 && count === 1) { // SHORT
      view.setUint16(p + 8, valOrOffset, true);
      view.setUint16(p + 10, 0, true);
    } else {
      view.setUint32(p + 8, valOrOffset, true);
    }
    p += 12;
  };

  setTag(0x010F, 2, makeData.count, makeData.offset);
  setTag(0x0110, 2, modelData.count, modelData.offset);
  setTag(0x0112, 3, 1, 1); // Orientation = Top-Left
  setTag(0x011A, 5, 1, xResOffset);
  setTag(0x011B, 5, 1, yResOffset);
  setTag(0x0128, 3, 1, 2); // Inches
  setTag(0x0131, 2, softwareData.count, softwareData.offset);
  setTag(0x0132, 2, dtData.count, dtData.offset);
  setTag(0x8769, 4, 1, exifSubOffset); // ExifIFDPointer
  if (hasGps) {
    setTag(0x8825, 4, 1, gpsOffset); // GPSInfoIFDPointer
  }
  view.setUint32(p, 0, true); p += 4;

  // Exif Sub-IFD
  p = exifSubOffset;
  view.setUint16(p, exifSubTagCount, true); p += 2;

  setTag(0x829A, 5, 1, expTimeOffset);
  setTag(0x829D, 5, 1, fNumOffset);
  setTag(0x8822, 3, 1, 2); // ExposureProgram = Normal program
  setTag(0x8827, 3, 1, profile.iso);
  setTag(0x9000, 7, 4, 0, new TextEncoder().encode('0232')); // ExifVersion 0232
  setTag(0x9003, 2, dtOrigData.count, dtOrigData.offset);
  setTag(0x9004, 2, dtDigData.count, dtDigData.offset);
  setTag(0x9010, 2, tzData.count, tzData.offset); // OffsetTime
  setTag(0x9011, 2, tzData.count, tzData.offset); // OffsetTimeOriginal
  setTag(0x9012, 2, tzData.count, tzData.offset); // OffsetTimeDigitized
  setTag(0x9201, 10, 1, shutterSpeedOffset); // ShutterSpeedValue
  setTag(0x9202, 5, 1, apertureOffset); // ApertureValue
  setTag(0x9203, 10, 1, brightnessOffset); // BrightnessValue
  setTag(0x9204, 10, 1, expBiasOffset); // ExposureBiasValue
  setTag(0x9207, 3, 1, 5); // MeteringMode = Multi-segment / Pattern
  setTag(0x9208, 3, 1, 0); // LightSource = Auto
  setTag(0x9209, 3, 1, 16); // Flash = Did not fire, compulsory mode
  setTag(0x920A, 5, 1, focalOffset);
  setTag(0x9291, 2, subsecData.count, 0, subsecData.raw); // SubsecTimeOriginal
  setTag(0x9292, 2, subsecData.count, 0, subsecData.raw); // SubsecTimeDigitized
  setTag(0xA001, 3, 1, 1); // ColorSpace = sRGB
  setTag(0xA217, 3, 1, 2); // SensingMethod = One-chip color area sensor
  setTag(0xA402, 3, 1, 0); // ExposureMode = Auto
  setTag(0xA403, 3, 1, 0); // WhiteBalance = Auto
  setTag(0xA405, 3, 1, profile.focal35); // FocalLengthIn35mmFilm
  setTag(0xA406, 3, 1, 0); // SceneCaptureType = Standard
  setTag(0xA432, 5, 4, lensSpecOffset); // LensSpecification
  setTag(0xA433, 2, lensMakeData.count, lensMakeData.offset); // LensMake
  setTag(0xA434, 2, lensModelData.count, lensModelData.offset); // LensModel
  view.setUint32(p, 0, true); p += 4;

  // GPS IFD
  if (hasGps) {
    p = gpsOffset;
    view.setUint16(p, gpsTagCount, true); p += 2;
    setTag(0x0000, 1, 4, 0, new Uint8Array([2, 3, 0, 0])); // GPSVersionID
    setTag(0x0001, 2, 2, 0, new TextEncoder().encode(loc.latRef + '\0'));
    setTag(0x0002, 5, 3, latOffset); // GPSLatitude
    setTag(0x0003, 2, 2, 0, new TextEncoder().encode(loc.lonRef + '\0'));
    setTag(0x0004, 5, 3, lonOffset); // GPSLongitude
    setTag(0x0005, 1, 1, 0, new Uint8Array([0, 0, 0, 0])); // AltitudeRef = sea level
    setTag(0x0006, 5, 1, altOffset); // GPSAltitude
    setTag(0x0007, 5, 3, gpsTimeOffset); // GPSTimeStamp
    setTag(0x000C, 2, 2, 0, new TextEncoder().encode('K\0')); // SpeedRef = km/h
    setTag(0x000D, 5, 1, speedOffset); // GPSSpeed
    setTag(0x0010, 2, 2, 0, new TextEncoder().encode('T\0')); // ImgDirectionRef = True direction
    setTag(0x0011, 5, 1, dirOffset); // GPSImgDirection
    setTag(0x001D, 2, gpsDateData.count, gpsDateData.offset); // GPSDateStamp
    view.setUint32(p, 0, true); p += 4;
  }

  // Copy data entries
  for (const entry of dataEntries) {
    tiffBytes.set(entry.bytes, entry.offset);
  }

  // Wrap in JPEG APP1 segment: 0xFF, 0xE1, <length 2 bytes>, 'Exif\0\0', <tiffBytes>
  const exifHeader = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]);
  const payloadLength = 2 + exifHeader.length + tiffBytes.length;
  const app1Segment = new Uint8Array(2 + payloadLength);
  const app1View = new DataView(app1Segment.buffer);

  app1Segment[0] = 0xFF;
  app1Segment[1] = 0xE1;
  app1View.setUint16(2, payloadLength, false);
  app1Segment.set(exifHeader, 4);
  app1Segment.set(tiffBytes, 10);

  return app1Segment;
}

/**
 * Strips all C2PA, AI, XMP, IPTC, and comment segments from JPEG bytes
 * and injects a genuine, comprehensive camera EXIF profile with GPS & shooting details.
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

  // Generate authentic comprehensive camera EXIF segment
  const app1Exif = buildCameraExifApp1();
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
      p += segmentTotal;
    } else {
      chunks.push(inputBytes.subarray(p, p + segmentTotal));
      p += segmentTotal;
    }
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}
