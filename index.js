const TelegramBot = require('node-telegram-bot-api');
var Database = require('./Database')
var CardInfo = require('./CardInfo')

//Para juntar imágenes
const mergeImg = require('merge-img')
var Jimp = require('jimp');

//Para que funcione el DeckDecoder
module.exports = {
  DeckEncoder: require('./DeckDecoder/DeckEncoder'),
  CardInDeck: require('./DeckDecoder/CardInDeck'),
  Faction: require('./DeckDecoder/Faction')
}
const { DeckEncoder } = require('runeterra')

//Para convertir html a imagen
const nodeHtmlToImage = require('node-html-to-image')




// replace the value below with the Telegram token you receive from @BotFather
const token = '1336055457:AAHmjUZ0xHbpS3pPytR8luhixlFsvBEc_Cs';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

//Listener para que enseñe errores de sintaxis
bot.on("polling_error", console.log);


//Para hacer tests
bot.onText(/\/t (.+)/, (msg, match) => {
  const chatId = msg.chat.id;

  const promise = nodeHtmlToImage({
    html: match[1]
  });
  promise.then((img) => {
    //console.log(img)
    bot.sendPhoto(chatId, img)
  })
  //console.log(img)
  //bot.sendPhoto(chatId, img)
});

//Para buscar decks
bot.onText(/\/deck (.+)/, (msg, match) => {
  const chatId = msg.chat.id;

  const deck = DeckEncoder.decode(match[1])
  let aux = "Deck: \n"
  deck.forEach(element => {
    aux += "x"+ element.count + " " + Database.searchCardById(element.code).name + "\n"
  });
  bot.sendMessage(chatId, aux)
});


// Para buscar cartas
bot.onText(/\/carta (.+)/, (msg, match) => {
  let infoCardsProv = Database.searchCardByName(match[1])  

  const chatId = msg.chat.id;
  if(checkCorrectName(infoCardsProv, match[1], chatId))
  {
    //Si solo hay una coincidencia
    if(infoCardsProv.length == 1)
    {
      infoCardsProv = getListByCardId(infoCardsProv[0])
      mergeImagesAndSend(chatId, infoCardsProv)
    }      
    //Si hay varias
    else
    {
      mergeImagesAndSend(chatId, infoCardsProv)
    }   
  }
});

//Busca cartas relacionadas con una y devuelve la lista
function getListByCardId(card)
{
  let cardListImages = [] 
  cardListImages.push(card)
  card.relatedCards.forEach(element => {
    var newCard = Database.searchCardById(element)
    //El if es para evitar que salga la misma carta en la imagen, como el caso de la crujivid que se referencia a sí misma
    if(card.cardCode != newCard.cardCode)
      cardListImages.push(newCard)
  });   
  return cardListImages
}

//Junta imagenes en una desde una lista de cartas y la manda
function mergeImagesAndSend(chatId, cardList)
{
  let cardListImages = [] 

  cardList.forEach(element => {
    cardListImages.push(element.imageUrl)
  });   

  mergeImg(cardListImages)
  .then((img) => { 
    img.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
      bot.sendPhoto(chatId, buffer)
    });
  })
}

function checkCorrectName(infoCardsProv, msgReceived, chatId)
{
  try { 
    //Si no ha encontrado ninguna carta
    if(infoCardsProv.length == 0)
    {
      bot.sendMessage(chatId, "No se ha encontrado ninguna carta que incluya en el nombre '" + msgReceived + "'") 
      return false
    }
    //Si ha encontrado más de 5 cartas que contenga ese nombre
    else if(infoCardsProv.length > 5)
    {
      let aux = "Se han encontrado " + infoCardsProv.length + " cartas que incluyen en el nombre '" + msgReceived + "'. "
      if(infoCardsProv.length > 15)
        aux += "Especifica más por favor."
      else
      {
        aux += "Listado de cartas encontradas: "
        infoCardsProv.forEach(element => {
          aux += "'" + element.name + "', "      
        });
        //Quitamos la coma y el espacio final
        aux.substring(0, aux.length - 2)
      }
      bot.sendMessage(chatId, aux)
      return false
    }
    //Si todo es correcto
    return true
  } catch (error) {
    console.log("Error en checkCorrectName")
    console.log(error)
  }
  return false
}

function quitarAcentos(cadena){
	const acentos = {'á':'a','é':'e','í':'i','ó':'o','ú':'u','Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U'};
	return cadena.split('').map( letra => acentos[letra] || letra).join('').toString();	
}


/*
// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log("echo en recibir mensaje")
  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message');
});
*/

