const { Errors, asyncRouteErrorHandler } = require('../../../utils');
const DocumentModel = require('../model');

const findDocuments = async (req, res, next) => {
  const { documentIds } = req.body;

  if (!documentIds || !documentIds.length) {
    throw new Errors.NotFound('Документа не существует');
  }

  let documents = [];
  for (const id of documentIds) {
    const existingDocument = await DocumentModel.findById(id);

    if (!existingDocument) {
      throw new Errors.NotFound('Документа не существует');
    }

    documents.push(existingDocument);
  }

  req.documents = documents;
  next();
}

module.exports = asyncRouteErrorHandler(findDocuments);
