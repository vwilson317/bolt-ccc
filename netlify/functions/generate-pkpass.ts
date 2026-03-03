/**
 * generate-pkpass — Netlify Function
 *
 * Generates an Apple Wallet PKPass (.pkpass) for a given barraca promo.
 * iOS Safari and Chrome-on-iOS intercept the `application/vnd.apple.pkpass`
 * MIME type and open the system "Add to Wallet" sheet automatically.
 *
 * ─── Certificate files (stored in the repo, bundled with the function) ──────
 *
 *  Apple's three PEM certificates used to sign a PKPass together exceed
 *  AWS Lambda's 4 KB hard limit on total environment variables.  To work
 *  around this, the two PUBLIC certificates are stored as files that get
 *  bundled with the Lambda deployment (via `included_files` in netlify.toml).
 *  Only the PRIVATE KEY stays in an environment variable.
 *
 *  netlify/functions/certs/pass_cert.pem   ← Pass Type ID public certificate
 *    Convert: openssl x509 -inform DER -in pass.cer -out pass_cert.pem
 *
 *  netlify/functions/certs/wwdr.pem        ← Apple WWDR G3 intermediate cert
 *    Download: https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer
 *    Convert:  openssl x509 -inform DER -in AppleWWDRCAG3.cer -out wwdr.pem
 *
 * ─── Required environment variables ────────────────────────────────────────
 *
 *  APPLE_TEAM_IDENTIFIER        10-char Apple Developer Team ID (e.g. AB1CD2EF3G)
 *  APPLE_PASS_TYPE_IDENTIFIER   Pass type ID (e.g. pass.com.cariocacoastalclub.promo)
 *  APPLE_PASS_KEY_PEM           Private key for the Pass Type ID certificate
 *                                 openssl pkcs12 -in Certificates.p12 -nocerts -nodes -out key.pem
 *                                 Paste the full PEM block in Netlify → Site Settings → Env Vars.
 *
 * ─── Local testing ───────────────────────────────────────────────────────────
 *
 *  1. Place real pass_cert.pem and wwdr.pem in netlify/functions/certs/
 *  2. Add APPLE_TEAM_IDENTIFIER, APPLE_PASS_TYPE_IDENTIFIER, APPLE_PASS_KEY_PEM to .env
 *  3. Run: netlify dev
 *  4. Visit: http://localhost:8888/.netlify/functions/generate-pkpass?barracaPromoId=thais-follow
 *     On iOS (Safari or Chrome) the Wallet sheet will appear.
 */

import type { Handler, HandlerEvent } from '@netlify/functions';
import crypto from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

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
// Certificate file loader
// ---------------------------------------------------------------------------

/**
 * Load a PEM certificate file that was bundled with the function via
 * `included_files` in netlify.toml.
 *
 * Netlify preserves the project-root-relative path inside the Lambda package
 * (extracted to /var/task), so we try both __dirname-relative and
 * process.cwd()-relative paths to work in local `netlify dev` as well.
 */
function loadCertFile(projectRelativePath: string): string {
  const candidates = [
    // Local development: __dirname = netlify/functions/  (TypeScript source dir)
    join(__dirname, '..', '..', projectRelativePath),
    // Lambda runtime: /var/task — included_files preserves the project-root path
    join(process.cwd(), projectRelativePath),
    // In case esbuild places the bundle inside the functions dir
    join(__dirname, projectRelativePath),
  ];

  for (const p of candidates) {
    if (existsSync(p)) return readFileSync(p, 'utf8');
  }

  throw new Error(
    `Certificate file not found: ${projectRelativePath}\nSearched:\n` +
      candidates.join('\n'),
  );
}

// ---------------------------------------------------------------------------
// Inline barraca promo data (duplicated from src/data/barracaPromos.ts so the Netlify function
// bundle doesn't need to resolve client-side module paths)
// ---------------------------------------------------------------------------
interface BarracaPromoMeta {
  id: string;
  name: string;
  instagramHandle: string;
  discountCode: string;
  barracaLocation: string;
  passBackgroundRgb: string;
}

