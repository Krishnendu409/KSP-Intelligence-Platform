const app = require('./dist/index.js');
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`[Local Server] KSP API Backend is running on http://localhost:${PORT}`);
});
