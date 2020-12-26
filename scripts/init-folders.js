const fs = require('fs').promises;
const fsSync = require('fs');
const { rootPath } = require('../src/config');

(async function() {
    await createEnvFile();

    await createPublicFolder();
    await createUploadsFolder();

    await createDocumentsFolder();
    await createImagesFolder();
}());

async function createEnvFile() {
  try {
    const envFilePath = `${rootPath}/.env`;
    const envExampleFilePath = `${rootPath}/env.example`;

    if (fsSync.existsSync(envFilePath)) {
      return console.log('.env file already exist, skipping...');
    }

    const envFileContent = await fs.readFile(envExampleFilePath);
    await fs.writeFile(envFilePath, envFileContent);
  } catch (err) {
    console.error(err);
  }
}

async function createPublicFolder() {
  try {
    const publicFolder = `${rootPath}/public`;

    if (fsSync.existsSync(publicFolder)) {
      return console.log('Public folder already exist, skipping...');
    }

    await fs.mkdir(publicFolder);
  } catch (err) {
    console.error(err);
  }
}

async function createUploadsFolder() {
  try {
    const uploadsFolder = `${rootPath}/uploads`;

    if (fsSync.existsSync(uploadsFolder)) {
      return console.log('Uploads folder already exist, skipping...');
    }

    await fs.mkdir(uploadsFolder);
  } catch (err) {
    console.error(err);
  }
}

async function createDocumentsFolder() {
  try {
    const documentsFolder = `${rootPath}/uploads/documents`;

    if (fsSync.existsSync(documentsFolder)) {
      return console.log('Documents folder already exist, skipping...');
    }

    await fs.mkdir(documentsFolder);
  } catch (err) {
    console.error(err);
  }
}

async function createImagesFolder() {
  try {
    const imagesFolder = `${rootPath}/public/images`;

    if (fsSync.existsSync(imagesFolder)) {
      return console.log('Images folder already exist, skipping...');
    }

    await fs.mkdir(imagesFolder);
  } catch (err) {
    console.error(err);
  }
}