const BARRACA_PROMO_MAP: Record<string, BarracaPromoMeta> = {
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
    passBackgroundRgb: 'rgb(234,179,8)',
  },
  'nino101-follow': {
    id: 'nino101-follow',
    name: 'Nino',
    instagramHandle: 'nino101',
    discountCode: 'NINO101',
    barracaLocation: 'Rio de Janeiro',
    passBackgroundRgb: 'rgb(100,116,139)',
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
  barraca: BarracaPromoMeta,
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
    serialNumber: `${barraca.id}-${Date.now()}`,
    teamIdentifier: teamId,
    organizationName: 'Carioca Coastal Club',
    description: `${barraca.name}'s Barraca Discount Pass`,
    foregroundColor: 'rgb(255,255,255)',
    backgroundColor: barraca.passBackgroundRgb,
    labelColor: 'rgb(209,250,229)',
    logoText: 'Carioca Coastal Club',
    coupon: {
      primaryFields: [
        {
          key: 'offer',
          label: 'DISCOUNT CODE',
          value: barraca.discountCode,
        },
      ],
      secondaryFields: [
        {
          key: 'barraca',
          label: 'BARRACA',
          value: `@${barraca.instagramHandle}`,
        },
      ],
      auxiliaryFields: [
        {
          key: 'location',
          label: 'LOCATION',
          value: barraca.barracaLocation,
        },
      ],
      backFields: [
        {
          key: 'terms',
          label: 'TERMS & CONDITIONS',
          value: `Show this pass at ${barraca.name}'s barraca in ${barraca.barracaLocation}. You must follow @${barraca.instagramHandle} on Instagram to qualify. Code cannot be combined with other offers.`,
        },
        {
          key: 'contact',
          label: 'INSTAGRAM',
          value: `@${barraca.instagramHandle}`,
        },
      ],
    },
    barcodes: [
      {
        message: barraca.discountCode,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1',
        altText: barraca.discountCode,
      },
    ],
    // Legacy barcode field for older iOS versions
    barcode: {
      message: barraca.discountCode,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1',
      altText: barraca.discountCode,
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

  // ── Resolve barraca promo ───────────────────────────────────────────────────────────
  const barracaPromoId = event.queryStringParameters?.barracaPromoId ?? '';
  const barraca = BARRACA_PROMO_MAP[barracaPromoId];
  if (!barraca) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Unknown barracaPromoId: ${barracaPromoId}` }),
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
  const keyPem = process.env.APPLE_PASS_KEY_PEM;

  if (!teamId || !passTypeId || !keyPem) {
    const missing = [
      !teamId && 'APPLE_TEAM_IDENTIFIER',
      !passTypeId && 'APPLE_PASS_TYPE_IDENTIFIER',
      !keyPem && 'APPLE_PASS_KEY_PEM',
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

  // ── Load certificate files (bundled with the function via included_files) ──
  let certPem: string;
  let wwdrPem: string;

  try {
    certPem = loadCertFile('netlify/functions/certs/pass_cert.pem');
    wwdrPem = loadCertFile('netlify/functions/certs/wwdr.pem');
  } catch (err) {
    console.error('generate-pkpass: failed to load certificate files:', err);
    return {
      statusCode: 503,
      body: JSON.stringify({
        error: 'Apple Wallet certificate files are missing or unreadable.',
        detail: err instanceof Error ? err.message : String(err),
        hint: 'Place pass_cert.pem and wwdr.pem in netlify/functions/certs/ — see the file headers for instructions.',
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  // ── Generate the pass ──────────────────────────────────────────────────────
  try {
    const passBuffer = await buildPkPass(
      barraca,
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
        'Content-Disposition': `attachment; filename="${barraca.discountCode}.pkpass"`,
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
