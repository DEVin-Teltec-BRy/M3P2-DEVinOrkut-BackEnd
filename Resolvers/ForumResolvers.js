const { Forum } = require('../Db');
const { DateScalar } = require('./Scalar');
var validator = require('validator');

const forumResolvers = {
    Date: DateScalar,

    Query: {},

    Mutation: {},
};

module.exports = forumResolvers;
