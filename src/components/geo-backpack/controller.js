const { asyncRouteErrorHandler } = require('../../utils');
const { Randomizer, FileSystem } = require('../../lib');
const fs = require('fs').promises;
const config = require('../../config');
const GeoBackpackModel = require('./model');
const { DayPartHour } = require('../../lib')

const create = async (req, res) => {
  const { body } = req;
  const io = req.app.get('socketio') 
  
  io.emit('geo', { 
    lat:body.latitude, 
    lng:body.longitude,
    backpackId:req.params.backpackId
  });
  
  let newGeoBackpack = null;
  let now = new Date();
  let hourDay = new Date().getHours();
  let start = new Date(now.getFullYear(),now.getMonth(),now.getDate(),1,0,0);
  let end = new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,59,59);
  const geoBackpack = await GeoBackpackModel.findOne({"backpack":req.params.backpackId ,"createdAt":{$gte:start, $lt:end}})
  if(geoBackpack){
    newGeoBackpack=geoBackpack;

    if( hourDay >= DayPartHour.beginEving && hourDay < DayPartHour.endEving ){
      newGeoBackpack.geoEvening.push({longitude:body.longitude,latitude:body.latitude})
    } else {
      newGeoBackpack.geoMorning.push({longitude:body.longitude,latitude:body.latitude})
    }

  } else {
    let newBody = null;
    if( hourDay >= DayPartHour.beginEving && hourDay < DayPartHour.endEving ){
      let geoEvening=[];
      geoEvening.push({longitude:body.longitude,latitude:body.latitude})
      newBody= {
        geoEvening,
        backpack:req.params.backpackId
      }
    } else {
      let geoMorning=[];
      geoMorning.push({longitude:body.longitude,latitude:body.latitude})
      newBody= {
        geoMorning,
        backpack:req.params.backpackId
      }
    }
    newGeoBackpack = new GeoBackpackModel(newBody);
  }

  await newGeoBackpack.save();
    return res.status(200).json({
      success: true,
      data: { geoBackpack: newGeoBackpack }
  })
}

const read = async (req, res) => {

  let now = new Date();
  let start = new Date(now.getFullYear(),now.getMonth(),now.getDate(),1,0,0);
  let end = new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,59,59);

  const geoBackpacks = await GeoBackpackModel.find({"createdAt":{$gte:start, $lt:end}})
  
  return res.status(200).json({
    success: true,
    data: {geoBackpacks}
  })
}

module.exports = {
  create: asyncRouteErrorHandler(create),
  read: asyncRouteErrorHandler(read),
};