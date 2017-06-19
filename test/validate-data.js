const { validateLD } = require('../lib/linked-data.js');
const { promiseSequence } = require('../lib/util.js');

const {
  createReadStream,
  readFileSync
} = require('fs');

const {
  addFile,
  getCBOR,
  putCBOR,
  startPeer
} = require('../lib/ipfs.js');

const cids = {};
const data = {};
const multihashes = {};

data.composer = JSON.parse(readFileSync(__dirname + '/party/composer.json'));
data.lyricist = JSON.parse(readFileSync(__dirname + '/party/lyricist.json'));
data.performer = JSON.parse(readFileSync(__dirname + '/party/performer.json'));
data.producer = JSON.parse(readFileSync(__dirname + '/party/producer.json'));
data.publisher = JSON.parse(readFileSync(__dirname + '/party/publisher.json'));
data.recordLabel = JSON.parse(readFileSync(__dirname + '/party/recordLabel.json'));

data.album = JSON.parse(readFileSync(__dirname + '/meta/album.json'));
data.audio = JSON.parse(readFileSync(__dirname + '/meta/audio.json'));
data.composition = JSON.parse(readFileSync(__dirname + '/meta/composition.json'));
data.image = JSON.parse(readFileSync(__dirname + '/meta/image.json'));
data.playlist = JSON.parse(readFileSync(__dirname + '/meta/playlist.json'));
data.recording = JSON.parse(readFileSync(__dirname + '/meta/recording.json'));
data.release = JSON.parse(readFileSync(__dirname + '/meta/release.json'));

data.contractAccount = JSON.parse(readFileSync(__dirname + '/ethon/contract-account.json'));
data.externalAccount = JSON.parse(readFileSync(__dirname + '/ethon/external-account.json'));

data.compositionCopyright = JSON.parse(readFileSync(__dirname + '/coala/composition-copyright.json'));
data.compositionCopyrightAssertion = JSON.parse(readFileSync(__dirname + '/coala/composition-copyright-assertion.json'));
data.compositionRight = JSON.parse(readFileSync(__dirname + '/coala/composition-right.json'));
data.compositionRightAssignment = JSON.parse(readFileSync(__dirname + '/coala/composition-right-assignment.json'));

data.recordingCopyright = JSON.parse(readFileSync(__dirname + '/coala/recording-copyright.json'));
data.recordingCopyrightAssertion = JSON.parse(readFileSync(__dirname + '/coala/recording-copyright-assertion.json'));
data.recordingRight = JSON.parse(readFileSync(__dirname + '/coala/recording-right.json'));
data.recordingRightAssignment = JSON.parse(readFileSync(__dirname + '/coala/recording-right-assignment.json'));

function setMultihash(path) {
  const readStream = createReadStream(__dirname + path);
  return addFile(readStream, '').then((hash) => {
    const name = path.split('/').pop()
    console.log(name + ': ' + hash);
    multihashes[path] = hash;
  });
}

function getCBORAndValidate(name) {
  return getCBOR(cids[name]).then((dagNode) => {
    return validateLD(dagNode);
  }).then(() => {
    console.log('Validated ' + name);
  });
}

function setCID(name) {
  return putCBOR(data[name]).then((cid) => {
    console.log(name + ': ' + cid.toBaseEncodedString());
    cids[name] = cid;
  });
}

startPeer().then((details) => {

  console.log('Peer details:', details);

  return promiseSequence(
    () => setCID('externalAccount'),
    () => setCID('composer'),
    () => setCID('lyricist'),
    () => setCID('performer'),
    () => setCID('producer'),
    () => setCID('publisher'),
    () => setCID('recordLabel'),
    () => setMultihash('/test.mp3'),
    () => setMultihash('/test.png'),
    () => setCID('album'),
    () => setCID('audio'),
    () => setCID('composition'),
    () => setCID('image'),
    () => setCID('playlist'),
    () => setCID('recording'),
    () => setCID('release'),
    () => setCID('contractAccount'),
    () => setCID('compositionCopyright'),
    () => setCID('compositionCopyrightAssertion'),
    () => setCID('compositionRight'),
    () => setCID('compositionRightAssignment'),
    () => setCID('recordingCopyright'),
    () => setCID('recordingCopyrightAssertion'),
    () => setCID('recordingRight'),
    () => setCID('recordingRightAssignment')
  );

}).then(() => {

  return promiseSequence(
    () => getCBORAndValidate('composition'),
    () => getCBORAndValidate('compositionCopyright'),
    () => getCBORAndValidate('compositionCopyrightAssertion'),
    () => getCBORAndValidate('compositionRight'),
    () => getCBORAndValidate('compositionRightAssignment'),
    () => getCBORAndValidate('recording'),
    () => getCBORAndValidate('recordingCopyright'),
    () => getCBORAndValidate('recordingCopyrightAssertion'),
    () => getCBORAndValidate('recordingRight'),
    () => getCBORAndValidate('recordingRightAssignment'),
    () => getCBORAndValidate('release')
  );

}).then(() => console.log('done'));
