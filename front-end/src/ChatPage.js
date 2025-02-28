import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, TextField, Box, IconButton, Avatar, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit'; // Import Edit icon
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Backspace';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { getChats } from "./api/api.js";

function ChatPage() {
  const SOCKET_URL = "https://chatmate-secure-private-messaging-hub.onrender.com";
  const localdata = localStorage.getItem("profile");
  const [message, setMessage] = useState(''); // State for the input message
  const [chatHistory, setChatHistory] = useState([]); // State to store chat history
  const [username, setusername] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null); // State to track the message being edited
  const [editedMessage, setEditedMessage] = useState('');
  const [socket, setsocket] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (localdata) {
          setusername(JSON.parse(localdata).result.username);
          const Chats = await getChats();
          if (Chats.status === 200) {
            setChatHistory(Chats.data);
            const element = document.querySelector(".chatbox");
            setTimeout(() => {
              element.scrollTop = element.scrollHeight;
            }, 10);
            await setsocket(
              io
                .connect(SOCKET_URL)
                .emit("join_room", "chatting")
                .on("recieve_message", (data) => {
                  if (data.error === "jwt expired") {
                    alert("Session expired !!");
                    localStorage.removeItem("profile");
                    navigate("/");
                  } else if (!data.error) {
                    setChatHistory((prevchats) => [...prevchats, data]);
                    setTimeout(() => {
                      element.scrollTop = element.scrollHeight;
                    }, 1);
                  } else {
                    alert(data.error);
                  }
                })
                .on("recieve_edit_message", (data) => {
                  if (data.error === "jwt expired") {
                    alert("Session expired !!");
                    localStorage.removeItem("profile");
                    navigate("/");
                  } else if (!data.error) {
                    setChatHistory((prev) =>
                      prev.map((msg) =>
                        msg._id === data._id ? { ...msg, message: data.message } : msg
                      )
                    );
                  } else {
                    alert(data.error);
                  }
                })
                .on("recieve_delete_message", (data) => {
                  if (data.error === "jwt expired") {
                    alert("Session expired !!");
                    localStorage.removeItem("profile");
                    navigate("/");
                  } else if (!data.error) {
                    setChatHistory((prev) => prev.filter((msg) => msg._id !== data.id));
                  } else {
                    alert(data.error);
                  }
                })
            );
          } else if (Chats.status === 201) {
            if (Chats.data === "jwt expired") alert("Session expired !!");
            localStorage.removeItem("profile");
            navigate("/");
          }
        } else {
          navigate("/");
        }
      } catch (error) {
        alert("SERVER DOWN!");
        console.log(error.message);
      }
    };
    fetchData();
  }, [localdata, navigate]);

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      if (message.trim() !== '') {
        await socket.emit("send_message", {
          Name: username,
          message: message,
          headers: { authorization: `Bearer ${JSON.parse(localdata).token}` },
        });
        setMessage("");
      }
    } catch (error) {
      alert("Connection lost!!");
      console.log(error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e); // Send the message
    }
    // If Shift + Enter is pressed, allow the default behavior (new line)
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        await socket.emit("delete_message", {
          _id: id,
          headers: { authorization: `Bearer ${JSON.parse(localdata).token}` },
        });
      } catch (error) {
        alert("Connection lost!!");
        console.log(error);
      }
    }
  };

  // Handle editing a message
  const handleEditMessage = (id, content) => {
    setEditingMessageId(id); // Set the message ID being edited
    setEditedMessage(content); // Set the content of the message being edited
  };

  const handleSaveEditedMessage = async (id) => {
    try {
      if (editedMessage.trim() !== '') {
        await socket.emit("edit_message", {
          _id: id,
          message: editedMessage,
          headers: { authorization: `Bearer ${JSON.parse(localdata).token}` },
        });
        setEditingMessageId(null); // Clear the editing state
        setEditedMessage('');
      }
    } catch (error) {
      alert("Connection lost!!");
      console.log(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditedMessage('');
  };

  const handleLogout = async (e) => {
    await socket.disconnect();
    navigate("/");
    localStorage.removeItem("profile");
  }

  const renderAnimatedText = (text) => {
    return text.split('').map((letter, index) => (
      <motion.span
        key={index}
        initial={{ x: '-50%', opacity: 0 }}
        animate={{ x: '0%', opacity: 1 }}
        transition={{
          delay: index * 0.2,
          type: 'spring',
          stiffness: 150,
          damping: 7,
        }}
        style={{
          display: 'inline-block',
          textShadow: '0 0 5px rgba(41, 31, 0, 0.66)',
        }}
      >
        {letter === ' ' ? '\u00A0' : letter}
      </motion.span>
    ));
  };

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#f0f2f5', // Light gray background
      }}
    >
      {/* App Bar */}
      <AppBar position="static" style={{ background: '#FF4081' }}>
        <Toolbar>
          <Typography variant="h4" style={{ flexGrow: 1 }}>
            {renderAnimatedText("Chat-mate")}
          </Typography>
          {/* Logout Button */}
          <IconButton
            color="inherit"
            onClick={handleLogout}
            style={{ marginRight: '10px', background: "rgb(113, 54, 240)" }}
          >
            <LogoutIcon />
          </IconButton>
          {/* Profile Icon */}
          <Avatar
            alt="Profile"
            style={{ width: '40px', height: '40px', background: "#FFD600", color: "rgb(0,0,0)" }}
          > {username[0]} </Avatar>
        </Toolbar>
      </AppBar>

      {/* Chat Box */}
      <Box
        className='chatbox'
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto', // Make the chat box scrollable
          background: '#fff', // White background for chat area
          margin: '10px',
          borderRadius: '15px',
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
        }}
      >
        <AnimatePresence>
          {chatHistory.map((chat, index) => {
            const timestamp = new Date(chat.date);
            const date = timestamp.toString().slice(4, 15);
            const hours = timestamp.getHours();
            const minutes =
              timestamp.getMinutes() > 9
                ? timestamp.getMinutes().toString()
                : "0" + timestamp.getMinutes().toString();
            const time =
              hours > 12
                ? (hours - 12).toString() + ":" + minutes + "pm"
                : (hours === 0 ? "12" : hours.toString()) + ":" + minutes + "am";

            // Check if the date has changed
            const showDate = index === 0 || date !== new Date(chatHistory[index - 1].date).toString().slice(4, 15);

            return (
              <React.Fragment key={chat._id}>
                {/* Render date box if the date has changed */}
                {showDate && (
                  <Box
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center', // Center the date box
                      marginBottom: '10px',
                      position: 'sticky',
                      top: '-15px'
                    }}
                  >
                    <Box
                      style={{
                        padding: '5px 15px',
                        borderRadius: '20px',
                        background: 'rgba(222, 222, 222, 0.8)', // Light gray background for the date box
                        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="subtitle2" style={{ fontSize: '12px', color: 'rgb(99, 99, 99)' }}>
                        {date}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Render chat block */}
                <Box
                  id={chat._id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: chat.Name === username ? 'flex-end' : 'flex-start', // Align sender to the right
                    marginBottom: '10px',
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, x: chat.Name === username ? 50 : -50 }}
                    animate={{
                      opacity: 1, x: 0,
                      transition: { duration: 0.5, type: 'spring', stiffness: 150, damping: 8 }
                    }}
                    variants={{
                      initial: { opacity: 1, x: 0 },
                      exit: {
                        scale: 0.5, opacity: 0, x: chat.Name === username ? -1000 : 1000,
                        transition: { duration: 0.5 }
                      }
                    }}
                    exit="exit"
                    style={{
                      maxWidth: '60%',
                      padding: '10px',
                      borderRadius: '10px',
                      background: chat.Name === username ? 'rgba(254, 153, 212, 0.56)' : 'rgba(254, 247, 190, 0.69)', // Different colors for sender and receiver
                      boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {/* Chat Content */}
                    {editingMessageId === chat._id ? (
                      <Box style={{ width: "100%" }}>
                        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <IconButton
                            style={{ fontSize: "16px", marginBottom: '5px' }}
                            onClick={handleCancelEdit}
                          >
                            <CloseIcon fontSize="inherit" />
                          </IconButton>
                          <Typography variant="subtitle2" style={{ fontWeight: 'bold', color: '#FF4081' }}>
                            Editing Message
                          </Typography>
                        </Box>
                        <TextField
                          fullWidth
                          variant="outlined"
                          multiline
                          required
                          maxRows={3}
                          value={editedMessage}
                          onChange={(e) => setEditedMessage(e.target.value)}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleSaveEditedMessage(chat._id)}
                          style={{ marginTop: '5px' }}
                        >
                          Save
                        </Button>
                      </Box>
                    ) : (<>
                      {chat.Name !== username && <Typography variant="subtitle2" style={{ fontWeight: 'bold', color: '#FF4081' }}>
                        {chat.Name}
                      </Typography>}
                      <Typography variant="body1" style={{ marginTop: '5px' }}>
                        {chat.message}
                      </Typography>
                      <Box
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}>
                        {chat.Name === username && (
                          <>
                            <IconButton
                              style={{ fontSize: "14px", marginTop: "-4px" }}
                              onClick={() => handleEditMessage(chat._id, chat.message)}
                            >
                              <EditIcon fontSize="inherit" />
                            </IconButton>
                            <IconButton
                              style={{ fontSize: "14px", marginTop: "-4px" }}
                              onClick={() => handleDeleteMessage(chat._id)}
                            >
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                          </>
                        )}
                        <Typography variant="caption" style={{ display: 'block', textAlign: 'right', color: '#666' }}>
                          {time}
                        </Typography>
                      </Box>
                    </>)}
                  </motion.div>
                </Box>
              </React.Fragment>
            );
          })}
        </AnimatePresence>
      </Box>

      {/* Input Box */}
      <form onSubmit={handleSendMessage}>
        <Box
          style={{
            padding: '20px',
            display: 'flex',
            background: '#fff',
            margin: '10px',
            borderRadius: '15px',
            boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
          }}
        >
          <TextField
            id="input"
            fullWidth
            variant="outlined"
            placeholder="Type a message"
            multiline
            required
            maxRows={3} // Limit to 3 lines
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            style={{ marginRight: '10px' }}
          />
          <IconButton
            color="primary"
            type="submit"
            style={{ alignSelf: 'flex-end' }} // Align the send button to the bottom
          >
            <SendIcon />
          </IconButton>
        </Box>
      </form>
    </Box>
  );
}

export default ChatPage;
