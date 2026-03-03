/**
 * generate-pkpass — Netlify Function
 *
 * Generates an Apple Wallet PKPass (.pkpass) for a given haka promo.
 * iOS Safari and Chrome-on-iOS intercept the `application/vnd.apple.pkpass`
 * MIME type and open the system "Add to Wallet" sheet automatically.
 *
 * ─── Required environment variables ────────────────────────────────────────
 *
 *  APPLE_TEAM_IDENTIFIER        10-char Apple Developer Team ID (e.g. AB1CD2EF3G)
 *  APPLE_PASS_TYPE_IDENTIFIER   Pass type ID from your developer account
 *                                 e.g. pass.com.cariocacoastalclub.promo
 *  APPLE_PASS_CERT_PEM          Your Pass Type ID certificate in PEM format
 *                                 (the .cer file converted: openssl x509 -inform DER -in pass.cer -out pass.pem)
 *  APPLE_PASS_KEY_PEM           The private key for the certificate in PEM format
 *                                 (openssl pkcs12 -in Certificates.p12 -nocerts -nodes -out key.pem)
 *  APPLE_WWDR_CERT_PEM          Apple WWDR G3 intermediate certificate in PEM format
 *                                 Download: https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer
 *                                 Convert:  openssl x509 -inform DER -in AppleWWDRCAG3.cer -out wwdr.pem
 *
 * ─── How to set them in Netlify ─────────────────────────────────────────────
 *
 *  In Site Settings → Environment Variables, add each variable above.
 *  Multi-line PEM values: paste the full PEM block (-----BEGIN … -----END …)
 *  exactly as-is; Netlify handles newlines correctly.
 *
 * ─── Local testing ───────────────────────────────────────────────────────────
 *
 *  Add the env vars to .env and run:
 *    netlify dev
 *  Then visit: http://localhost:8888/.netlify/functions/generate-pkpass?hakaId=thais-follow
 *  On iOS (Safari or Chrome) the Wallet sheet will appear.
 */

import type { Handler, HandlerEvent } from '@netlify/functions';
import crypto from 'crypto';

// We use dynamic require so the function can still be loaded even when
// the optional packages are not installed — it will just return a 503.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let JSZip: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let forge: any;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  JSZip = require('jszip');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  forge = require('node-forge');
} catch {
  // packages not installed — handled at runtime below
}

// ---------------------------------------------------------------------------
// Inline haka data (duplicated from src/data/hakas.ts so the Netlify function
// bundle doesn't need to resolve client-side module paths)
// ---------------------------------------------------------------------------
interface HakaMeta {
  id: string;
  name: string;
  instagramHandle: string;
  discountCode: string;
  barracaLocation: string;
  passBackgroundRgb: string;
}

