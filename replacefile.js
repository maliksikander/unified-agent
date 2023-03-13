const replace = require('replace-in-file');
const options = {
  files: 'dist/main*.js',
  from: "register(\"/firebase-messaging-sw.js\",{scope:\"/firebase-cloud-messaging-push-scope\"})",
  to: "register(\"firebase-messaging-sw.js\",{scope:\"firebase-cloud-messaging-push-scope\"})",
  allowEmptyPaths: false,
};

try {
  replace.sync(options);
  console.log('Firebase service worker path fixed!');
} catch (error) {
  console.error('Error occurred:', error);
}