import React from "react";
import { useHistory} from "react-router-dom";
import { useForm } from "react-hook-form";
//import io from "socket.io-client";


//const socket= io("http://localhost:4000");
const Home = ({ socket }) => {
	//console.log(socket);
	let history = useHistory();
	
	const {register, handleSubmit}=useForm();
	// const {user, setUser}=useForm();
	const onSubmit = data => 
	{
		
		// setUser(data.pseudo)
		socket.emit('joinRoom', data.pseudo/*, roomName*/);
		//window.location.href = "/ChatRoom/"+data.pseudo;
		history.push("/ChatRoom/" + data.pseudo)
	}
	


	
	return (
		<form onSubmit={handleSubmit(onSubmit)}  >
    			<input {...register("pseudo")} 
				placeholder="Entrez un pseudo"	 
				required
				/>
			
			<input type="submit" value="Envoyer" />
			

		</form>
	);
};

export default Home;