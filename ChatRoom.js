import React, { useEffect, useState } from 'react'
import {over} from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient =null;// ones the user connects this stormclient will get the value.
const ChatRoom = () => {
    //first we will create what happens when we subscribe.
    const [privateChats, setPrivateChats] = useState(new Map());     
    const [publicChats, setPublicChats] = useState([]); // initial empty array for holding 
    // the public chats
    const [tab,setTab] =useState("CHATROOM");
    // ye store karga ki kya jo chat ho rahi vo chat room mai hai 
    // ya user hai koi  
        const [userData, setUserData] = useState({// this will hold the meassage
         // whether we are really connencte to the server or not.
        username: '',
        receivername: '',
        connected: false,
        message: ''
      });
    useEffect(() => {
      console.log(userData);
    }, [userData]);

    const connect =()=>{
        let Sock = new SockJS('http://localhost:8080/ws');
        stompClient = over(Sock);
        stompClient.connect({},onConnected, onError);
    }

    const onConnected = () => {
        setUserData({...userData,"connected": true});
        // jab bhi ye true hoga tabhi hame register vala page na dikhke 
          // chat dikhegi.

          // now we need to subscribe to two different end points
          // first user will listen to the chatroom
          // then he would listen to himself.
        stompClient.subscribe('/chatroom/public', onMessageReceived);
        stompClient.subscribe('/user/'+userData.username+'/private', onPrivateMessage);
        userJoin();
    }

    const userJoin=()=>{
          var chatMessage = {
            senderName: userData.username,
            status:"JOIN"
          };
          stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    }

    const onMessageReceived = (payload)=>{
        var payloadData = JSON.parse(payload.body);// as this is a stomp 
        // message and stomp message adds its own 
        // to get the payload we need to get the payload.body 

        // we will be making the simple switch condition to check 
        // what kind of message we are getting
        // in the public mode there can be 2 types of messages 
        // when the user joins and next when the user sends the message


        switch(payloadData.status){
            // this payload.status is nothing but the 
            // enum that we have created in spring
            //public enum Status {
            // JOIN,
             // MESSAGE,
             //LEAVE
            //}

            // among these in public the join and message will be used.
            case "JOIN":
                // if the new user joins than at that time 
                // we need to create a new map.
                if(!privateChats.get(payloadData.senderName)){
                    privateChats.set(payloadData.senderName,[]);
                    setPrivateChats(new Map(privateChats));
                }
                break;
            case "MESSAGE":
                // pushing the data in public chats array and then 
                // setting up the data.
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                // whenever we alter the array it is not considered as
                // the state change 
                // so we make the new array [...publicchats] and this is 
                // considered as the state change
                break;
        }
    }
    //the simplest way of creating the private mesaage is to create
    // new map where we can hold the map with the key which is the
    // name of the sender and this will hold the list of the messages 
    
    const onPrivateMessage = (payload)=>{
        console.log(payload);
        var payloadData = JSON.parse(payload.body);
        // first we need to see whether the map has the key value as 
        // the username and if the map doesnt have the username as the key
        // then we need to creae the new map and attach the work and if not
        // then with the help of the particular key value we can get the 
        // message
        if(privateChats.get(payloadData.senderName)){// so sender name check hoga
            // as we are reciever so we need to recieve every message.
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));
        }else{// what if the sender name is not present
            let list =[];
            list.push(payloadData);
            privateChats.set(payloadData.senderName,list);
            setPrivateChats(new Map(privateChats));
        }
    }

    const onError = (err) => {
        console.log(err);
        
    }

    const handleMessage =(event)=>{// this recieves the event as parameter
        const {value}=event.target;
        setUserData({...userData,"message": value});// here we need to only
        //change the username and keep all the other 3 data items as it is so 
        // we are using ... 
    }
    const sendValue=()=>{
            if (stompClient) {
              var chatMessage = {
                senderName: userData.username,
                message: userData.message,
                status:"MESSAGE"
              };
              console.log(chatMessage);
              stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
              setUserData({...userData,"message": ""});
            }
    }

    const sendPrivateValue=()=>{
        if (stompClient) {
          var chatMessage = {
            senderName: userData.username,
            receiverName:tab,
            message: userData.message,
            status:"MESSAGE"
          };
          
          if(userData.username !== tab){
            privateChats.get(tab).push(chatMessage);
            setPrivateChats(new Map(privateChats));
          }
          stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
          setUserData({...userData,"message": ""});
        }
    }

    const handleUsername=(event)=>{
        const {value}=event.target;
        setUserData({...userData,"username": value});
    }

    const registerUser=()=>{
        // whenever the user clicks on the register 
        // then we need to make sure that the user is subscribed to all 
        // the channels

        // creating the sock variable 

        // let sock=new sockjs
        connect();
    }
    
    return (
    <div className="container">
        {userData.connected?
        // here i want to see whether the user
        // is connected or not so using the simple ternary operator.
        // if user is connected then i want to show the chat in the chat box
        // varna we need to show the registry dialogue.
        <div className="chat-box">
            <div className="member-list">
                <ul>
                    <li onClick={()=>{setTab("CHATROOM")}} className={`member ${tab==="CHATROOM" && "active"}`}>Chatroom</li>
                    {[...privateChats.keys()].map((name,index)=>(
                        <li onClick={()=>{setTab(name)}} className={`member ${tab===name && "active"}`} key={index}>{name}</li>
                    ))}
                </ul>
            </div>
            {tab==="CHATROOM" && <div className="chat-content">
                <ul className="chat-messages">
                    {publicChats.map((chat,index)=>(
                        <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                            {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                            <div className="message-data">{chat.message}</div>
                            {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                        </li>
                    ))}
                </ul>

                <div className="send-message">
                    <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} /> 
                    <button type="button" className="send-button" onClick={sendValue}>send</button>
                </div>
            </div>}
            {tab!=="CHATROOM" && <div className="chat-content">
                <ul className="chat-messages">
                    {[...privateChats.get(tab)].map((chat,index)=>(
                        <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                            {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                            <div className="message-data">{chat.message}</div>
                            {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                        </li>
                    ))}
                </ul>

                <div className="send-message">
                    <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} /> 
                    <button type="button" className="send-button" onClick={sendPrivateValue}>send</button>
                </div>
            </div>}
        </div>
        :
        <div className="register">
            <input
                id="user-name"
                placeholder="Enter your name"
                name="userName"
                value={userData.username}
                onChange={handleUsername}
                margin="normal"
              />
              <button type="button" onClick={registerUser}>
                    connect
              </button> 
        </div>}
    </div>
    )
}

export default ChatRoom