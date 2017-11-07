'use strict'

// const ContentService = require('../src/content-service/browser')
const Person = require('js-coalaip/build/core').Person;
const MusicGroup = require('js-coalaip/build/music').MusicGroup;
const ContentServiceBrowser = require('../lib/constellate.min').ContentServiceBrowser
const MetadataService = require('../lib/constellate.min').MetadataService
// const ContentServiceBrowser = require('../src/content-service/browser')
// const MetadataService = require('../src/metadata-service')
const endpoint = require('../test/fixtures/endpoints').ipfs

const contentService = new ContentServiceBrowser({
  name: 'ipfs',
  path: endpoint
})

const metadataService = new MetadataService({
  name: 'ipfs',
  path: endpoint
})

const fileInput = document.querySelector('input[type="file"]')
const importBtn = document.getElementById('import-btn')
const metadata = document.getElementById('metadata')

importBtn.addEventListener('click', async () => {
  const files = Array.from(fileInput.files)
  if (files.length) {
    const imageFiles = await importAndPutContent(files)
    imageFiles[0].setCaption(imageFiles[0].getName());
    const imageObjectHash = contentService.hashes[imageFiles[0].getName()];

    // create person
    const person = new Person();
    person.setGivenName('Coolio');
    person.setFamilyName('Jones');

    // create group
    const group = new MusicGroup();
    group.setName('The Stellars');
    group.setDescription('The Stellars go galactic in 2018');
    console.log('imageFiles[0]', imageFiles[0])
    group.addImage(imageFiles[0]); // do not connect yet, as images may change often

    group.addMember(person);
    console.log('group.subInstances()', group.subInstances())

    await importAndPutMetadata(group.subInstances())
    // .catch(console.log('Error Importing and Putting Music Group Metadata'));

    const groupObj = await getMetadata(group.getName())
    // .catch(console.log('Error getting metadata for ', group.getName()));
    console.log('groupObj', groupObj)
    // const password = prompt('Enter a password (optional)', '')
    // contentService.import(files, password, (err, mediaObjects) => {
    //   if (err) {
    //     return console.error(err)
    //   }
    //   const meta = mediaObjects.map(mediaObj => mediaObj.data())
    //   metadata.innerHTML = JSON.stringify(meta, null, 2)
    // })
  }
})



const importAndPutContent = (contentArray) => {
  const contentPromise = new Promise((res, rej) => {
    contentService.import(contentArray, (err, trks) => {
      if (err) rej(err);
      res(trks);
      // contentService.put((error) => {
      //   if (error) rej(error);
      // });
    });
  });
  return contentPromise;
};


const importAndPutMetadata = async (metadata) => {
  const metadataPromise = new Promise((res, rej) => {
    metadataService.import(metadata, (err) => {
      if (err) rej(err);
      metadataService.put((error) => {
        if (error) rej(error);
        // in case you want hashes
        // no real use case or better option for response
        res(metadataService.hashes);
      });
    });
  });
  return metadataPromise;
};

const getMetadata = async (nameOrHash) => {
  const metadataPromise = new Promise((res, rej) => {
    metadataService.get(nameOrHash, true, 'cid', (err, obj) => {
      if (err) rej(err);
      res(obj);
    });
  });
  return metadataPromise;
};
