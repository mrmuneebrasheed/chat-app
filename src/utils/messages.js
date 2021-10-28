const moment = require("moment");
module.exports = {
    generateMessages: (username, text) => {
        return {
            username,
            text,
            createdAt: moment(new Date().getTime()).format("h:mm a"),
        };
    },
    generateLocationMessages: (username, url) => {
        return {
            username,
            url,
            createdAt: moment(new Date().getTime()).format("h:mm a"),
        };
    },
};
