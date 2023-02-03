
  export function hexToBytes(hexString: string) {
    return Uint8Array.from(
      hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    );
  }
  