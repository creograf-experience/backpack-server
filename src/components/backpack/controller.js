const { asyncRouteErrorHandler } = require('../../utils');
const { Randomizer, FileSystem } = require('../../lib');
const fs = require('fs').promises;
const config = require('../../config');
const BackpackModel = require('./model');

const read = async (req, res) => {
  const limit = 20;
  let { page, sort } = req.query;

  let filter = {};
  let options = {};
  let metadata = {};

  page = +page;
  if (page) {
    Object.assign(options, { limit, skip: (page-1) * limit });
    Object.assign(metadata, { currentPage: page });
  }

  if(sort) {
    Object.assign(options, { sort });
  }

  const backpacks = await BackpackModel
    .find(filter, null, options)
  
  const count = await BackpackModel.countDocuments(filter);
  
  Object.assign(metadata, {
    totalPages: Math.ceil(count / limit)
  });

  return res.status(200).json({
    success: true,
    metadata,
    data: {backpacks}
  })
}

const create = async (req, res) => {
  const body = req.body;

  let newBackpack = new BackpackModel(body);

  await newBackpack.save();

  return res.status(200).json({
    success: true,
    data: { backpack: newBackpack }
  })
}

const update = async (req, res) => {
  const { body, backpack } = req;
  
  Object.assign(backpack, body);
  await backpack.save();

  return res.status(200).json({
    success: true,
    data: { backpack }
  });
}

const deleteBackpack = async (req, res) => {
  const { backpack } = req;
  
  await BackpackModel.deleteOne({ _id: backpack._id });

  return res.status(200).json({ success: true });
}

module.exports = {
  create: asyncRouteErrorHandler(create),
  read: asyncRouteErrorHandler(read),
  update: asyncRouteErrorHandler(update),
  deleteBackpack: asyncRouteErrorHandler(deleteBackpack)
};