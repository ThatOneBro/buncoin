import { dlopen, FFIType, suffix } from "bun:ffi";
import { isValidBase64String, isValidHexString } from "../util";

// TODO: Add more generalized way of linking to libsodium
const path = `libsodium.${suffix}`;

let initialized = false;

const lib = dlopen(path, {
  sodium_init: {
    returns: FFIType.i32,
  },
  crypto_generichash_bytes: {
    returns: FFIType.u32,
  },
  crypto_sign_secretkeybytes: {
    returns: FFIType.u32,
  },
  crypto_sign_publickeybytes: {
    returns: FFIType.u32,
  },
  crypto_sign_bytes: {
    returns: FFIType.u32,
  },
  crypto_generichash: {
    args: [
      FFIType.ptr,
      FFIType.u32,
      FFIType.cstring,
      FFIType.u32,
      FFIType.ptr,
      FFIType.u32,
    ],
  },
  crypto_sign_keypair: {
    args: [FFIType.ptr, FFIType.ptr],
  },
  crypto_sign_detached: {
    args: [FFIType.ptr, FFIType.u32, FFIType.ptr, FFIType.u32, FFIType.ptr],
  },
  crypto_sign_verify_detached: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.u32, FFIType.ptr],
    returns: FFIType.i32,
  },
});

const HASH_BYTES = lib.symbols.crypto_generichash_bytes();
const SIGN_SK_BYTES = lib.symbols.crypto_sign_secretkeybytes();
const SIGN_PK_BYTES = lib.symbols.crypto_sign_publickeybytes();
const SIGN_BYTES = lib.symbols.crypto_sign_bytes();

type ValidEncoding = Buffer | string;
type InputEncoding = "buffer" | "utf-8" | "hex" | "base64";
type OutputEncoding = "buffer" | "hex" | "base64";

export const init = (): number => {
  return lib.symbols.sodium_init();
};

const ensureInitialized = () => {
  if (!initialized) {
    if (init() === -1) throw new Error("Unable to initialize sodium");
    initialized = true;
  }
};

const checkInputEncoding = (
  input: ValidEncoding,
  encoding: InputEncoding
): void => {
  switch (encoding) {
    case "buffer":
      if (!(input instanceof Buffer))
        throw new Error("Invalid buffer given when buffer input was expected!");
      break;
    case "utf-8":
      if (typeof input !== "string")
        throw new Error(
          "Invalid string provided when UTF-8 encoding was expected!"
        );
      break;
    case "base64":
      if (!isValidBase64String(input as string))
        throw new Error(
          "Invalid string provided when base64 encoding was expected!"
        );
      break;
    case "hex":
      if (!isValidHexString(input as string))
        throw new Error(
          "Invalid string provided when hex encoding was expected!"
        );
      break;
    default:
      throw new Error(`No valid encoding given! Encoding: ${encoding}`);
  }
};

type HashOptions = {
  inputEncoding: InputEncoding;
  outputEncoding: OutputEncoding;
};
export const hash = (
  message: ValidEncoding,
  options: Partial<HashOptions> = {}
): ValidEncoding => {
  const defaultOpts = {
    inputEncoding: "buffer",
    outputEncoding: "buffer",
  } as HashOptions;
  ensureInitialized();
  const opts = { ...defaultOpts, ...options };
  checkInputEncoding(message, opts.inputEncoding);
  const newStr = new Uint8Array(HASH_BYTES);
  lib.symbols.crypto_generichash(
    newStr,
    HASH_BYTES,
    typeof message === "string"
      ? Buffer.from(message, opts.inputEncoding)
      : message,
    message.length,
    null,
    0
  );
  const newStrBuf = Buffer.from(newStr);
  return opts.outputEncoding === "buffer"
    ? newStrBuf
    : newStrBuf.toString(opts.outputEncoding);
};

type RawKeyPair = { pk: Buffer; sk: Buffer };
export class KeyPair {
  private keypair: RawKeyPair;
  constructor(pk: Buffer, sk: Buffer) {
    if (!pk || !pk.length) throw new Error("Invalid public key for keypair!");
    if (!sk || !sk.length) throw new Error("Invalid secret key for keypair!");
    this.keypair = { pk, sk };
  }

  getRawKeypair(): RawKeyPair {
    return this.keypair;
  }
}

export const generateKeyPair = (): KeyPair => {
  ensureInitialized();
  const pkBuf = new Uint8Array(SIGN_PK_BYTES);
  const skBuf = new Uint8Array(SIGN_SK_BYTES);
  lib.symbols.crypto_sign_keypair(pkBuf, skBuf);
  return new KeyPair(Buffer.from(pkBuf), Buffer.from(skBuf));
};

type SignOptions = {
  inputEncoding: "buffer" | "utf-8" | "hex" | "base64";
  outputEncoding: "buffer" | "hex" | "base64";
};
export const sign = (
  message: ValidEncoding,
  sk: Buffer,
  options: Partial<SignOptions> = {}
): ValidEncoding => {
  const defaultOpts = {
    inputEncoding: "buffer",
    outputEncoding: "buffer",
  } as SignOptions;
  ensureInitialized();
  const opts = { ...defaultOpts, ...options };
  checkInputEncoding(message, opts.inputEncoding);
  const sig = new Uint8Array(SIGN_BYTES);
  lib.symbols.crypto_sign_detached(
    sig,
    null,
    typeof message === "string"
      ? Buffer.from(message, opts.inputEncoding)
      : message,
    message.length,
    sk
  );
  const sigBuf = Buffer.from(sig);
  return opts.outputEncoding === "buffer"
    ? sigBuf
    : sigBuf.toString(opts.outputEncoding);
};

type VerifyOptions = {
  sigEncoding: "buffer" | "utf-8" | "hex" | "base64";
  messageEncoding: "buffer" | "utf-8" | "hex" | "base64";
};
export const verify = (
  sig: ValidEncoding,
  message: ValidEncoding,
  pk: Buffer,
  options: Partial<VerifyOptions> = {}
): boolean => {
  const defaultOpts = {
    sigEncoding: "buffer",
    messageEncoding: "buffer",
  } as VerifyOptions;
  ensureInitialized();
  const opts = { ...defaultOpts, ...options };
  checkInputEncoding(sig, opts.sigEncoding);
  checkInputEncoding(message, opts.messageEncoding);
  const verified = lib.symbols.crypto_sign_verify_detached(
    typeof sig === "string" ? Buffer.from(sig, opts.sigEncoding) : sig,
    typeof message === "string"
      ? Buffer.from(message, opts.messageEncoding)
      : message,
    message.length,
    pk
  );
  return verified === 0 ? true : false;
};
