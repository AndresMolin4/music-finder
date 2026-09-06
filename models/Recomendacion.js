const mongoose = require("mongoose");


const recomendacionSchema = new mongoose.Schema({

    nombre:{
        type:String,
        required:true
    },

    apellido:{
        type:String,
        required:true
    },

    artista:{
        type:String,
        required:true
    },

    genero:String,

    estadoAnimo:String,


    canciones:[
        {
            nombre:String,
            artista:String,
            album:String,
            imagen:String,
            spotify:String
        }
    ],


    fecha:{
        type:Date,
        default:Date.now
    }

});


module.exports = mongoose.model(
    "Recomendacion",
    recomendacionSchema
);