const { asyncRouteErrorHandler } = require('../../utils');
const { Randomizer, FileSystem } = require('../../lib');
const CampaignModel = require('./model');
const ClientModel = require('../client/model');
const DocumentModel = require('../document/model');
const BackpackModel = require('../backpack/model');
const AuthTokenModel = require('../auth-token/model');
const fs = require('fs').promises;
const config = require('../../config');

const read = async (req, res) => {
  const limit = 20;
  let { page, search, sort, filter: filterParam } = req.query;

  let filter = {};
  let options = {};
  let metadata = {};

  if (filterParam) {
    Object.assign(filter, { status: filterParam });
  }

  page = +page;
  if (page) {
    Object.assign(options, { limit, skip: (page - 1) * limit });
    Object.assign(metadata, { currentPage: page });
  }

  if (sort) {
    Object.assign(options, { sort });
  }

  if (search) {
    const isCampaignNumberField = !!parseInt(search);
    const searchValue = new RegExp(search, 'i');

    if (isCampaignNumberField) {
      // Search by campaign number
      Object.assign(filter, { number: searchValue });
    } else {
      // Search by client fields
      const clients = await ClientModel.find({ $or: [
        { name: searchValue },
        { email: searchValue }
      ]});

      const ids = clients.map(client => client._id);
      Object.assign(filter, { client: { $in: ids } });
    }
  }

  const campaigns = await CampaignModel
    .find(filter, null, options)
    .populate('client');

  const count = await CampaignModel.countDocuments(filter);

  Object.assign(metadata, {
    totalCount: count,
    totalPages: Math.ceil(count / limit)
  });

  return res.status(200).json({
    success: true,
    metadata,
    data: { campaigns }
  });
}

const readClient = async (req, res) => {
  const tokenClient= await AuthTokenModel.findOne({ value: req.user.token })
  const findClient = await ClientModel.findOne({_id:tokenClient.client})
  const findCampaigns = await CampaignModel.find({client:findClient}).sort({createdAt:-1})
  return res.status(200).json({
    success: true,
    data: { campaigns:findCampaigns }
  });
}

const create = async (req, res) => {
  const sixDigit = [899999, 100000];
  const number = Randomizer.generateRandomNum(...sixDigit);

  const body = { ...req.body, number };
  
  await BackpackModel.updateMany(
    { _id: { $in: body.backpack }, schedule: { 
    $not: {
      $elemMatch:{
        from:body.date.from,
        to:body.date.to
      }
    }}},
    { $push: {schedule:body.date}},
  )

  await BackpackModel.updateMany(
    { _id: { $in: body.backpack }},
    { $inc: {"schedule.$[elem].slot": 1} },
    { arrayFilters:[{"elem.from":{$lte:body.date.to},"elem.to":{$gte:body.date.from}}]}
  )
  
  let newCampaign = new CampaignModel(body);
  await newCampaign.save();
  req.client.campaigns.amount += 1;
  if(newCampaign.status==='active') req.client.campaigns.activeAmount += 1;
  await req.client.save();
  
  Object.assign(newCampaign, { client: req.client });

  return res.status(200).json({
    success: true,
    data: { campaign: newCampaign }
  });
}

const update = async (req, res) => {
  const { body, campaign, client } = req;
  
  Object.assign(body, {
    MAC: { ...body.MAC, data:campaign.MAC.data},
    GRP: { ...body.GRP, data:campaign.GRP.data},
    Frequency: { ...body.Frequency, data:campaign.Frequency.data},
    OTS: { ...body.OTS, data:campaign.OTS.data}
  })

  if(body.client==campaign.client){
    let clientFind=await ClientModel.findOne({ _id: campaign.client })
    if(body.status!=campaign.status){
      if(body.status==='active') clientFind.campaigns.activeAmount += 1;
      if(body.status==='archived') clientFind.campaigns.activeAmount -= 1;
      await clientFind.save();
    }
  }else {
    let clientOld = await ClientModel.findOne({ _id: campaign.client })
    if(campaign.status==='active') clientOld.campaigns.activeAmount -= 1;
    clientOld.campaigns.amount -= 1;
    await clientOld.save();
    let clientNew = await ClientModel.findOne({ _id: body.client})
    if(body.status==='active') clientNew.campaigns.activeAmount += 1;
    clientNew.campaigns.amount += 1;
    await clientNew.save()
  }

  await BackpackModel.updateMany(
    { _id: { $in: campaign.backpack }},
    { $inc: {"schedule.$[elem].slot": -1} },
    { arrayFilters:[{"elem.from":{$lte:campaign.date.to},"elem.to":{$gte:campaign.date.from}}]}
  )
  await BackpackModel.updateMany(
    { _id: { $in: campaign.backpack }},
    { $pull: {schedule:{slot:0}} },
  )

  await BackpackModel.updateMany(
    { _id: { $in: body.backpack }, schedule: { 
    $not: {
      $elemMatch:{
        from:body.date.from,
        to:body.date.to
      }
    }}},
    { $push: {schedule:body.date}},
  )

  await BackpackModel.updateMany(
    { _id: { $in: body.backpack }},
    { $inc: {"schedule.$[elem].slot": 1} },
    { arrayFilters:[{"elem.from":{$lte:body.date.to},"elem.to":{$gte:body.date.from}}]}
  )

  Object.assign(campaign, body);
  await campaign.save();

  Object.assign(campaign, { client });

  return res.status(200).json({
    success: true,
    data: { campaign }
  });
}

// @TODO: Free backpacks slots from this campaign
const deleteCampaign = async (req, res) => {
  const { campaign } = req;
  const clientFind=await ClientModel.findOne({ _id: campaign.client })
  if(campaign.status==='active') clientFind.campaigns.activeAmount -= 1;
  clientFind.campaigns.amount -= 1;
  await clientFind.save();
  await BackpackModel.updateMany(
    { _id: { $in: campaign.backpack }},
    { $inc: {"schedule.$[elem].slot": -1} },
    { arrayFilters:[{"elem.from":{$lte:campaign.date.to},"elem.to":{$gte:campaign.date.from}}]}
  )

  await BackpackModel.updateMany(
    { _id: { $in: campaign.backpack }},
    { $pull: {schedule:{slot:0}} },
  )

  await CampaignModel.deleteOne({ _id: campaign._id });

  const documents = await DocumentModel.find({ campaign: campaign._id });
  const ids = documents.map(doc => doc._id);
  await DocumentModel.deleteMany({ _id: { $in: ids } });

  await FileSystem.deleteMany(
    'docs',
    documents.map(doc => `${doc._id}.${doc.ext}`)
  )

  return res.status(200).json({ success: true });
}

module.exports = {
  create: asyncRouteErrorHandler(create),
  read: asyncRouteErrorHandler(read),
  readClient: asyncRouteErrorHandler(readClient),
  update: asyncRouteErrorHandler(update),
  deleteCampaign: asyncRouteErrorHandler(deleteCampaign)
};
