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
        deleteComent: async (
            _,
            { forumId, comentId },
            { dataSources: { coments, foruns, communities }, userId },
        ) => {
            try {
                if (!userId) {
                    throw new Error(
                        'Você precisa estar logado para criar um fórum.',
                    );
                }
                
                /// remover a referencia do comentário da coleção forum
                const foundForum = await foruns.findOneById(forumId);

                if(!foundForum)
                    throw new Error('Forum não encontrado.');
                
                const comentIndex = foundForum.coments.findIndex(
                    requestedId => requestedId.toString() === comentId.toString(),
                );
                
                if(comentIndex == null)
                    throw new Error('Referência de Comentário não encontrado.');
               
                const comentDeleted = foundForum.coments[comentIndex];
                foundForum.coments.splice(comentIndex,1);

                await foundForum.save();
                
                /// deletar o comentário da coleção comentários
               
                const excluedComent = await coments.delete({                    
                    _id: comentId                   
                });                                           
                return comentDeleted;
                
            } catch (error) {
                throw new Error(error);
            }
        },

    },
};

module.exports = comentResolvers;

const { MongoClient } = require('mongodb');
