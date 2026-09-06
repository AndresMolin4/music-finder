const mongoose = require("mongoose");

const conectarBD = async () => {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log("MongoDB conectado correctamente");

    } catch(error) {
        console.log("Error MongoDB:", error);
    }
};

module.exports = conectarBD;