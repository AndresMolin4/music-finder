const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
    path: path.join(__dirname, ".env")
});

console.log(process.env.MONGODB_URI);


const conectarBD = require("./database");

conectarBD();


const aplicacion = express();
const puerto = process.env.PORT || 3000;


aplicacion.use(express.json());
aplicacion.use(express.static("."));


const Recomendacion = require("./models/Recomendacion");


// ==========================================
// GUARDAR INFORMACIÓN EN MONGODB
// ==========================================

aplicacion.post("/guardar", async (req, res) => {

    try {

        const nueva = new Recomendacion(req.body);

        await nueva.save();

        res.json({
            mensaje: "Datos guardados correctamente"
        });


    } catch(error) {

        console.error(error);

        res.status(500).json({
            error: "No se pudo guardar la información"
        });

    }

});


// ==========================================
// OBTENER TOKEN DE SPOTIFY
// ==========================================

async function obtenerTokenSpotify() {

    const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();


    if (!clientId || !clientSecret) {

        throw new Error(
            "No se encontraron las credenciales de Spotify en el archivo .env"
        );

    }


    const respuesta = await fetch(
        "https://accounts.spotify.com/api/token",
        {

            method: "POST",

            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },

            body: new URLSearchParams({

                grant_type: "client_credentials",

                client_id: clientId,

                client_secret: clientSecret

            })

        }
    );


    const datos = await respuesta.json();


    if (!respuesta.ok) {

        throw new Error(
            datos.error_description ||
            datos.error ||
            "Error desconocido de Spotify"
        );

    }


    return datos.access_token;

}



// ==========================================
// BUSCAR MÚSICA EN SPOTIFY
// ==========================================

aplicacion.get("/buscar-musica", async(req,res)=>{


    try {


        const artista = req.query.artista;


        if(!artista){

            return res.status(400).json({

                error:"Debes escribir un artista"

            });

        }



        const token = await obtenerTokenSpotify();



        // BUSCAR ARTISTAS

        const respuestaArtistas = await fetch(

            `https://api.spotify.com/v1/search?q=${encodeURIComponent(artista)}&type=artist&limit=5`,

            {

                headers:{

                    Authorization:`Bearer ${token}`

                }

            }

        );


        const datosArtistas = await respuestaArtistas.json();



        if(!respuestaArtistas.ok){

            throw new Error(
                datosArtistas.error?.message ||
                "Error buscando artistas"
            );

        }



        const artistas = 
        datosArtistas.artists.items.slice(0,3);





        // BUSCAR CANCIONES


        const respuestaCanciones = await fetch(

            `https://api.spotify.com/v1/search?q=${encodeURIComponent(`artist:${artista}`)}&type=track&limit=5`,

            {

                headers:{

                    Authorization:`Bearer ${token}`

                }

            }

        );



        const datosCanciones = await respuestaCanciones.json();



        if(!respuestaCanciones.ok){

            throw new Error(
                datosCanciones.error?.message ||
                "Error buscando canciones"
            );

        }



        res.json({

            artistas: artistas,

            canciones: datosCanciones.tracks.items

        });



    } catch(error){


        console.error("ERROR:",error.message);


        res.status(500).json({

            error:error.message

        });


    }


});




// ==========================================
// INICIAR SERVIDOR
// ==========================================


aplicacion.listen(puerto,()=>{


    console.log(

        `Servidor ejecutándose en http://localhost:${puerto}`

    );


});