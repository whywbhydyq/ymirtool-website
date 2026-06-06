/*
 * Ymir Tool Web Crypto AES-GCM helper
 *
 * Scope:
 * - Modern AES-GCM text encryption/decryption helper.
 * - No DOM dependency.
 * - No CryptoJS dependency.
 * - Not wired into any page by default; UI integration is a later phase.
 */
(function attachYmirWebCryptoAesGcm(globalScope) {
  'use strict';

  var PREFIX = 'ymir-aes-gcm-v1:';
  var VERSION = 1;
  var ALGORITHM = 'AES-GCM';
  var KDF = 'PBKDF2-HMAC-SHA-256';
  var KEY_LENGTH_BITS = 256;
  var PBKDF2_ITERATIONS = 600000;
  var SALT_LENGTH_BYTES = 16;
  var IV_LENGTH_BYTES = 12;
  var TAG_LENGTH_BITS = 128;

  function getCrypto() {
    var cryptoObject = globalScope.crypto || globalScope.msCrypto;
    if (!cryptoObject || !cryptoObject.subtle || !cryptoObject.getRandomValues) {
      throw new Error('Web Crypto API is not available in this browser.');
    }
    return cryptoObject;
  }

  function isSupported() {
    try {
      getCrypto();
      return typeof TextEncoder !== 'undefined' && typeof TextDecoder !== 'undefined';
    } catch (error) {
      return false;
    }
  }

  function assertNonEmptyString(value, name) {
    if (typeof value !== 'string' || value.length === 0) {
      throw new TypeError(name + ' must be a non-empty string.');
    }
  }

  function normalizeText(value) {
    return String(value).normalize('NFC');
  }

  function encodeUtf8(value) {
    return new TextEncoder().encode(normalizeText(value));
  }

  function decodeUtf8(bytes) {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  }

  function randomBytes(length) {
    var bytes = new Uint8Array(length);
    getCrypto().getRandomValues(bytes);
    return bytes;
  }

  function bytesToBase64Url(bytes) {
    var binary = '';
    var chunkSize = 0x8000;
    for (var offset = 0; offset < bytes.length; offset += chunkSize) {
      var chunk = bytes.subarray(offset, offset + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function base64UrlToBytes(value) {
    if (typeof value !== 'string' || !/^[A-Za-z0-9_-]*$/.test(value)) {
      throw new Error('Invalid base64url value.');
    }

    var base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  function serializePayload(payload) {
    return PREFIX + bytesToBase64Url(encodeUtf8(JSON.stringify(payload)));
  }

  function isSerializedPayload(value) {
    return typeof value === 'string' && value.indexOf(PREFIX) === 0;
  }

  function parsePayload(serialized) {
    assertNonEmptyString(serialized, 'ciphertext');
    if (!isSerializedPayload(serialized)) {
      throw new Error('Unsupported AES-GCM payload prefix.');
    }

    var raw = serialized.slice(PREFIX.length);
    var payload;
    try {
      payload = JSON.parse(decodeUtf8(base64UrlToBytes(raw)));
    } catch (error) {
      throw new Error('Invalid AES-GCM payload.');
    }

    if (!payload || payload.v !== VERSION || payload.alg !== ALGORITHM || payload.kdf !== KDF) {
      throw new Error('Unsupported AES-GCM payload metadata.');
    }
    if (payload.iter !== PBKDF2_ITERATIONS) {
      throw new Error('Unsupported PBKDF2 iteration count.');
    }
    if (typeof payload.salt !== 'string' || typeof payload.iv !== 'string' || typeof payload.ct !== 'string') {
      throw new Error('Incomplete AES-GCM payload.');
    }

    return payload;
  }

  function describePayload(serialized) {
    var payload = parsePayload(serialized);
    var salt = base64UrlToBytes(payload.salt);
    var iv = base64UrlToBytes(payload.iv);
    var ciphertext = base64UrlToBytes(payload.ct);
    return {
      prefix: PREFIX,
      version: payload.v,
      algorithm: payload.alg,
      kdf: payload.kdf,
      iterations: payload.iter,
      saltBytes: salt.length,
      ivBytes: iv.length,
      ciphertextBytes: ciphertext.length,
      tagLengthBits: TAG_LENGTH_BITS
    };
  }

  function importPasswordKey(password) {
    assertNonEmptyString(password, 'password');
    return getCrypto().subtle.importKey(
      'raw',
      encodeUtf8(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
  }

  function deriveAesKey(password, salt) {
    return importPasswordKey(password).then(function deriveFromPassword(baseKey) {
      return getCrypto().subtle.deriveKey(
        {
          name: 'PBKDF2',
          hash: 'SHA-256',
          salt: salt,
          iterations: PBKDF2_ITERATIONS
        },
        baseKey,
        {
          name: ALGORITHM,
          length: KEY_LENGTH_BITS
        },
        false,
        ['encrypt', 'decrypt']
      );
    });
  }

  function encryptText(plaintext, password) {
    assertNonEmptyString(plaintext, 'plaintext');
    assertNonEmptyString(password, 'password');

    var salt = randomBytes(SALT_LENGTH_BYTES);
    var iv = randomBytes(IV_LENGTH_BYTES);
    return deriveAesKey(password, salt).then(function encryptWithKey(key) {
      return getCrypto().subtle.encrypt(
        {
          name: ALGORITHM,
          iv: iv,
          tagLength: TAG_LENGTH_BITS
        },
        key,
        encodeUtf8(plaintext)
      );
    }).then(function buildPayload(cipherBuffer) {
      return serializePayload({
        v: VERSION,
        alg: ALGORITHM,
        kdf: KDF,
        iter: PBKDF2_ITERATIONS,
        salt: bytesToBase64Url(salt),
        iv: bytesToBase64Url(iv),
        ct: bytesToBase64Url(new Uint8Array(cipherBuffer))
      });
    });
  }

  function decryptText(serializedCiphertext, password) {
    assertNonEmptyString(password, 'password');

    var payload = parsePayload(serializedCiphertext);
    var salt = base64UrlToBytes(payload.salt);
    var iv = base64UrlToBytes(payload.iv);
    var ciphertext = base64UrlToBytes(payload.ct);

    if (salt.length !== SALT_LENGTH_BYTES) {
      throw new Error('Invalid AES-GCM salt length.');
    }
    if (iv.length !== IV_LENGTH_BYTES) {
      throw new Error('Invalid AES-GCM IV length.');
    }

    return deriveAesKey(password, salt).then(function decryptWithKey(key) {
      return getCrypto().subtle.decrypt(
        {
          name: ALGORITHM,
          iv: iv,
          tagLength: TAG_LENGTH_BITS
        },
        key,
        ciphertext
      );
    }).then(function decodePlaintext(plainBuffer) {
      return decodeUtf8(new Uint8Array(plainBuffer));
    });
  }

  globalScope.YmirWebCryptoAesGcm = {
    constants: Object.freeze({
      prefix: PREFIX,
      version: VERSION,
      algorithm: ALGORITHM,
      kdf: KDF,
      keyLengthBits: KEY_LENGTH_BITS,
      pbkdf2Iterations: PBKDF2_ITERATIONS,
      saltLengthBytes: SALT_LENGTH_BYTES,
      ivLengthBytes: IV_LENGTH_BYTES,
      tagLengthBits: TAG_LENGTH_BITS
    }),
    isSupported: isSupported,
    encryptText: encryptText,
    decryptText: decryptText,
    isSerializedPayload: isSerializedPayload,
    parsePayload: parsePayload,
    describePayload: describePayload
  };
}(typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : this)));

