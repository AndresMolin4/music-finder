const formularioMusica = document.getElementById("formularioMusica");

formularioMusica.addEventListener("submit", async function(evento) {

    // Evitar que la página se recargue
    evento.preventDefault();


    // ==========================================
    // OBTENER DATOS DEL FORMULARIO
    // ==========================================

    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const artista = document.getElementById("artista").value;
    const genero = document.getElementById("genero").value;
    const estadoAnimo = document.getElementById("estadoAnimo").value;


    // Contenedor de resultados
    const resultados = document.getElementById("resultados");


    // Mostrar mensaje mientras buscamos
    resultados.innerHTML = "<p>Buscando música...</p>";


    try {

        // ==========================================
        // CONSULTAR NUESTRO SERVIDOR
        // ==========================================

        const respuesta = await fetch(
            `/buscar-musica?artista=${encodeURIComponent(artista)}`
        );

        const datos = await respuesta.json();


        // ==========================================
        // COMPROBAR ERRORES
        // ==========================================

        if (!respuesta.ok || datos.error) {

            resultados.innerHTML = `
                <p>Ocurrió un error: ${datos.error}</p>
            `;

            return;
        }


        // Limpiar resultados anteriores
        resultados.innerHTML = "";

        // ==========================================
        // GUARDAR EN MONGODB
        // ==========================================

        await fetch("/guardar", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                nombre: nombre,

                apellido: apellido,

                artista: artista,

                genero: genero,

                estadoAnimo: estadoAnimo,


                canciones: datos.canciones.map(cancion => ({

                    nombre: cancion.name,

                    artista: cancion.artists[0].name,

                    album: cancion.album.name,

                    imagen: cancion.album.images.length > 0
                        ? cancion.album.images[0].url
                        : "",

                    spotify: cancion.external_urls.spotify

                }))

            })

        });

        
       

        // ==========================================
        // MOSTRAR SALUDO
        // ==========================================

        const saludo = document.createElement("h2");

        saludo.classList.add("saludo");

        saludo.textContent =
            `¡Hola ${nombre}! Encontramos estos resultados para ti.`;

        resultados.appendChild(saludo);


        // ==========================================
        // SECCIÓN DE ARTISTAS
        // ==========================================

        const tituloArtistas = document.createElement("h2");

        tituloArtistas.classList.add("titulo-seccion");

        tituloArtistas.textContent = "Artistas encontrados";

        resultados.appendChild(tituloArtistas);


        const contenedorArtistas = document.createElement("div");

        contenedorArtistas.classList.add("contenedor-tarjetas");

        resultados.appendChild(contenedorArtistas);


        const artistas = datos.artistas;


        if (artistas.length === 0) {

            contenedorArtistas.innerHTML = `
                <p>No encontramos artistas para esta búsqueda.</p>
            `;

        } else {

            artistas.forEach(function(artistaEncontrado) {

                const nombreArtista = artistaEncontrado.name;


                const imagen =
                    artistaEncontrado.images.length > 0
                        ? artistaEncontrado.images[0].url
                        : "https://via.placeholder.com/180";


                const enlaceSpotify =
                    artistaEncontrado.external_urls.spotify;


                const tarjeta =
                    document.createElement("div");

                tarjeta.classList.add("tarjeta-artista");


                tarjeta.innerHTML = `
                    <img 
                        src="${imagen}" 
                        alt="Imagen de ${nombreArtista}"
                    >

                    <h2>${nombreArtista}</h2>

                    <a 
                        href="${enlaceSpotify}" 
                        target="_blank"
                        class="boton-spotify"
                    >
                        Ver en Spotify
                    </a>
                `;


                contenedorArtistas.appendChild(tarjeta);

            });

        }


        // ==========================================
        // SECCIÓN DE CANCIONES
        // ==========================================

        const tituloCanciones = document.createElement("h2");

        tituloCanciones.classList.add("titulo-seccion");

        tituloCanciones.textContent = "Canciones recomendadas";

        resultados.appendChild(tituloCanciones);


        const contenedorCanciones = document.createElement("div");

        contenedorCanciones.classList.add("contenedor-canciones");

        resultados.appendChild(contenedorCanciones);


        const canciones = datos.canciones;


        if (canciones.length === 0) {

            contenedorCanciones.innerHTML = `
                <p>No encontramos canciones para este artista.</p>
            `;

        } else {

            canciones.forEach(function(cancion) {

                const nombreCancion = cancion.name;


                const nombreArtistaCancion =
                    cancion.artists[0].name;


                const album = cancion.album.name;


                const imagenAlbum =
                    cancion.album.images.length > 0
                        ? cancion.album.images[0].url
                        : "https://via.placeholder.com/150";


                const enlaceSpotify =
                    cancion.external_urls.spotify;


                const tarjetaCancion =
                    document.createElement("div");

                tarjetaCancion.classList.add("tarjeta-cancion");


                tarjetaCancion.innerHTML = `
                    <img 
                        src="${imagenAlbum}" 
                        alt="Portada del álbum ${album}"
                    >

                    <div class="informacion-cancion">

                        <h3>${nombreCancion}</h3>

                        <p>${nombreArtistaCancion}</p>

                        <span>${album}</span>

                        <a 
                            href="${enlaceSpotify}"
                            target="_blank"
                            class="boton-spotify"
                        >
                            Escuchar en Spotify
                        </a>

                    </div>
                `;


                contenedorCanciones.appendChild(
                    tarjetaCancion
                );

            });

        }

    } catch (error) {

        console.error("Error:", error);

        resultados.innerHTML = `
            <p>
                No pudimos conectarnos con el servidor.
            </p>
        `;

    }

});