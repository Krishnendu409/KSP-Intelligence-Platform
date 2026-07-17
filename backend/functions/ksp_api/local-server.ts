const express = require('express');
const kspApp = require('./src/index.ts');

const app = express();
const PORT = 3000;

// Mount the catalyst app under the path Vite proxy expects
app.use('/server/ksp_api', kspApp);

// Also mount it at root just in case
app.use('/', kspApp);

app.listen(PORT, () => {
    console.log(`[Local Server] KSP API Backend is running on http://localhost:${PORT}`);
    console.log(`[Local Server] Mapped to /server/ksp_api for Vite proxy`);
});
