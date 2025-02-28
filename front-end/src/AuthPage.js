import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, TextField, Button, Typography, Box, InputAdornment, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel'
import $ from "jquery";
import { Signin, Signup } from "./api/api.js";

function AuthPage() {
  const initialState = { usrnm: "", email: "", pass: "", cpass: "" };
  const navigate = useNavigate();
  const localdata = localStorage.getItem("profile");
  const [formData, setformData] = useState(initialState);
  const [isSignup, setisSignup] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showCPass, setShowCPass] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    if (localdata) { navigate("/chats"); }
  }, [localdata, navigate]);

  const flipVariants = {
    initial: {
      rotateY: 0,
    },
    animate: {
      rotateY: 180,
    }
  };

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
        stiffness: 135, // Adjust stiffness for more/less bounce
        damping: 11, // Adjust damping for more/less bounce
        delay: 0.5, // Delay the animation slightly
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
        $("#msg").text("Username requires min 5 chars");
        $("#msg").show();
      }
      else {
        try {
          const res = await Signup(formData);
          if (res.status === 200) {
            localStorage.setItem("profile", JSON.stringify(res.data));
            navigate("/chats");
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
          localStorage.setItem("profile", JSON.stringify(res.data));
          navigate("/chats");
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
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{
          delay: index * 0.17,
          type: 'spring',
          stiffness: 150,
          damping: 8,
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

  const handleClickShowPass = () => {
    setShowPass(!showPass);
  };
  const handleClickShowCPass = () => {
    setShowCPass(!showCPass);
  };


  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : undefined,
        justifyContent: isMobile ? 'flex-start' : 'flex-end',
        alignItems: 'center',
        height: '100vh',
        background: 'rgba(255, 0, 204, 0.71)',
      }}
    >
      <Box
        style={{
          width: '100%',
          textAlign: 'center',
          marginBottom: isMobile ? '40px' : '20px',
        }}
      >
        <Typography
          variant="h3"
          style={{
            color: 'rgb(241, 241, 241)',
            fontSize: isMobile ? 'clamp(35px, 6vw, 36px)' : undefined,
          }}
        >
          {renderAnimatedText("Welcome To Chat-mate")}
        </Typography>
      </Box>

      <AnimatePresence mode="wait">
        <motion.div
          variants={hopVariants}
          initial="initial"
          animate="animate"
          style={{
            padding: isMobile ? undefined : '10%',
          }}
        >
          <motion.div
            key={isSignup ? 'signup' : 'signin'}
            variants={flipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.6 }}
            style={{
              perspective: '1000px',
            }}
          >
            <Card
              style={{
                padding: '30px',
                width: '300px',
                borderRadius: '15px',
                boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
                background: '#FFF3E0',
                transformStyle: 'preserve-3d',
              }}
            >
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
                    title="Enter a valid email id"
                    inputProps={{ pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$" }}
                    onChange={handleChange}
                    value={formData.email} />
                  <TextField
                    label="Password"
                    name="pass"
                    type={showPass ? 'text' : 'password'} // Toggle password visibility
                    fullWidth
                    required
                    margin="normal"
                    variant="outlined"
                    inputProps={isSignup ? { pattern: "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,}" } : undefined}
                    onChange={(e) => {
                      handleChange(e);
                      setPasswordValid(() => {
                        const regex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}/;
                        return regex.test(e.target.value);
                      });
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {isSignup && formData.pass && (
                            <Tooltip
                              title={
                                passwordValid
                                  ? "Password meets requirements"
                                  : "Password must contain at least 6 characters, including Upper, lowercase and numbers"
                              }
                            >
                              {passwordValid ? (
                                <CheckCircleIcon style={{ color: 'green', fontSize: '20px' }} />
                              ) : (
                                <CancelIcon style={{ color: 'rgba(227, 56, 56, 0.87)', fontSize: '20px' }} />
                              )}
                            </Tooltip>
                          )}
                          <IconButton
                            onClick={handleClickShowPass}
                            edge="end"
                            style={{ color: "rgb(129, 121, 94)" }}
                          >
                            {showPass ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    value={formData.pass} />
                  {isSignup && (
                    <TextField
                      label="Confirm Password"
                      name="cpass"
                      type={showCPass ? 'text' : 'password'}
                      fullWidth
                      required
                      margin="normal"
                      variant="outlined"
                      inputProps={{ pattern: formData.pass }}
                      onChange={(e) => {
                        handleChange(e);
                        setConfirmPasswordValid(formData.pass === e.target.value);
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {formData.cpass && (
                              <Tooltip
                                title={
                                  confirmPasswordValid
                                    ? "Passwords match"
                                    : "Passwords do not match"
                                }
                              >
                                {confirmPasswordValid ? (
                                  <CheckCircleIcon style={{ color: 'green', fontSize: '20px' }} />
                                ) : (
                                  <CancelIcon style={{ color: 'rgba(227, 56, 56, 0.87)', fontSize: '20px' }} />
                                )}
                              </Tooltip>
                            )}
                            <IconButton
                              onClick={handleClickShowCPass}
                              edge="end"
                              style={{ color: "rgb(129, 121, 94)" }}
                            >
                              {showCPass ? <Visibility /> : <VisibilityOff />}
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
                      color: 'rgba(255, 0, 0, 0.97)',
                      marginTop: '10px',
                      fontSize: '0.9rem',
                      display: 'none'
                    }}
                  ></Typography>
                  <Button
                    type="submit"
                    variant="contained"
                    style={{
                      background: '#FFD600',
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