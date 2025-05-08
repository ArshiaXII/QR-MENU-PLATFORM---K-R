const db = require('./db');
const User = require('../models/user');
const Category = require('../models/category');
const Product = require('../models/product');
const Template = require('../models/template');
const Restaurant = require('../models/restaurant');

const initDatabase = async () => {
    try {
        // Create tables
        await Restaurant.createTable();
        await User.createTable();
        await Category.createTable();
        await Product.createTable();
        await Template.createTable();

        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

initDatabase();

module.exports = { initDatabase }; 