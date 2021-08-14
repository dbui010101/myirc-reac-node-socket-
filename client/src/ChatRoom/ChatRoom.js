import React, { useEffect, useState } from "react";
import "./ChatRoom.css";
import { useForm } from 'react-hook-form';
import {useLocation,useHistory} from "react-router-dom";

const ChatRoom = ({socket}) => {
  let location = useLocation();
  let history = useHistory();
  const[allmessage,setAllMessage]=useState('');
  const[user,setuser]=useState('');
  
  const[rooms,setrooms]=useState([]);
  const {register, handleSubmit}=useForm();
  let piece=location.pathname.split('/')[1].trim().toLowerCase()
  let utilisateur=location.pathname.split('/')[2]
  const [actualroom,setActualRoom]=useState(piece);
 

  useEffect(() => {
    
    
    
     socket.emit("enter_room",{
      name:utilisateur,
      room:piece
    });
    //ici pour charger les rooms directs
    socket.on('allRoom', (data) => { 
      // console.log(data)
      setrooms(data.room)
    })

    socket.on('allUser', (data) => {
      //console.log(data)
      setuser(data)
    })
  }, [location.search])





  const onSubmit = data => 
  {
    if(data.texte){
      socket.emit('chatMessage',{
        name: utilisateur,
        message: data.texte,
        room: piece 
      })
      
    if (data.texte.substr(0,6)=='/nick '){
      const newname=data.texte.split('/nick ')[1];
      window.location.href = "/"+piece+"/" + newname
    }

    if (data.texte.substr(0,6)=='/join '){
      const newname=data.texte.split('/join ')[1].trim().toLowerCase();
      rooms.forEach(function(salle){
        if(salle==newname)window.location.href = "/"+newname+"/"+utilisateur
      });
      
    }

    if (data.texte.substr(0,6)=='/part '){
      
      const newname=data.texte.split('/part ')[1].trim().toLowerCase();
      rooms.forEach(function(salle){
        if(salle==newname && piece==newname)window.location.href = "/chatroom/"+utilisateur
      });
      
    }
      
    
      
   
    }
    

  }
 

  useEffect(function(){
    // on émet un message dentreeee dans une salle

    socket.emit('accueil',{
      name: utilisateur,
      message: "vient de rejoindre la salle "+piece,
      room:piece
    })
 
    socket.on('message',(msg) =>{
      
      setAllMessage((allmessage) => [...allmessage, msg.name+" : "+msg.message])
      
    })
    socket.on('newname',(msg) =>{
      setAllMessage((allmessage) => [...allmessage, msg.name+" : "+msg.message])
      
    })
    socket.on('redirect',(msg) =>{
      window.location.href = "/"
      
    })

    socket.on('messageprive',(msg) =>{
      if(utilisateur==msg.name) setAllMessage((allmessage) => [...allmessage, msg.name2+" : "+msg.message])
      
    })
    
    
  },[]);
 

  function handleClick(name){
    
    window.location.href = "/"+name+"/" + utilisateur
    //history.push("/"+name+"/"+utilisateur)
  }
  

 


  
return (  
    <div className="chat-container">
      <header className="chat-header">
        <h1><i className="fas fa-smile"></i> ChatCord</h1>
        <a id="leave-btn" className="btn">Leave Room</a>
      </header>
      <main className="chat-main">
        <div className="chat-sidebar">
          <h3><i className="fas fa-comments"></i> Room Name:</h3>
          <h2 id="room-name">
          <aside>
          <ul id="tabs">
          {
              rooms.map((room,index) => (
                <li key={index} onClick={() => handleClick(room)}>{room}</li>
              ))
            }
          </ul>
          </aside>
          </h2>
          <h3><i className="fas fa-users"></i> Users</h3>
          <ul id="users">
          {user? user.map((msg,i) => (
            
              <p key={i}>{msg.room==actualroom?msg.name:null}</p>
            
            
          )): null}
          </ul>
        </div>
        <div className="chat-messages">{allmessage ? allmessage.map((msg,i) => (
            <p key={i}>{msg}</p>
        )): null}</div>
      </main>
      <div className="chat-form-container" >
        <form  onSubmit={handleSubmit(onSubmit)} id="chat-form"  >
        <input {...register("texte")} 
            id="msg"
            type="text"
		        placeholder="Entrez votre texte"	 
            required
            autoComplete="off"
          />
          <input type="submit" className="btn"></input>
        </form>
        <ul>
          
        <li>• /nick nickname : définit le surnom de l’utilisateur au sein du serveur.</li>
        <li>• /list [string] : liste les channels disponibles sur le serveur. N’affiche que les channels contenant la
          chaîne “string” si celle-ci est spécifiée.</li>
        <li>• /create channel : créer un channel sur le serveur.</li>
        <li>• /delete channel : suppression du channel sur le serveur.</li>
        <li>• /join channel : rejoint un channel sur le serveur.</li>
        <li>• /part channel : quitte le channel.</li>
        <li>• /users : liste les utilisateurs connectés au channel.</li>
        <li>• /msg nickname message : envoie un message à un utilisateur spécifique.</li>
          
        </ul>
      </div>
    </div>

    
  );
};

export default ChatRoom