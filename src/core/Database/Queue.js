module.exports = (sequelize, Sequelize) => (
    sequelize.define('Queue', {
        botID: {
            type: Sequelize.STRING,
            unique: 'Bots',
            allowNull: false
        },
        prefix: {
            type: Sequelize.STRING,
            allowNull: false
        },
        ownerID: {
            type: Sequelize.STRING,
            allowNull: false
        },
        testing: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    })
);