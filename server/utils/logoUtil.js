const fs = require('fs');
const path = require('path');

function getBase64Logo() {
    try {
        const logoPath = path.join(__dirname, '../../src/assets/amwoodo-logo.png');
        const logoBuffer = fs.readFileSync(logoPath);
        return `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (error) {
        console.error('Error reading logo:', error);
        return null;
    }
}

module.exports = { getBase64Logo };