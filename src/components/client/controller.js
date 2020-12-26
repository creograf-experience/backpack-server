const { asyncRouteErrorHandler } = require('../../utils');
const ClientModel = require('./model');
const AuthTokenModel = require('../auth-token/model');
const ClientService = require('./service');
const config = require('../../config');
const jwt = require('jsonwebtoken');
const {
  EmailSender,
  FileSystem,
  Randomizer,
  PasswordEncrypter
} = require('../../lib');

const create = async (req, res) => {
  let { body, files } = req;

  Object.assign(body, { agency: { name: body.agencyName } });

  if (files && Object.keys(files).length) {
    const { logo, agencyLogo } = await ClientService.appendFiles(files);
    Object.assign(body, {
      agency: { ...body.agency, logo: agencyLogo },
      logo
    });
  }

  const newClient = new ClientModel(body);
  await newClient.save();

  return res.status(200).json({
    success: true,
    data: { client: newClient }
  });
}

const block = async (req, res) => {
  let { client } = req;

  client.isBlocked = true;
  await client.save();
  await AuthTokenModel.deleteMany({ client: client._id });

  return res.status(200).json({ success: true });
}

const deleteClient = async (req, res) => {
  let { client } = req;

  client.isDeleted = true;
  await client.save();
  await AuthTokenModel.deleteMany({ client: client._id });

  return res.status(200).json({ success: true });
}

const sendAccess = async (req, res) => {
  let { client } = req;

  const password = Randomizer.getRandomString();
  client.password = await PasswordEncrypter.encrypt(password);

  await client.save();
  await EmailSender.sendPasswordMessage(client.email, { password });

  return res.status(200).json({ success: true });
}

const update = async (req, res) => {
  let { body, files, client } = req;
  let prevFiles = [];

  if (files && Object.keys(files).length) {
    Object.assign(body, { agency: { name: body.agencyName } });
    const { logo, agencyLogo } = await ClientService.appendFiles(files);
    Object.assign(body, {
      agency: { ...body.agency, logo: agencyLogo },
      logo
    });

    if (logo && client.logo) prevFiles.push(client.logo);
    if (agencyLogo && client.agency.logo) prevFiles.push(client.agency.logo);
    if (!logo) Object.assign( body, { logo: client.logo })
    if (!agencyLogo) Object.assign( body, { agency: { ...body.agency, logo: client.agency.logo }})
  } else {
    Object.assign(body, { agency: { name: body.agencyName, logo: client.agency.logo } });
  }

  Object.assign(client, body);
  await client.save();

  if (prevFiles.length) await FileSystem.deleteMany('images', prevFiles);

  return res.status(200).json({
    success: true,
    data: { client }
  });
}

const read = async (req, res) => {
  const limit = 20;
  let { page, search, sort } = req.query;

  let filter = { isDeleted: false };
  let options = {};
  let metadata = {};

  page = +page;

  if (page) {
    Object.assign(options, { limit, skip: (page - 1) * limit });
    Object.assign(metadata, { currentPage: page });
  }

  if (sort) {
    Object.assign(options, { sort });
  }

  if (search) {
    const regexp = new RegExp(search, 'i');
    Object.assign(filter, {
      $or: [
        { name: regexp },
        { email: regexp },
        { legalEntity: regexp },
        { phone: regexp },
        { contactName: regexp }
      ]
    });
  }

  const clients = await ClientModel.find(filter, null, options);
  const count = await ClientModel.countDocuments(filter);

  Object.assign(metadata, {
    totalCount: count,
    totalPages: Math.ceil(count / limit)
  });

  return res.status(200).json({
    success: true,
    metadata,
    data: { clients }
  });
}

const readClient = async (req, res) => {
  const tokenClient= await AuthTokenModel.findOne({ value: req.user.token })
  const findClient = await ClientModel.findOne({_id:tokenClient.client})
  
  return res.status(200).json({
    success: true,
    data: { client:findClient }
  });
}

const login = async (req, res) => {
  const { client } = req;

  const payload = {
    _id: client._id,
    email: client.email,
    role: config.roles.client
  };

  jwt.sign(
    payload,
    config.jwtSecret,
    { expiresIn: '7 days' },
    async (err, token) => {
      if (err) throw new Error(err.message);

      const newAuthToken = new AuthTokenModel({
        value: token,
        client: client._id
      });
      await newAuthToken.save();

      return res.status(200).json({
        success: true,
        data: { token }
      });
    }
  );
}

module.exports = {
  create: asyncRouteErrorHandler(create),
  block: asyncRouteErrorHandler(block),
  deleteClient: asyncRouteErrorHandler(deleteClient),
  sendAccess: asyncRouteErrorHandler(sendAccess),
  update: asyncRouteErrorHandler(update),
  read: asyncRouteErrorHandler(read),
  readClient: asyncRouteErrorHandler(readClient),
  login
};
