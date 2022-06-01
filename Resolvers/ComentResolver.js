const { Forum, Community, Coments } = require('../Db');
const { DateScalar } = require('./Scalar');
var validator = require('validator');

const comentResolvers = {
    Date: DateScalar,

    Query: {},

    Mutation: {
        createComent: async (
            _,
            { input },
            { dataSources: { coments }, userId },
        ) => {
            try {
                if (!userId) {
                    throw new Error(
                        'Você precisa estar logado para criar um fórum.',
                    );
                }

                const newComent = await coments.create({                    
                    description: input.description,
                    author: userId, 
                    forum: input.forum                   
                });

                await Forum.findOneAndUpdate(
                    { _id: input.forum },
                    { $push: { coments: newComent._id } },                    
                );
                
               
                return newComent;
            } catch (error) {
                throw new Error(error);
            }
        },
    },
};

module.exports = comentResolvers;

const { MongoClient } = require('mongodb');
