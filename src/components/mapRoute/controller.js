const { asyncRouteErrorHandler } = require('../../utils');
const MapRouteModel = require('./model');
const BackpackMode = require('../backpack/model');
const config = require('../../config');
const { FileSystem } = require('../../lib');
const xmlReader = require('read-xml');
const convert = require('xml-js');
const fs = require('fs');
const { Validate, DayPartHour } = require('../../lib');

const create = async (req, res) => {
  let finallyRoute=[];
  for (const file of req.files) {
    await FileSystem.createOne('route', {name: file.originalname, data: file.buffer});
    var newAr = [];
    xmlReader.readXML(fs.readFileSync(`./uploads/mapRoute/${file.originalname}`), function(err,data){
      if (err) {
        console.error(err);
      }
      var xml = data.content;
      var result = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}));
      if(Array.isArray(result.kml.Document.Placemark)){
        let findRoute = result.kml.Document.Placemark.find(el=>el.MultiGeometry);
        let line = findRoute.MultiGeometry.LineString.coordinates._text;
        let coordinates = line.split("\r\n");
        
        let lineSplit = coordinates.map(el=>el.split(','))
        lineSplit.forEach(element => {
          newAr.push({lat:Number(element[1]),lng:Number(element[0])})
        });
        
      }else {
        let line = result.kml.Document.Placemark.MultiGeometry.LineString.coordinates._text;
        let coordinates = line.split("\r\n");
        
        let lineSplit = coordinates.map(el=>el.split(','))
        lineSplit.forEach(element => {
          newAr.push({lat:Number(element[1]),lng:Number(element[0])})
        });
    
      }
    });
 
    const oldRoute = await MapRouteModel.findOne({"friendlyName": file.originalname});
    if(oldRoute){
      await MapRouteModel.deleteOne(oldRoute);
    } 
    const newRoute = new MapRouteModel({
      route: newAr,
      friendlyName: file.originalname,
      backpackIdFile: file.originalname.split('_')[0],
      ext: file.originalname.split('.').pop(),
      dayWeek: file.originalname.split('_')[1],
      dayPart: file.originalname.split('_')[2].split('.')[0],
      backpack: file.backpack
    });
    await newRoute.save();
    finallyRoute.push(newRoute)
  }
  
  return res.status(200).json({
    success: true,
    data: { mapRoute: finallyRoute }
  });
}

const read = async (req, res) => {
  let { backpack, filter } =req.query;
  let backpackParse = [];
  let mapRoutes = [];
  if(filter){
    mapRoutes = await MapRouteModel
      .find()
      .populate('backpack')
  } else {
    if(backpack){
      backpackParse=JSON.parse(backpack);
    }
    let now = new Date();
    const dayWeek=Validate.getWeekDay(now)
    if(now.getHours()>=DayPartHour.beginEving && now.getHours()<DayPartHour.endEving) {
      mapRoutes = await MapRouteModel
      .find({backpack:{ $in: backpackParse }, dayWeek, dayPart:'2'})
      .populate('backpack')
    } else {
      mapRoutes = await MapRouteModel
      .find({backpack:{ $in: backpackParse },dayWeek, dayPart:'1'})
      .populate('backpack')
    }
  }

  return res.status(200).json({
    success: true,
    data: { mapRoutes }
  });
}

module.exports = {
  read: asyncRouteErrorHandler(read),
  create: asyncRouteErrorHandler(create),
};