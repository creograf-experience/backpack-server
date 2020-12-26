const { Errors, asyncRouteErrorHandler } = require('../../../utils');
const DocumentModel = require('../model');

const findDocument = async (req, res, next) => {
  const { documentId } = req.params;

  const existingDocument = await DocumentModel.findById(documentId);

  if (!existingDocument) {
    throw new Errors.NotFound('Документа не существует');
  }

  req.document = existingDocument;
  next();
}

module.exports = asyncRouteErrorHandler(findDocument);
