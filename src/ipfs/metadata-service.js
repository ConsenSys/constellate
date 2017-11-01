'use strict'

const BlockAPI = require('./block-api')
const CID = require('cids')
const dagCBOR = require('../dag-cbor')
const errUnexpectedCID = require('../errors').errUnexpectedCID
const multiaddr = require('multiaddr')

const {
  order,
  transform
} = require('../util')

const isValidCID = cid => {
  return CID.isCID(cid) &&
         cid.codec === dagCBOR.codec &&
         cid.version === dagCBOR.version
}

// TODO - Refactor add param with the config object
function MetadataService(addr) {
  this.host = 'ipfs.infura.io'
  this.port = '5001'
  this.blocks = new BlockAPI({
    'host': 'ipfs.infura.io',
    'port': '5001',
    'protocol': 'https',
    'user-agent': '/node-ipfs-api/14.3.7/',
    'content-type': 'multipart/form-data; boundary=7ewtcwll2tk',
    'api-path': '/api/v0/'
  })
}

MetadataService.prototype.get = function (cid, cb) {
  if (!isValidCID(cid)) {
    return cb(errUnexpectedCID(cid))
  }
  this.blocks.get(cid, (err, block) => {
    if (err) {
      return cb(err)
    }
    dagCBOR.deserialize(block.data, (err, obj) => {
      if (err) {
        return cb(err)
      }
      try {
        obj = transform(obj, val => {
          if (val.constructor === Object && val['/']) {
            cid = new CID(val['/'])
            return {
              '/': cid.toBaseEncodedString()
            }
          }
          return val
        })
        cb(null, order(obj))
      } catch (err) {
        cb(err)
      }
    })
  })
}

MetadataService.prototype.hash = (obj, cb) => {
  dagCBOR.cid(obj, (err, cid) => {
    if (err) {
      return cb(err)
    }
    cb(null, cid.toBaseEncodedString())
  })
}

MetadataService.prototype.hashFromCID = (cid, cb) => {
  if (!isValidCID(cid)) {
    return cb(errUnexpectedCID(cid))
  }
  const hash = cid.toBaseEncodedString()
  cb(null, hash)
}

MetadataService.prototype.pathToCID = path => {
  const parts = path.split('/')
  const cid = new CID(parts.shift())
  const remPath = parts.join('/')
  return { cid, remPath }
}

MetadataService.prototype.pathToURL = function (path) {
  return `http://${this.host}:${this.port}/api/v0/dag/get?arg=` + path
}

MetadataService.prototype.put = function (obj, cb) {
  dagCBOR.serialize(obj, (err, data) => {
    if (err) {
      return cb(err)
    }
    this.blocks.put(data, (err, block) => {
      if (err) {
        return cb(err)
      }
      cb(null, block.cid)
    })
  })
}

MetadataService.prototype.resolve = dagCBOR.resolve

module.exports = MetadataService
