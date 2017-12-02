'use strict'

// var ContentService = require('../src/content-service/browser')
var Person = require('js-coalaip/lib/core').Person;
var MusicGroup = require('js-coalaip/lib/music').MusicGroup;
var ContentServiceBrowser = require('../lib/constellate.min').ContentServiceBrowser
var MetadataService = require('../lib/constellate.min').MetadataService
// var ContentServiceBrowser = require('../src/content-service/browser')
// var MetadataService = require('../src/metadata-service')
var endpoint = require('../test/fixtures/endpoints').ipfs

var contentService = new ContentServiceBrowser({
  name: 'ipfs',
  path: endpoint
})

var metadataService = new MetadataService({
  name: 'ipfs',
  path: endpoint
})

var fileInput = document.querySelector('input[type="file"]')
var importBtn = document.getElementById('import-btn')
var metadata = document.getElementById('metadata')

importBtn.addEventListener('click', function() {
  var files = Array.from(fileInput.files)
  if (files.length) {
    importAndPutContent(files)
    .then(function(imageFiles){
      console.log('imageFiles[0]', JSON.stringify(imageFiles[0], null, 2))
      imageFiles[0].setCaption(imageFiles[0].getName());
      var imageObjectHash = contentService.hashes[imageFiles[0].getName()];
      console.log('contentService.hashes', contentService.hashes)

      // create person
      var person = new Person();
      person.setGivenName('Coolio');
      person.setFamilyName('Jones');

      // create group
      var group = new MusicGroup();
      group.setName('The Stellars');
      group.setDescription('The Stellars go galactic in 2018');
      group.addImage(imageFiles[0]); // do not connect yet, as images may change often

      group.addMember(person);
      console.log('group.subInstances()', group.subInstances())

      importAndPutMetadata(group.subInstances())
      .then(function(){
        // .catch(console.log('Error Importing and Putting Music Group Metadata'));
        console.log('metadataService.hashes', metadataService.hashes)

        getMetadata(group.getName())
        .then(function(groupObj) {
          // .catch(console.log('Error getting metadata for ', group.getName()));
          console.log('groupObj', groupObj)
          // var password = prompt('Enter a password (optional)', '')
          // contentService.import(files, password, (err, mediaObjects) => {
          //   if (err) {
          //     return console.error(err)
          //   }
          //   var meta = mediaObjects.map(mediaObj => mediaObj.data())
          //   metadata.innerHTML = JSON.stringify(meta, null, 2)
          // })
        })
      })
    })
  }
})



function importAndPutContent(contentArray) {
  var contentPromise = new Promise(function(res, rej) {
    contentService.import(contentArray, function(err, trks) {
      if (err) rej(err);
      res(trks);
      // contentService.put((error) => {
      //   if (error) rej(error);
      // });
    });
  });
  return contentPromise;
};


function importAndPutMetadata(metadata) {
  var metadataPromise = new Promise(function(res, rej) {
    metadataService.import(metadata, function(err) {
      if (err) rej(err);
      metadataService.put(function(error) {
        if (error) rej(error);
        // in case you want hashes
        // no real use case or better option for response
        res(metadataService.hashes);
      });
    });
  });
  return metadataPromise;
};

function getMetadata(nameOrHash) {
  var metadataPromise = new Promise(function(res, rej) {
    metadataService.get(nameOrHash, true, 'cid', function(err, obj) {
      if (err) rej(err);
      res(obj);
    });
  });
  return metadataPromise;
};
