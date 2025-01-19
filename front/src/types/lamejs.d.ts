declare module 'lamejs' {
    export class Mp3Encoder {
      constructor(channels: number, sampleRate: number, kbps: number);
      encodeBuffer(input: Int16Array): Uint8Array;
      flush(): Uint8Array;
    }
  
    export namespace WavHeader {
      export function readHeader(view: DataView): {
        channels: number;
        sampleRate: number;
        dataOffset: number;
        dataLen: number;
      };
    }
  }