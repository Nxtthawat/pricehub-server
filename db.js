import mysql from 'mysql';
import config from './config.js';

const priceHubDB = mysql.createPool(config.priceHubDB);

export default priceHubDB;