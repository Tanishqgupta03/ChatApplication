package com.involveinnovation.chatserver.controller;

import com.involveinnovation.chatserver.controller.model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/message")// whenever the user sends the message to slash message
    // then we will get the message to the particular method   SO USE THE URL-----> /app/message.
    // whenever the message is received here we will sendto chatroom public.
    @SendTo("/chatroom/public")
    public Message receiveMessage(@Payload Message message){
        return message;
    }

    @MessageMapping("/private-message")
    // here we need to send the message to a particular user so we need to create the topics
    // dynamically we should not use some hard coded topics
    public Message recMessage(@Payload Message message){
        // convertAndSendToUser apne app hi /user ya fir hamne koi bhi prefix diya ho user destination prefix mai
        // vo automatically yaha aa jayega.
        // (message.getReceiverName() this is the prefix jiske sath hamne /private add kara hai
        simpMessagingTemplate.convertAndSendToUser(message.getReceiverName(),"/private",message);
        // /user/David/private
        System.out.println(message.toString());
        return message;
    }
}
