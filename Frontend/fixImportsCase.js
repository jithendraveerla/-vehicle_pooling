import fs from 'fs';
import path from 'path';

const walk = (dir, callback) => {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, callback);
    } else if (filepath.endsWith('.js') || filepath.endsWith('.jsx') || filepath.endsWith('.ts') || filepath.endsWith('.tsx')) {
      callback(filepath);
    }
  });
};

const fixImports = filepath => {
  const content = fs.readFileSync(filepath, 'utf8');
  const fixedContent = content.replace(/from\s+['"]([^'"]+)['"]/g, (match, importPath) => {
    const absPath = path.resolve(path.dirname(filepath), importPath);
    try {
      const actual = fs.realpathSync(absPath);
      const relativePath = path.relative(path.dirname(filepath), actual).replace(/\\/g, '/');
      return `from './${relativePath}'`;
    } catch (err) {
      return match;
    }
  });

  fs.writeFileSync(filepath, fixedContent, 'utf8');
};

walk('./src', fixImports);
console.log('✅ Import paths normalized.');
