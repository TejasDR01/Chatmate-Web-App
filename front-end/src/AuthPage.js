import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, TextField, Button, Typography, Box, InputAdornment, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import $ from "jquery";
import { Signin, Signup } from "./api/api.js";

function AuthPage() {
  const initialState = { usrnm: "", email: "", pass: "", cpass: "" };
  const navigate = useNavigate();
  const [formData, setformData] = useState(initialState);
  const [isSignup, setisSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const flipVariants = {
    initial: {
      rotateY: 0, // Start with no rotation
    },
    animate: {
      rotateY: 180, // Rotate 180 degrees
    }
  };

  // Reverse flip animation for the content inside the card
  const contentVariants = {
    initial: {
      rotateY: 0, // Start with no rotation
    },
    animate: {
      rotateY: -180, // Reverse rotation to keep content upright
    }
  };

  const hopVariants = {
    initial: {
      x: '100%', // Start off-screen to the left
      y: '-100%', // Start above the screen
      scale: 0.5, // Start smaller
      opacity: 0, // Start invisible
    },
    animate: {
      x: '0%', // Move to the center horizontally
      y: '0%', // Move to the center vertically
      scale: 1, // Scale to normal size
      opacity: 1, // Fade in
      transition: {
        type: 'spring', // Spring animation for bouncy effect
        stiffness: 150, // Adjust stiffness for more/less bounce
        damping: 8, // Adjust damping for more/less bounce
        delay: 0.6, // Delay the animation slightly
      },
    },
  };

  const handleSignUp_In = () => {
    setisSignup(!isSignup);
    setformData(initialState);
    $("#msg").hide();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignup) {
      if (formData["usrnm"].length < 5) {
        console.log("hi");
        $("#msg").text("Username requires min 5 chars");
        $("#msg").show();
      }
      else if (formData["pass"].length <= 7) {
        $("#msg").text("Password requires min 8 chars");
        $("#msg").show();
      }
      else if (formData["pass"] !== formData["cpass"]) {
        $("#msg").text("Passwords not matched !!");
        $("#msg").show();
      }
      else {
        try {
          const res = await Signup(formData);
          if (res.status === 200) {
            localStorage.setItem("profile", JSON.stringify(res.data));
            navigate("/");
            alert("account created successfully!");
          }
          else {
            if (res.status === 201) {
              $("#msg").text(res.data.message);
              $("#msg").show();
            }
            else {
              console.log(res);
            }
          }
        } catch (error) {
          console.log({ message: error.message });
        }
      }
    }
    else {
      try {
        const res = await Signin(formData);
        if (res.status === 200) {
          //console.log(res.data);
          localStorage.setItem("profile", JSON.stringify(res.data));
          navigate("/");
        }
        else {
          console.log(res);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          $("#msg").text(error.response.data.message);
          $("#msg").show();
        }
        else
          console.log({ message: error.message });
      }
    }
    e.target.reset();
    setformData(initialState);
  };
  const handleChange = (e) => { setformData({ ...formData, [e.target.name]: e.target.value }); };

  const renderAnimatedText = (text) => {
    return text.split('').map((letter, index) => (
      <motion.span
        key={index}
        initial={{ x: '-50%', rotate: -180, opacity: 0 }} // Start off-screen to the left, rotated, and invisible
        animate={{ x: '0%', rotate: 0, opacity: 1 }} // Move to the center, unrotated, and visible
        transition={{
          delay: index * 0.07, // Delay each letter's animation
          type: 'spring', // Spring animation for bouncy effect
          stiffness: 150, // Adjust stiffness for more/less bounce
          damping: 7, // Adjust damping for more/less bounce
        }}
        style={{
          display: 'inline-block',
          textShadow: '0 0 5px rgba(41, 31, 0, 0.66)',
        }} // Ensure each letter is treated as a block
      >
        {letter === ' ' ? '\u00A0' : letter} {/* Preserve spaces */}
      </motion.span>
    ));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };


  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'flex-end', // Move content to the right
        alignItems: 'center',
        height: '100vh',
        background: 'rgba(255, 0, 204, 0.71)', // Pink to yellow gradient
        paddingRight: '10%', // Add padding to the right
      }}
    >
      <Box
        style={{
          width: '100%',
          textAlign: 'center',
          marginBottom: '20px', // Add space below the heading
        }}
      >
        <Typography
          variant="h3"
          style={{
            color: 'rgb(241, 241, 241)',
          }}
        >
          {renderAnimatedText(`Welcome To Chat-mate`)}
        </Typography>
      </Box>

      <AnimatePresence mode="wait">
        <motion.div
          variants={hopVariants} // Apply the hop animation
          initial="initial"
          animate="animate"
        >
          <motion.div
            key={isSignup ? 'signup' : 'signin'} // Key to trigger animation
            variants={flipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.6 }}
            style={{
              perspective: '1000px', // Add perspective for 3D effect
            }}
          >
            <Card
              style={{
                padding: '30px',
                width: '300px',
                borderRadius: '15px',
                boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
                background: '#FFF3E0', // Light yellow background for the card
                transformStyle: 'preserve-3d', // Enable 3D transformations
              }}
            >
              {/* Content inside the card */}
              <motion.div
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.6 }}
              >
                <Typography variant="h6" align="center" gutterBottom style={{ color: '#FF4081' }}>
                  {isSignup ? 'Sign Up' : 'Sign In'}
                </Typography>
                <form onSubmit={handleSubmit}>
                  {isSignup && (
                    <TextField
                      label="Username"
                      name="usrnm"
                      type='text'
                      fullWidth
                      required
                      margin="normal"
                      variant="outlined"
                      onChange={handleChange}
                      value={formData.usrnm} />
                  )}
                  <TextField
                    type="email"
                    label="Email"
                    name="email"
                    fullWidth
                    required
                    margin="normal"
                    variant="outlined"
                    onChange={handleChange}
                    value={formData.email} />
                  <TextField
                    label="Password"
                    name="pass"
                    type={showPassword ? 'text' : 'password'} // Toggle password visibility
                    fullWidth
                    required
                    margin="normal"
                    variant="outlined"
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                            style={{ color: "rgb(129, 121, 94)" }} // Pink color for the icon
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    value={formData.pass} />
                  {isSignup && (
                    <TextField
                      label="Confirm Password"
                      name="cpass"
                      type={showPassword ? 'text' : 'password'} // Toggle password visibility
                      fullWidth
                      required
                      margin="normal"
                      variant="outlined"
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleClickShowPassword}
                              edge="end"
                              style={{ color: "rgb(129, 121, 94)" }} // Pink color for the icon
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      value={formData.cpass} />
                  )}
                  <Typography
                    id="msg"
                    align="center"
                    style={{
                      color: 'rgba(255, 0, 0, 0.97)', // Pink color for the message
                      marginTop: '10px',
                      fontSize: '0.9rem',
                      display: 'none'
                    }}
                  ></Typography>
                  <Button
                    type="submit"
                    variant="contained"
                    style={{
                      background: '#FFD600', // Pink button
                      color: 'rgb(0, 0, 0)',
                      marginTop: '20px',
                      borderRadius: '8px',
                    }}
                    fullWidth
                  >
                    {isSignup ? 'Sign Up' : 'Sign In'}
                  </Button>
                  <Box textAlign="center" mt={2}>
                    <Button
                      onClick={handleSignUp_In}
                      style={{ textTransform: 'none', color: '#FF4081' }}
                    >
                      {isSignup ? 'Already have an account? Sign In' : 'Create an account'}
                    </Button>
                  </Box>
                </form>
              </motion.div>
            </Card>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}

export default AuthPage;