const HAKA_MAP: Record<string, HakaMeta> = {
  'thais-follow': {
    id: 'thais-follow',
    name: 'Thais',
    instagramHandle: 'thai.82ipanema',
    discountCode: 'TY82',
    barracaLocation: 'Ipanema, Rio de Janeiro',
    passBackgroundRgb: 'rgb(16,185,129)',
  },
  'marcinho33-follow': {
    id: 'marcinho33-follow',
    name: 'Marcinho',
    instagramHandle: 'marcinho33',
    discountCode: 'MARC33',
    barracaLocation: 'Rio de Janeiro',
    passBackgroundRgb: 'rgb(59,130,246)',
  },
  'nino101-follow': {
    id: 'nino101-follow',
    name: 'Nino',
    instagramHandle: 'nino101',
    discountCode: 'NINO101',
    barracaLocation: 'Rio de Janeiro',
    passBackgroundRgb: 'rgb(244,63,94)',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sha1Hex(data: string): string {
  return crypto.createHash('sha1').update(data, 'utf8').digest('hex');
}

/**
 * Sign the manifest using PKCS#7 detached signature (what Apple Wallet expects).
 * Returns a Buffer containing the DER-encoded signature.
 */
function signManifest(
  manifestStr: string,
  certPem: string,
  keyPem: string,
  wwdrPem: string,
): Buffer {
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(manifestStr, 'utf8');

  const cert = forge.pki.certificateFromPem(certPem);
  const key = forge.pki.privateKeyFromPem(keyPem);
  const wwdr = forge.pki.certificateFromPem(wwdrPem);

  p7.addCertificate(cert);
  p7.addCertificate(wwdr);

  p7.addSigner({
    key,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha1,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      { type: forge.pki.oids.signingTime, value: new Date() },
    ],
  });

  p7.sign({ detached: true });

  const derBytes = forge.asn1.toDer(p7.toAsn1()).getBytes();
  return Buffer.from(derBytes, 'binary');
}

/**
 * Build and return a signed .pkpass as a Buffer.
 */
async function buildPkPass(
  haka: HakaMeta,
  teamId: string,
  passTypeId: string,
  certPem: string,
  keyPem: string,
  wwdrPem: string,
): Promise<Buffer> {
  // ── pass.json ──────────────────────────────────────────────────────────────
  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: passTypeId,
    serialNumber: `${haka.id}-${Date.now()}`,
    teamIdentifier: teamId,
    organizationName: 'Carioca Coastal Club',
    description: `${haka.name}'s Barraca Discount Pass`,
    foregroundColor: 'rgb(255,255,255)',
    backgroundColor: haka.passBackgroundRgb,
    labelColor: 'rgb(209,250,229)',
    logoText: 'Carioca Coastal Club',
    coupon: {
      primaryFields: [
        {
          key: 'offer',
          label: 'DISCOUNT CODE',
          value: haka.discountCode,
        },
      ],
      secondaryFields: [
        {
          key: 'barraca',
          label: 'BARRACA',
          value: `@${haka.instagramHandle}`,
        },
      ],
      auxiliaryFields: [
        {
          key: 'location',
          label: 'LOCATION',
          value: haka.barracaLocation,
        },
      ],
      backFields: [
        {
          key: 'terms',
          label: 'TERMS & CONDITIONS',
          value: `Show this pass at ${haka.name}'s barraca in ${haka.barracaLocation}. You must follow @${haka.instagramHandle} on Instagram to qualify. Code cannot be combined with other offers.`,
        },
        {
          key: 'contact',
          label: 'INSTAGRAM',
          value: `@${haka.instagramHandle}`,
        },
      ],
    },
    barcodes: [
      {
        message: haka.discountCode,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1',
        altText: haka.discountCode,
      },
    ],
    // Legacy barcode field for older iOS versions
    barcode: {
      message: haka.discountCode,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1',
      altText: haka.discountCode,
    },
  };

  const passJsonStr = JSON.stringify(passJson);

  // ── manifest.json (SHA-1 of every file in the bundle) ────────────────────
  const manifest: Record<string, string> = {
    'pass.json': sha1Hex(passJsonStr),
  };
  const manifestStr = JSON.stringify(manifest);

  // ── signature ─────────────────────────────────────────────────────────────
  const signatureBuffer = signManifest(manifestStr, certPem, keyPem, wwdrPem);

  // ── ZIP the bundle ─────────────────────────────────────────────────────────
  const zip = new JSZip();
  zip.file('pass.json', passJsonStr);
  zip.file('manifest.json', manifestStr);
  zip.file('signature', signatureBuffer);

  return zip.generateAsync({
    type: 'nodebuffer',
    compression: 'STORE', // Apple recommends STORE (no compression) for passes
  });
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const handler: Handler = async (event: HandlerEvent) => {
  // CORS / method guard
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // ── Resolve haka ───────────────────────────────────────────────────────────
  const hakaId = event.queryStringParameters?.hakaId ?? '';
  const haka = HAKA_MAP[hakaId];
  if (!haka) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Unknown hakaId: ${hakaId}` }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  // ── Check packages ─────────────────────────────────────────────────────────
  if (!JSZip || !forge) {
    return {
      statusCode: 503,
      body: JSON.stringify({
        error: 'PKPass generation packages not installed.',
        hint: 'Run: npm install jszip node-forge',
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  // ── Check env vars ─────────────────────────────────────────────────────────
  const teamId = process.env.APPLE_TEAM_IDENTIFIER;
  const passTypeId = process.env.APPLE_PASS_TYPE_IDENTIFIER;
  const certPem = process.env.APPLE_PASS_CERT_PEM;
  const keyPem = process.env.APPLE_PASS_KEY_PEM;
  const wwdrPem = process.env.APPLE_WWDR_CERT_PEM;

  if (!teamId || !passTypeId || !certPem || !keyPem || !wwdrPem) {
    const missing = [
      !teamId && 'APPLE_TEAM_IDENTIFIER',
      !passTypeId && 'APPLE_PASS_TYPE_IDENTIFIER',
      !certPem && 'APPLE_PASS_CERT_PEM',
      !keyPem && 'APPLE_PASS_KEY_PEM',
      !wwdrPem && 'APPLE_WWDR_CERT_PEM',
    ].filter(Boolean);

    return {
      statusCode: 503,
      body: JSON.stringify({
        error: 'Apple Wallet not configured. Set the required environment variables in Netlify.',
        missing,
        docs: 'See the comment block at the top of netlify/functions/generate-pkpass.ts',
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  // ── Generate the pass ──────────────────────────────────────────────────────
  try {
    const passBuffer = await buildPkPass(
      haka,
      teamId,
      passTypeId,
      certPem,
      keyPem,
      wwdrPem,
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${haka.discountCode}.pkpass"`,
        'Cache-Control': 'no-store',
      },
      body: passBuffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error('generate-pkpass error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate PKPass',
        detail: err instanceof Error ? err.message : String(err),
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
