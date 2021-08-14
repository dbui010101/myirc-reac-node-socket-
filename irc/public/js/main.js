const chatForm=document.getElementById('chat-form');// valeur taper mess
const chatMessages=document.querySelector('.chat-messages');
const roomName=document.getElementById('room-name');
const userList=document.getElementById('users');

//Get username and room from URL 
const {username, room}=Qs.parse(location.search,{
    ignoreQueryPrefix: true
});
const socket=io();
console.log(username,room);
//join chatroom
socket.emit('joinRoom',{username,room});

//Get room and users
socket.on('roomUsers',({room,users}) =>{
    outputRoomName(room);
    outputUsers(users);
});

//  message come server
socket.on('message', message =>{ // ici ça recrache sur view
    console.log(message);
    outputMessage(message); //recrache function en bas

    //scroll down
    chatMessages.scrollTop= chatMessages.scrollHeight;// agrandir le scroll
});


//detecte message submit lors du click
chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    const msg=e.target.elements.msg.value //id=msg sur html et donc value de message
    socket.emit('chatMessage',msg);// emet au serveur qui after msg devient message qui recrache line1 main.js

    // Clear input
    e.target.elements.msg.value='';
    e.target.elements.msg.focus();//pour bien cibler
})

//output mess to dom
function outputMessage(message){//ecrase les lopsum etc
    const div =document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`<p class="meta">${message.username}<span>${message.time}</span></p> 
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}


// Add room name to DOM
function outputRoomName(room){
    roomName.innerText=room;

}

// Add users to DOM
function outputUsers(users){
    userList.innerHTML= `
        ${users.map(user=>`<li>${user.username}</li>`).join('')}
    `;
    
}