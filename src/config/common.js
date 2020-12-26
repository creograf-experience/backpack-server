const path = require('path');

const rootPath = path.resolve(process.cwd());
const imagesFolderPath = `${rootPath}/public/images`;
const documentsFolderPath = `${rootPath}/uploads/documents`;
const mapRouteFolderPath = `${rootPath}/uploads/mapRoute`;

module.exports = {
  rootPath,
  imagesFolderPath,
  documentsFolderPath,
  mapRouteFolderPath,
  backpackSlotsNum: 8,
  roles: {
    admin: 'admin',
    client: 'client'
  }
};
