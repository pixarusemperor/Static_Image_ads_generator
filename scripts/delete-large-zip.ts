import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, '../Ad_bible /eXAMPLE OF ADS WITH AN WITHOUT IMAGE .zip');

try {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log('Successfully deleted large zip archive:', filePath);
  } else {
    console.log('File does not exist:', filePath);
  }
} catch (error) {
  console.error('Error deleting file:', error);
  process.exit(1);
}
