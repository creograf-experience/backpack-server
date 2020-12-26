const { asyncRouteErrorHandler } = require('../../utils');
const DocumentModel = require('./model');
const config = require('../../config');
const { FileSystem } = require('../../lib');

const read = async (req, res) => {
  const documents = await DocumentModel.find({ campaign: req.campaign._id });

  return res.status(200).json({
    success: true,
    data: { documents }
  });
}

const readClient = async (req, res) => {
  const documents = await DocumentModel.find({ campaign: req.campaign._id });

  return res.status(200).json({
    success: true,
    data: { documents }
  });
}

const create = async (req, res) => {
  const { campaign } = req;
  let documents = [];

  for (const file of req.files) {
    const newDoc = new DocumentModel({
      campaign: req.body.campaign,
      friendlyName: file.originalname,
      ext: file.originalname.split('.').pop()
    });

    const fileName = `${newDoc._id}.${newDoc.ext}`;

    await newDoc.save();
    await FileSystem.createOne('docs', { name: fileName, data: file.buffer });

    documents.push(newDoc);
  }

  campaign.documentCount += documents.length;
  await campaign.save();

  return res.status(200).json({
    success: true,
    data: { documents }
  });
}

const deleteDocument = async (req, res) => {
  const { documents, campaign } = req;
  const ids = documents.map(doc => doc._id);

  await DocumentModel.deleteMany({ _id: { $in: ids } });
  campaign.documentCount -= documents.length;
  await campaign.save();

  await FileSystem.deleteMany(
    'docs',
    documents.map(doc => `${doc._id}.${doc.ext}`)
  );

  return res.status(200).json({ success: true });
}

const download = async (req, res) => {
  const { document } = req;

  const filepath = `${config.documentsFolderPath}/${document._id}.${document.ext}`;
  res.status(200).download(filepath, document.friendlyName);
}

module.exports = {
  read: asyncRouteErrorHandler(read),
  readClient: asyncRouteErrorHandler(readClient),
  create: asyncRouteErrorHandler(create),
  deleteDocument: asyncRouteErrorHandler(deleteDocument),
  download: asyncRouteErrorHandler(download)
};
