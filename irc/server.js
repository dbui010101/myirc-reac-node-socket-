const http=require('http');
const express= require('express');
const socketIo=require('socket.io');
const app=express();
const server=http.createServer(app);
const io=socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

const tableau=[];
const allrooms=[];
let allmessages=[]
let compareallmessages=[]
let trueroom=false;
let userroom="";
let keeprooms=[]
io.on('connection',socket=>{
  

  // intercepte les nouveaux arrivants
  socket.on("enter_room",msg=>{
    //on entre dans la salle demandeé
    
    socket.join(msg.room);
    
    socket.on('accueil',msg=>{
      io.in(msg.room).emit('message',msg)
    })
    const id=socket.id 
    const name=msg.name.trim().toLowerCase()
    const room=msg.room.trim().toLowerCase()
    const user={id,name,room}
    userroom=user.room
    let roomidem=0;
    let allroomsidem=0;
    for (let i = 0; i < tableau.length; i++) {
        
      if (tableau[i].name === name){
        tableau[i].room=room
        roomidem=1
      } 
    }
    
    if(roomidem==0)tableau.push(user)

    for (let i = 0; i < allrooms.length; i++) {
        
      if (allrooms[i] === room){
        
        allroomsidem=1
      } 
    }
    if(allroomsidem==0)allrooms.push(room)
    
    
    const rooms = getAllRoom();
    io.emit('allRoom', {room: getAllRoom()});
    io.emit('allUser', tableau);
    

    // message de welcome
    socket.broadcast.to(room).emit('message',{//broadcast afficher
      name: name,
      message: 'vient de se connecter'
    })
    
    
  })

  //liste tout de tout les rooms
  socket.on('allRooms', () => {
    const rooms = getAllRoom();
    return rooms;
  })

  
  //reception des messages
  socket.on('chatMessage',msg =>{
    

    //change pseudo
    if (msg.message.substr(0,6)=='/nick '){
      const newname=msg.message.split('/nick ')[1];
      
      for (let i = 0; i < tableau.length; i++) {
        
        if (tableau[i].name === msg.name){
          tableau[i].name=newname
        } 
      }
        io.emit('newname',{
          name: msg.name,
          message: 'est devenu '+newname,
          room : msg.room
        })
        
    
    // list des channels selon string ou non    
    }else if (msg.message.substr(0,5)=='/list'){
      const newname=msg.message.split('/list ')[1]/*.trim().toLowerCase()*/
      const toutelespieces=msg.message
      let retourmessage="";
      let count=0;
      let listsearch="";
      if(toutelespieces=="/list" || toutelespieces=="/list "){
        for (let i = 0; i < allrooms.length; i++) {
          count=1
          listsearch+=allrooms[i]+", "
        }
      }
      else{
        for (let i = 0; i < allrooms.length; i++) {
          if (allrooms[i].includes(newname)){
           count=1;
           listsearch+=allrooms[i]+", "
          }
            
        } 
      }
      count==0?retourmessage=" cette piece n existe pas":retourmessage=" voci les rooms "+listsearch

      io.emit('message',{
            name: "robot",
            message: retourmessage,
            room: msg.piece 
          })

      pushallmessages('robot','robot : '+retourmessage,msg.piece)



    //create channel
    }else if (msg.message.substr(0,8)=='/create '){
      const newname=msg.message.split('/create ')[1].trim().toLowerCase();

      allrooms.push(newname)
     
      io.emit('allRoom', {room: getAllRoom()});
      // annonce user cree un salon
      io.emit('message',{
            name: msg.name,
            message: " a cree "+ " le channel "+newname,
            room: msg.piece 
          })
        
      






    //delete channel
    }else if (msg.message.substr(0,8)=='/delete '){
        
        const newname=msg.message.split('/delete ')[1].trim().toLowerCase();  
        for (let index = 0; index < allrooms.length; index++) {
          if(allrooms[index]=== newname){
            trueroom=true
          } 
        }
      if(trueroom==true){
       for (let i = 0; i < allrooms.length; i++) {
         if (allrooms[i] === newname){
           allrooms.splice(i, 1)//supp
          
           io.emit('allRoom', {room: getAllRoom()});
           io.emit('message',{
            name: msg.name,
            message: " a supprimé "+ " le channel "+newname,
            room: msg.piece 
          })
         } 
       }
      if(newname===userroom){
          io.to(userroom).emit('redirect');
          io.to(userroom).disconnectSockets();
      }else{
          io.to(newname).emit('redirect');
          io.to(newname).disconnectSockets();
      }
      
    }

    
    

    //join channel
    }else if (msg.message.substr(0,6)=='/join '){
      const newname=msg.message.split('/join ')[1].trim().toLowerCase();
      let itsok=0;
      allrooms.forEach(function(salle){
        if(salle==newname) itsok=1
      });

      if(itsok==1){
        for (let i = 0; i < tableau.length; i++) {
          if (tableau[i].name === msg.name){
            tableau[i].room=newname
          } 
        }
        io.emit('message',{
          name: msg.name,
          message: " a rejoin "+ " le channel "+ newname,
          room: msg.piece 
        })
      
      }








    //part channel
    }else if (msg.message.substr(0,6)=='/part '){
 
      const newname=msg.message.split('/part ')[1].trim().toLowerCase();
      let itsok=0;
      allrooms.forEach(function(salle){
        if(salle==newname && newname==msg.room) itsok=1
      });

      if(itsok==1){
        for (let i = 0; i < tableau.length; i++) {
          if (tableau[i].name === msg.name){
            tableau[i].room='chatroom'
          } 
        }
        io.emit('message',{
          name: msg.name,
          message: " a quitté "+ " le channel "+ newname,
          room: msg.piece 
        })
      
      }
    
      



    //list user meme channel
    }else if (msg.message.substr(0,6)=='/users'){
      
      const toutelesusers=msg.message
      let retourmessage="";
      let count=0;
      let listsearch="";
      if(toutelesusers=="/users" || toutelesusers=="/users "){
        for (let i = 0; i < tableau.length; i++) {
          if (tableau[i].room==msg.room){
            count=1;
            listsearch+=tableau[i].name+", "
           }
        }
      }
      
      count==0?retourmessage=" aucun utilisateur":retourmessage=" voci les users "+listsearch

      io.to(msg.room).emit('message',{
            name: "robot",
            message: retourmessage,
            room: msg.piece 
      })    
        
      pushallmessages("robot","robot : "+retourmessage,msg.piece)
      






    }else if (msg.message.substr(0,5)=='/msg '){
      const target=msg.message.split('/msg ')[1].trim().toLowerCase();
      let piece=target.split(' ')
      // let utilisateur=location.pathname.split('/')[2]
      let pseudo="";
      let phrase="";
      let piecePesudo="";
      for(let i=0;i<piece.length;i++){
        if(piece[i] && i==0){
          pseudo=piece[i];
        }else{
          phrase+=piece[i]+" ";
        }
        

      }
    io.to(msg.room).emit('messageprive',{
      name:msg.name,
      name2: "à "+pseudo,
      message: phrase,
      room:msg.room,
    })

    for (let i = 0; i < tableau.length; i++) {
      if (tableau[i].name==pseudo){
        piecePseudo=tableau[i].room
        
       }
    }
      
    io.to(piecePseudo).emit('messageprive',{
      name:pseudo,
      name2:"de "+msg.name,
      message: phrase,
      room:piecePseudo,
    })






    //write messsage
    }else{
    io.to(msg.room).emit('message',msg) // pour diffsuer le message a tout le monde il faut mettre io et non socket
    pushallmessages(msg.name,msg.message,msg.room)
    
    }




    
    
  });
  

  socket.on('disconnect',()=>{
    io.emit('message',{
    name: 'user',
    message: 'vient de quitter la salle'
   })
  })

  



});
//enleve les doublons
const getAllRoom = () => {
  let unique = []
  unique = [...new Set(allrooms)] 

  return unique;
}


//push dans la const allmessages
const pushallmessages= (name,message,room) =>{
  const messagerrom={name,message,room}
  allmessages.push(messagerrom)
}


const PORT=4000 || process.env.PORT; 
server.listen(PORT,()=>console.log(`server ruuning${PORT}`));