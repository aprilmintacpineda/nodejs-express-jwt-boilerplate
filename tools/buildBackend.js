/** @format */

const terser = require('terser');
const fs = require('fs').promises;
const path = require('path');

const root = process.cwd();
// the following will not be included in the build
const ignore = ['.DS_Store', '.env', '.env.example', 'jwt.key', 'jwt.pub', 'public'];

async function getAllFiles (dir) {
  const files = await fs.readdir(path.join(root, dir));

  return [].concat(
    await Promise.all(
      files
        .filter(file => !ignore.includes(file))
        .map(async file => {
          const target = path.join(dir, file);
          const stat = await fs.stat(target);
          if (stat.isDirectory()) return await getAllFiles(target);
          return target;
        })
    )
  );
}

function getFileContents (files) {
  return Promise.all(
    files.map(async file => ({
      filePath: file,
      contents: await fs.readFile(file, 'utf-8')
    }))
  );
}

(async () => {
  const sourceDir = 'src';
  let files = await getAllFiles(sourceDir);
  files = await getFileContents(files.flat(Infinity));

  const jsFileRegex = /.\.js$/;
  const cutLen = sourceDir.length;
  const outDir = 'build/';

  const terserOptions = {
    compress: {
      drop_console: !process.env.IS_SANDBOX
    },
    toplevel: true,
    ecma: '2018'
  };

  console.log(`Building ${files.length} file(s).`); // eslint-disable-line

  await Promise.all(
    files.map(async ({ filePath, contents }) => {
      let code = contents;
      if (jsFileRegex.test(filePath)) code = terser.minify(contents, terserOptions).code;
      const targetPath = path.join(root, outDir, filePath.substr(cutLen));
      const dirname = path.dirname(targetPath);

      try {
        await fs.access(dirname);
      } catch (e) {
        await fs.mkdir(dirname, { recursive: true });
      }

      await fs.writeFile(targetPath, code);
    })
  );
})();
