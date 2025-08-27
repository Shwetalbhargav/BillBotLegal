import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directory = path.join(__dirname, 'src');

function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex: matches import ... from '../...' or "../../..."
  const updatedContent = content.replace(
    /from\s+['"](\.{1,2}\/)+([^'"]+)['"]/g,
    (match, p1, p2) => {
      return `from '@/` + p2 + `'`;
    }
  );

  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated imports in: ${filePath}`);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (/\.(js|jsx)$/.test(file)) {
      updateImportsInFile(fullPath);
    }
  });
}

walkDir(directory);
console.log('✅ All relative imports updated to @/ alias.');
