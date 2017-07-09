'use strict';

const Keccak = require('keccakjs');
const request = require('xhr-request');

// @flow

/**
 * @module/constellate/src/swarm
 */

/*

The following code is adapted from https://github.com/axic/swarmgw/blob/master/index.js

-------------------------------- LICENSE --------------------------------

The MIT License (MIT)

Copyright (c) 2016 Alex Beregszaszi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

module.exports = function(url: string) {
  if (!url) url = 'http://swarm-gateways.net/';
  this.addFile = (buf: Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
      request(
        url + 'bzzr:/',
        { method: 'POST' },
        (err, data, res) => {
          if (err) return reject(err);
          if (res.statusCode !== 200) {
            return reject(new Error(data));
          }
          if (!this.isFileHash(data)) {
            return reject(new Error('Invalid hash: ' + data));
          }
          resolve(data);
        }
      );
    });
  }
  this.getFile = (hash: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      request(
        url + 'bzzr://' + hash,
        { responseType: 'arraybuffer' },
        (err, data, res) => {
          if (err) return reject(err);
          if (res.statusCode !== 200) {
            return reject(data);
          }
          resolve(Buffer.from(data));
        }
      );
    });
  }
  this.contentUrl = (hash: string): string => url + 'bzzr://' + hash;
  this.hashFile = swarmHash;
  this.isFileHash = (hash: string): boolean => {
    return /^[a-f0-9]{64}$/.test(hash);
  }
}

/*

The following code is adapted from https://github.com/ethereum/go-ethereum/blob/master/swarm/storage/chunker.go

---------------------------- LICENSE ----------------------------
Copyright 2016 The go-ethereum Authors
This file is part of the go-ethereum library.

The go-ethereum library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The go-ethereum library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the go-ethereum library. If not, see <http:www.gnu.org/licenses/>.

*/

function swarmHash(data) {
    const size = data.length;
    let depth = 0, treeSize;
    for (treeSize = 4096; treeSize < size; treeSize *= 128) depth++;
    return split(data, depth, size, treeSize/128).toString('hex');
}

function split(chunk, depth, size, treeSize) {
  while (depth && size < treeSize) {
      treeSize /= 128;
      depth--;
  }
  if (!depth) {
      return hashChunk(chunk, size);
  }
  const chunks = [];
  let i, secSize;
  for (i = 0; i < size; i += treeSize) {
      if (size - i < treeSize) {
          secSize = size - i;
      } else {
          secSize = treeSize;
      }
      chunks.push(split(chunk.slice(i, i+secSize), depth-1, secSize, treeSize/128));
  }
  return hashChunk(Buffer.concat(chunks), size);
}


/*

The following code is from https://github.com/axic/swarmhash/blob/master/index.js

-------------------------------- LICENSE --------------------------------

The MIT License (MIT)

Copyright (c) 2016 Alex Beregszaszi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

function hashChunk(chunk: Buffer, size: number): Buffer {
    const hash = new Keccak(256);
    const tmp = Buffer.alloc(8);
    tmp.writeUIntLE(size, 0, 6);
    hash.update(tmp);
    hash.update(chunk);
    return Buffer.from(hash.digest(), 'binary');
}
