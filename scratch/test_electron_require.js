try {
  console.log('Loading dist-electron/main.js...');
  require('../dist-electron/main.js');
  console.log('main.js loaded without top-level exception!');
} catch (err) {
  console.error('🔥 CAUGHT ERROR IN MAIN.JS:', err);
}
