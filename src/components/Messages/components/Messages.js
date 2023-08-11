import React, {useContext, useEffect, useMemo, useRef, useState} from "react";
import io from "socket.io-client";
import config from "../../../config"; // for socket.io server endpoint and audio urls
import LatestMessagesContext from "../../../contexts/LatestMessages/LatestMessages"; // to update latest messages
import Header from "./Header";
import Footer from "./Footer";
import "../styles/_messages.scss";
import useSound from "use-sound";
import Message from "./Message";
import Typing from "./TypingMessage";

const generateMessageList = (messages) => {
    return Object.entries(messages).filter(item => item[0] === 'me' || item[0] === 'bot')
}
const socket = io(
    config.BOT_SERVER_ENDPOINT,
    {transports: ['websocket', 'polling', 'flashsocket']}
);


function Messages() {
    // all codes goes here
    const {messages, setLatestMessage} = useContext(LatestMessagesContext)
    const [messagesList, setMessagesList] = useState(generateMessageList(messages))
    const [send] = useSound(process.env.PUBLIC_URL + '/send.mp3')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesListRef = useRef(null);


    useEffect(() => {
        if (messagesListRef.current) {
            messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
        }
    }, [messagesList]);


    const sendMessage = () => {
        if (message.length) {
            send()
            setLatestMessage('me', message)
            setMessagesList((messagesList) => {
                return [...messagesList, ['me', message]]
            })
            socket.emit('user-message', message)
            setMessage('')
        } else {
            alert('Just type something')
        }
    }
    // replace with your logic)


    const onChangeMessage = function (e) {
        setMessage(e.target.value)
    }; // replace with your logic


    useEffect(() => {
        socket.on('bot-message', (message) => {
            setLoading(false)
            new Audio(process.env.PUBLIC_URL + '/receive.mp3').play()
            // receive()
            setLatestMessage('bot', message)

            setMessagesList((messagesList) => {
                return [...messagesList, ['bot', message]]
            })
        });

        socket.on('bot-typing', () => {
            setLoading(true)
        })
    }, [])

    console.log('test')


    const memoizedList = useMemo(() => {
        return messagesList.map(item => {
            return <Message message={{message: item[1], user: item[0], id: item[1]}}
                            botTyping={item[1] === 'bot'} nextMessage={''}/>
        })
    }, [messagesList])


    return (
        <div className="messages">
            <Header/>
            <div ref={messagesListRef} className="messages__list" id="message-list">
                {memoizedList}
                {loading ? <Typing/> : ''}
            </div>
            <Footer
                message={message}
                sendMessage={sendMessage}
                onChangeMessage={onChangeMessage}
            />
        </div>
    );
}

export default Messages;
