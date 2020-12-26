const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../', '.env') });
process.env.NODE_ENV = 'production';

const jwt = require('jsonwebtoken');
const config = require('../src/config');
const CampaignModel = require('../src/components/campaign/model');
const mongoose = require('mongoose');
const csv = require('csvtojson');
const fs = require('fs');
const oldPath=`/var/www/csv`;
const newPath=`/var/www/csv-done`;

(async function() {
  let result =[]
  const directoryPath = path.join(oldPath);
  fs.readdir(directoryPath, async function (err, files) {
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    } 
    for(const file of files){
      var oldPathFile = oldPath + '/' + file;
      var newPathFile = newPath + '/' + file;
      const jsonArray=await csv().fromFile(oldPathFile);
      result.push(jsonArray)
      fs.rename(oldPathFile, newPathFile, function (err) {
        if (err) throw err
      });
    }
    const flatResult = result.flat();
    await mongoose.connect(config.db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });
    for(const item of flatResult){
      const a = await CampaignModel.findOneAndUpdate(
        { number:item.number_campaign },
        { $set: {
            "MAC.data":item.mac_unique,
            "OTS.data":item.ots,
            "GRP.data":item.grp,
            "Frequency.data":item.frequency,
            "expectedCoverage":item.expected_coverage,
            "achievedCoverage":item.achieved_coverage
          }
        }
      );
    }
    await mongoose.connection.close();
  })
}());