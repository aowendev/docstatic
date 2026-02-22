const xliff = require('../src/utils/xliff');
const clientModule = require('../tina/__generated__/client');
const client = clientModule.client || clientModule.default || clientModule;
(async () => {
  try {
    const xlf = await xliff.exportOutOfDateAsXliff(client, 'fr');
    console.log(xlf.slice(0, 2000));
  } catch (e) {
    console.error('error running src exporter:', e);
    process.exit(1);
  }
})();
