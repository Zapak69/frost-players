(function () {
  function readU16(bytes, pos) {
    return bytes[pos] | (bytes[pos + 1] << 8);
  }

  function skipSubBlocks(bytes, pos) {
    while (pos < bytes.length) {
      const size = bytes[pos];
      pos += 1;
      if (!size) break;
      pos += size;
    }
    return pos;
  }

  function parseGif(buffer) {
    const bytes = new Uint8Array(buffer);
    if (bytes[0] !== 0x47 || bytes[1] !== 0x49 || bytes[2] !== 0x46) throw new Error('not_gif');
    const width = readU16(bytes, 6);
    const height = readU16(bytes, 8);
    const packed = bytes[10];
    let pos = 13;
    let globalPalette = null;
    if (packed & 0x80) {
      const size = 3 * (1 << ((packed & 7) + 1));
      globalPalette = bytes.subarray(pos, pos + size);
      pos += size;
    }
    const frames = [];
    let gce = null;
    while (pos < bytes.length) {
      const block = bytes[pos];
      pos += 1;
      if (block === 0x3b) break;
      if (block === 0x21) {
        const label = bytes[pos];
        pos += 1;
        if (label === 0xf9 && bytes[pos] === 4) {
          const flags = bytes[pos + 1];
          gce = { disposal: (flags >> 2) & 7, transparent: flags & 1 ? bytes[pos + 4] : -1, delay: readU16(bytes, pos + 2) * 10 };
        }
        pos = skipSubBlocks(bytes, pos);
        continue;
      }
      if (block === 0x2c) {
        const x = readU16(bytes, pos);
        const y = readU16(bytes, pos + 2);
        const w = readU16(bytes, pos + 4);
        const h = readU16(bytes, pos + 6);
        const flags = bytes[pos + 8];
        pos += 9;
        let palette = globalPalette;
        if (flags & 0x80) {
          const size = 3 * (1 << ((flags & 7) + 1));
          palette = bytes.subarray(pos, pos + size);
          pos += size;
        }
        const minCodeSize = bytes[pos];
        pos += 1;
        const dataStart = pos;
        pos = skipSubBlocks(bytes, pos);
        frames.push({
          x: x, y: y, w: w, h: h,
          interlaced: !!(flags & 0x40),
          palette: palette,
          minCodeSize: minCodeSize,
          dataStart: dataStart,
          dataEnd: pos,
          disposal: gce ? gce.disposal : 0,
          transparent: gce ? gce.transparent : -1,
          delay: gce && gce.delay > 10 ? gce.delay : 100
        });
        gce = null;
        continue;
      }
      break;
    }
    return { bytes: bytes, width: width, height: height, frames: frames };
  }

  function collectData(bytes, start, end) {
    let total = 0;
    let pos = start;
    while (pos < end) {
      const size = bytes[pos];
      if (!size) break;
      total += size;
      pos += size + 1;
    }
    const out = new Uint8Array(total);
    let o = 0;
    pos = start;
    while (pos < end) {
      const size = bytes[pos];
      if (!size) break;
      out.set(bytes.subarray(pos + 1, pos + 1 + size), o);
      o += size;
      pos += size + 1;
    }
    return out;
  }

  function lzwDecode(minCodeSize, data, pixelCount) {
    const MAX = 4096;
    const prefix = new Int16Array(MAX);
    const suffix = new Uint8Array(MAX);
    const stack = new Uint8Array(MAX + 1);
    const output = new Uint8Array(pixelCount);
    const clear = 1 << minCodeSize;
    const eoi = clear + 1;
    let available = clear + 2;
    let oldCode = -1;
    let codeSize = minCodeSize + 1;
    let codeMask = (1 << codeSize) - 1;
    for (let c = 0; c < clear; c++) suffix[c] = c;
    let datum = 0;
    let bits = 0;
    let first = 0;
    let top = 0;
    let pi = 0;
    let i = 0;
    while (pi < pixelCount) {
      if (top === 0) {
        if (bits < codeSize) {
          if (i >= data.length) break;
          datum += data[i++] << bits;
          bits += 8;
          continue;
        }
        let code = datum & codeMask;
        datum >>= codeSize;
        bits -= codeSize;
        if (code > available || code === eoi) break;
        if (code === clear) {
          codeSize = minCodeSize + 1;
          codeMask = (1 << codeSize) - 1;
          available = clear + 2;
          oldCode = -1;
          continue;
        }
        if (oldCode === -1) {
          stack[top++] = suffix[code];
          oldCode = code;
          first = code;
          continue;
        }
        const inCode = code;
        if (code === available) {
          stack[top++] = first;
          code = oldCode;
        }
        while (code > clear) {
          stack[top++] = suffix[code];
          code = prefix[code];
        }
        first = suffix[code];
        stack[top++] = first;
        if (available < MAX) {
          prefix[available] = oldCode;
          suffix[available] = first;
          available++;
          if ((available & codeMask) === 0 && available < MAX) {
            codeSize++;
            codeMask += available;
          }
        }
        oldCode = inCode;
      }
      top--;
      output[pi++] = stack[top];
    }
    return output;
  }

  function rowOrder(h, interlaced) {
    const rows = new Array(h);
    if (!interlaced) {
      for (let r = 0; r < h; r++) rows[r] = r;
      return rows;
    }
    let n = 0;
    [[0, 8], [4, 8], [2, 4], [1, 2]].forEach(function (pass) {
      for (let r = pass[0]; r < h; r += pass[1]) rows[n++] = r;
    });
    return rows;
  }

  function yieldToBrowser() {
    return new Promise(function (resolve) { setTimeout(resolve, 0); });
  }

  async function decodeWithJs(buffer, outW, outH, maxFrames, onFrame) {
    const gif = parseGif(buffer);
    const count = gif.frames.length;
    if (count < 2) return;
    const step = Math.max(1, Math.ceil(count / maxFrames));
    const W = gif.width;
    const H = gif.height;
    const full = document.createElement('canvas');
    full.width = W;
    full.height = H;
    const fullCtx = full.getContext('2d');
    const image = fullCtx.createImageData(W, H);
    const buf = image.data;
    let saved = null;
    let prev = null;
    let pendingDelay = 0;
    for (let f = 0; f < count; f++) {
      const fr = gif.frames[f];
      if (prev && prev.disposal === 2) {
        for (let yy = prev.y; yy < Math.min(H, prev.y + prev.h); yy++) {
          buf.fill(0, (yy * W + prev.x) * 4, (yy * W + Math.min(W, prev.x + prev.w)) * 4);
        }
      } else if (prev && prev.disposal === 3 && saved) {
        buf.set(saved);
      }
      saved = fr.disposal === 3 ? buf.slice() : null;
      const indices = lzwDecode(fr.minCodeSize, collectData(gif.bytes, fr.dataStart, fr.dataEnd), fr.w * fr.h);
      const pal = fr.palette;
      const rows = rowOrder(fr.h, fr.interlaced);
      let src = 0;
      for (let r = 0; r < fr.h; r++) {
        const yy = fr.y + rows[r];
        if (yy >= H) {
          src += fr.w;
          continue;
        }
        let dst = (yy * W + fr.x) * 4;
        for (let c = 0; c < fr.w; c++, src++, dst += 4) {
          const idx = indices[src];
          if (idx === fr.transparent || fr.x + c >= W || !pal) continue;
          const p = idx * 3;
          buf[dst] = pal[p];
          buf[dst + 1] = pal[p + 1];
          buf[dst + 2] = pal[p + 2];
          buf[dst + 3] = 255;
        }
      }
      prev = fr;
      pendingDelay += fr.delay;
      if (f % step === 0 || f === count - 1) {
        fullCtx.putImageData(image, 0, 0);
        const out = document.createElement('canvas');
        out.width = outW;
        out.height = outH;
        out.getContext('2d').drawImage(full, 0, 0, outW, outH);
        onFrame({ canvas: out, delay: Math.max(30, pendingDelay) });
        pendingDelay = 0;
      }
      await yieldToBrowser();
    }
  }

  async function decodeWithImageDecoder(buffer, outW, outH, maxFrames, onFrame) {
    const decoder = new ImageDecoder({ data: buffer, type: 'image/gif' });
    try {
      await decoder.tracks.ready;
      const track = decoder.tracks.selectedTrack;
      const count = track ? track.frameCount : 0;
      if (count < 2) return;
      const step = Math.max(1, Math.ceil(count / maxFrames));
      for (let i = 0; i < count; i += step) {
        const result = await decoder.decode({ frameIndex: i });
        const img = result.image;
        const out = document.createElement('canvas');
        out.width = outW;
        out.height = outH;
        out.getContext('2d').drawImage(img, 0, 0, outW, outH);
        onFrame({ canvas: out, delay: (img.duration ? Math.max(30, img.duration / 1000) : 100) * step });
        img.close();
      }
    } finally {
      decoder.close();
    }
  }

  window.FrostGif = {
    decode: function (buffer, options, onFrame) {
      const outW = options.width;
      const outH = options.height;
      const maxFrames = options.maxFrames || 120;
      if (typeof ImageDecoder !== 'undefined') {
        let emitted = 0;
        return decodeWithImageDecoder(buffer, outW, outH, maxFrames, function (frame) {
          emitted++;
          onFrame(frame);
        }).catch(function () {
          if (!emitted) return decodeWithJs(buffer, outW, outH, maxFrames, onFrame);
        });
      }
      return decodeWithJs(buffer, outW, outH, maxFrames, onFrame);
    }
  };
})();