//BOT ANTIGUO
/*
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
const axios = require('axios')
var Database = require('./Database')
var CardInfo = require('./CardInfo')
const mergeImg = require('merge-img')
var Jimp = require('jimp');
const FormData = require('form-data');


'use strict'


//Esta parte es necesaria para que el bot funcione
app.use(bodyParser.json()) // for parsing application/json
app.use(
bodyParser.urlencoded({
    extended: true
})
) // for parsing application/x-www-form-urlencoded


//Código necesario para descargar
const fs = require('fs')
const request = require('request')

const download = (url, path) => {
  return new Promise( function(resolve, reject)  { request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('close', () => resolve(console.log(path + " creada")))
  }) })
}


//This is the route the API will call
app.post('/', function(req, res) {
  try {     
    const { message } = req.body

    //Each message contains "text" and a "chat" object, which has an "id" which is the chat id

    //Para test, borrar al final
    
    if(message.text == 1)
    {
      test(message, res)
      return
    }
    



    var botActivator = 'bot '
    
    if(!message)
    {
      console.log('llega hasta !message')
      return res.end()
    }

    if(message.text.length <= botActivator.length)
    {
      console.log('llega hasta mensaje es demasiado corto')
      return res.end()
    }

    

    if (message.text.toLowerCase().substring(0, botActivator.length) !== botActivator) {
      return res.end()
    }
    else
    {
      var msgReceived = message.text.substring(botActivator.length) 

      var relatedActivator = "rel"
      //Si lleva la palabra rel, para cartas relacionadas
      if(msgReceived.substring(0, relatedActivator.length) === relatedActivator)
      {
        msgReceived = msgReceived.substring(relatedActivator.length)

        let infoCardsProv = Database.searchCardByName(msgReceived)


      } 

      else
      {      
        let infoCardsProv = Database.searchCardByName(msgReceived)
        

        if(checkCorrectName(infoCardsProv, msgReceived, res, message))
        {
          infoCardsProv.forEach(element => {
            sendPhoto(message, element.imageUrl, res)
          });        
        }
      }
    }
  } catch (error) {
    console.log("Error en app.post")
    console.log(error)
    res.end()
  }  
})

//Mensajes a enviar cuando no encuentra carta o encuentra demasiadas. Devuelve true si es correcto
function checkCorrectName(infoCardsProv, msgReceived, res, message)
{
  try { 
    //Si no ha encontrado ninguna carta
    if(infoCardsProv.length == 0)
    {
      postMessage(message, "No se ha encontrado ninguna carta que incluya en el nombre '" + msgReceived + "'", res)      
      return false
    }
    //Si ha encontrado más de 5 cartas que contenga ese nombre
    else if(infoCardsProv.length > 5)
    {
      let aux = "Se han encontrado " + infoCardsProv.length + " cartas que incluyen en el nombre '" + msgReceived + "'. "
      if(infoCardsProv.length > 15)
        aux += "Especifica más por favor."
      else
      {
        aux += "Listado de cartas encontradas: "
        infoCardsProv.forEach(element => {
          aux += "'" + element.name + "', "      
        });
        //Quitamos la coma y el espacio final
        aux.substring(0, aux.length - 2)
      }
      postMessage(message, aux, res)
      return false
    }
    //Si todo es correcto
    return true
  } catch (error) {
    console.log("Error en checkCorrectName")
    console.log(error)
  }
  return false
}


//Función para hacer tests, borrar cuando esté terminado
function test(message, res)
{
  try {   
    mergeImg(['https://dd.b.pvp.net/1_12_0/set3/es_es/img/cards/03MT041.png', 'https://dd.b.pvp.net/1_12_0/set3/es_es/img/cards/03MT005.png'])
            .then((img) => { 
              console.log("Imagen guardada")
              img.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
                //res.writeHead(200, { 'content-type': 'multipart/form-data' });
                const formData = new FormData();
                formData.append('imagen', buffer);
                
                sendPhotoTest(message, formData, res)
              });  
                  
    
  })
} 
  catch (error) {
    console.log("Error en test")
    //console.log(error)
    res.end()
  }
}
//Para mandar foto. Result puede ser una url o la ruta a la imagen
function sendPhotoTest(message, result, res)
{ 
    console.log("Entra a send photo test")
    console.log(result.getHeaders())
    axios
    .post(
      'https://api.telegram.org/bot1336055457:AAHWh5XS1CkeaObc-JKA6yY2TX9pKHxOj-s/sendPhoto',
      {
        chat_id: message.chat.id,
        photo: result,       
        headers: result.getHeaders()
      }      
    )
    .then(response => {
      // We get here if the message was successfully posted
      console.log('Entra en respuesta foto test OK')
      res.end('ok')
    })
    .catch(err => {
      // ...and here if it was not
      //console.log('Error :', err)
      postMessage(message, JSON.stringify(err), res)
      console.log("Error en sendPhotoTest: " + JSON.stringify(err))
      //res.end('Error :' + err)
    }) 
}

//Si entra en demasiados res.end(), hace que vayan las respuestas con delay
//Para mandar un mensaje
function postMessage(message, result, res)
{
  try {   
    axios
    .post(
      'https://api.telegram.org/bot1336055457:AAHWh5XS1CkeaObc-JKA6yY2TX9pKHxOj-s/sendMessage',
      {
        chat_id: message.chat.id,
        text: result
      }
    )
    .then(response => {
      // We get here if the message was successfully posted
      console.log('Entra en respuesta texto OK')
      console.log('Respuesta de telegram: ' + response.ok)
      res.end('ok')
    })
    .catch(err => {
      // ...and here if it was not
      console.log('Error :', err)
      res.end('Error :' + err)
    })
  } catch (error) {
    console.log("Error en postMessage")
    console.log(error)
    res.end()
  }
}

//Para mandar foto. Result puede ser una url o la ruta a la imagen
function sendPhoto(message, result, res)
{
  try {   
    axios
    .post(
      'https://api.telegram.org/bot1336055457:AAHWh5XS1CkeaObc-JKA6yY2TX9pKHxOj-s/sendPhoto',
      {
        chat_id: message.chat.id,
        photo: result
      }      
    )
    .then(response => {
      // We get here if the message was successfully posted
      console.log('Entra en respuesta foto OK')
      res.end('ok')
    })
    .catch(err => {
      // ...and here if it was not
      console.log('Error :', err)
      res.end('Error :' + err)
    })
  } catch (error) {
    console.log("Error en sendPhoto")
    //console.log(error)
    res.end()
  }
}

// Finally, start our server
app.listen(3000, function() {
  console.log('Telegram app listening on port 3000!')
})
*/