'use strict'

// const ContentService = require('../src/content-service/browser')
const ContentServiceBrowser = require('../lib/constellate.min').ContentServiceBrowser
const endpoint = require('../test/fixtures/endpoints').ipfs

const contentService = new ContentServiceBrowser({
  name: 'ipfs',
  path: endpoint
})

const fileInput = document.querySelector('input[type="file"]')
const importBtn = document.getElementById('import-btn')
const metadata = document.getElementById('metadata')

importBtn.addEventListener('click', () => {
  const files = Array.from(fileInput.files)
  if (files.length) {
    importAndPutContent(files)
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
  console.log('contentArray', contentArray)
  const contentPromise = new Promise((res, rej) => {
    contentService.import(contentArray, (err, trks) => {
      if (err) rej(err);
      contentService.put((error) => {
        if (error) rej(error);
        res(trks);
      });
    });
  });
  return contentPromise;
};

