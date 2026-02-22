(async () => {
  try {
    const mod = await import('../tina/__generated__/config.prebuild.jsx');
    const clientMod = await import('../tina/__generated__/client.js');
    const client = clientMod.client || clientMod.default || clientMod;
    if (!mod.exportOutOfDateAsXliff) {
      console.error('exportOutOfDateAsXliff not found in generated module');
      process.exit(2);
    }
    const xlf = await mod.exportOutOfDateAsXliff(client, 'fr');
    // Print first 2000 chars for inspection
    console.log(xlf.slice(0, 2000));
  } catch (e) {
    console.error('error running generated exporter:', e);
    process.exit(1);
  }
})();
