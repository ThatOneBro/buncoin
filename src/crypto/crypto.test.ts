import { describe, expect, it } from "bun:test";
import { isValidBase64String } from "../util";
import { generateKeyPair, hash, sign, verify, KeyPair } from "./crypto";

describe("Crypto signatures", () => {
  let keys;

  describe("generateKeyPair()", () => {
    it("should generate a valid keypair", () => {
      keys = generateKeyPair();
      expect(keys instanceof KeyPair).toBe(true);
      const rawKeyPair = (keys as KeyPair).getRawKeypair();
      expect(rawKeyPair.pk instanceof Buffer).toBe(true);
      expect(rawKeyPair.sk instanceof Buffer).toBe(true);
    });
  });

  describe("hash()", () => {
    // NOTE: Sodium uses Blake2b for crypto_generichash, we are using 256-bit version
    // Source of hash result comparison: https://api.hashify.net/hash/blake2b-256/base64?value=Testing_the_hashing_function!
    it("should return a valid hash for a given string", () => {
      const hashed = hash("Testing_the_hashing_function!", {
        inputEncoding: "utf-8",
        outputEncoding: "base64",
      });
      expect(hashed).toBe("fMEIMsPsH1WB+nzHlQcGmht9Rw+jR38APvbG2mosjoU=");
    });
    it("should allow Buffers to be hashed", () => {
      const hashed = hash(
        Buffer.from("Testing_the_hashing_function!", "utf-8"),
        { inputEncoding: "buffer", outputEncoding: "base64" }
      );
      expect(hashed).toBe("fMEIMsPsH1WB+nzHlQcGmht9Rw+jR38APvbG2mosjoU=");
    });
    // Source: https://api.hashify.net/hash/blake2b-256/hex?value=Testing_the_hashing_function!
    it("should allow output encoding to be set", () => {
      const hashed = hash(
        Buffer.from("Testing_the_hashing_function!", "utf-8"),
        { inputEncoding: "buffer", outputEncoding: "hex" }
      );
      expect(hashed).toBe(
        "7cc10832c3ec1f5581fa7cc79507069a1b7d470fa3477f003ef6c6da6a2c8e85"
      );
    });
  });

  describe("sign()", () => {
    it("should allow a Buffer to be signed", () => {
      const strAsBuffer = Buffer.from("This is a test", "utf-8");
      const sig = sign(strAsBuffer, keys.getRawKeypair().sk);
      expect(sig instanceof Buffer).toBe(true);
    });
    it("should allow a string to be signed", () => {
      // DESIGN: It may make more sense to make the default utf-8... but maybe not
      const sig = sign("This is a test", keys.getRawKeypair().sk, {
        inputEncoding: "utf-8",
      });
      expect(sig instanceof Buffer).toBe(true);
    });
    it("should allow the user to set an output encoding", () => {
      const sig = sign("This is a test", keys.getRawKeypair().sk, {
        inputEncoding: "utf-8",
        outputEncoding: "base64",
      });
      expect(typeof sig === "string").toBe(true);
      expect(isValidBase64String(sig as string)).toBe(true);
    });
    it("should throw an error if input encoding doesn't match specified encoding", () => {
      let error: Error;
      try {
        sign("This is a test", keys.getRawKeypair().sk, {
          inputEncoding: "buffer",
        });
      } catch (e) {
        error = e;
      }
      expect(error instanceof Error).toBe(true);
    });
    // TODO: Enumerate all possible encodings
  });

  describe("verify()", () => {
    const msg = "This is a test";
    const sig = sign(msg, keys.getRawKeypair().sk, {
      inputEncoding: "utf-8",
    });

    it("should return true if signed by this key and message is valid", () => {
      const valid = verify(sig, msg, keys.getRawKeypair().pk, {
        messageEncoding: "utf-8",
      });
      expect(valid).toBe(true);
    });
    it("should return false if signature is malformed", () => {
      const malformedSig = Buffer.from(sig.toString("base64"), "base64");
      malformedSig[0] = 0x00;
      const valid = verify(malformedSig, msg, keys.getRawKeypair().pk, {
        messageEncoding: "utf-8",
      });
      expect(valid).toBe(false);
    });
    it("should return false if signed by another key", () => {
      const wrongKeys = generateKeyPair();
      const wrongSig = sign(msg, wrongKeys.getRawKeypair().sk, {
        inputEncoding: "utf-8",
      });
      const valid = verify(wrongSig, msg, keys.getRawKeypair().pk, {
        messageEncoding: "utf-8",
      });
      expect(valid).toBe(false);
    });
    it("should throw an error if the encoding of any part doesn't match declared or implicit encoding", () => {
      let error;
      try {
        verify(sig, msg, keys.getRawKeypair().pk, {
          messageEncoding: "buffer",
        });
      } catch (e) {
        error = e;
      }
      expect(error instanceof Error).toBe(true);
    });
    it("should return false if the message is wrong, even if signature is valid for given public key", () => {
      const wrongMsg = "This is another test";
      const wrongSig = sign(wrongMsg, keys.getRawKeypair().sk, {
        inputEncoding: "utf-8",
      });
      const valid = verify(wrongSig, msg, keys.getRawKeypair().sk, {
        messageEncoding: "utf-8",
      });
      expect(valid).toBe(false);
    });
  });
});
