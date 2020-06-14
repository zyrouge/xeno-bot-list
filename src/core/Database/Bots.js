module.exports = (sequelize, Sequelize) => (
    sequelize.define('Bots', {
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
        shortDesc: {
            type: Sequelize.STRING,
            allowNull: false
        },
        longDesc: {
            type: Sequelize.STRING,
            allowNull: false
        },
        botServer: {
            type: Sequelize.JSON
        },
        botWebsite: {
            type: Sequelize.JSON
        },
        customInvite: {
            type: Sequelize.JSON
        },
        botTags: {
            type: Sequelize.JSON,
            defaultValue: [],
            allowNull: false
        },

        /* Others */
        inTesting: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        isApproved: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        inMain: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },

        /* Misc */
        testedBy: {
            type: Sequelize.STRING
        },
        submittedOn: {
            type: Sequelize.STRING,
            allowNull: false
        },
        approvedOn: {
            type: Sequelize.STRING
        },
        totalUpvotes: {
            type: Sequelize.STRING,
            defaultValue: "0",
            allowNull: false
        },
        guildsCount: {
            type: Sequelize.STRING,
            defaultValue: "0",
            allowNull: false
        },
        verifiedBot: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    })
);