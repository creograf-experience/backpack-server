const config = require('../config');

const datePattern = date =>
  date &&
  /(\d{4})-(\d{2})-(\d{2})/.test(date);

const emailPattern = email =>
  email &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const client = (name, email) => name && email;

const adminCredentials = (login, password) =>
  login &&
  password &&
  login === config.admin.login &&
  password === config.admin.password;

const clientCredentials = (email, password) =>
  email &&
  emailPattern(email) &&
  password &&
  password.trim().length

const imageFileFormat = file => {
  const allowedExts = ['jpg', 'png', 'jpeg', 'PNG'];
  const ext = file.originalname.split('.').pop();

  return allowedExts.includes(ext);
}

const documentFileFormat = file => {
  const allowedExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx','jpg', 'png', 'jpeg','PNG','PDF'];
  const ext = file.originalname.split('.').pop();

  return allowedExts.includes(ext);
}

const campaign = (name, client, date) =>
  name &&
  name.trim().length &&
  client &&
  client.trim().length &&
  date &&
  date.to &&
  date.from &&
  datePattern(date.to) &&
  datePattern(date.from)

const backpack = (number,description,idBackpack) =>  
  number &&
  description &&
  description.trim().length &&
  idBackpack &&
  idBackpack.trim().length

const routeFileFormat = file => {
  const allowedExts = ['kml'];
  const ext = file.originalname.split('.').pop();

  return allowedExts.includes(ext);
}

const getWeekDay = date => {
  let days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  return days[date.getDay()];
} 

module.exports = {
  emailPattern,
  datePattern,
  adminCredentials,
  clientCredentials,
  client,
  imageFileFormat,
  documentFileFormat,
  campaign,
  backpack,
  routeFileFormat,
  getWeekDay
};
