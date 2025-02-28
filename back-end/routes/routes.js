import express from "express";
import chatMessage from "../models/chat.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.status(200).send("testing");
});

router.get("/chats", auth, async (req, res) => {
  try {
    if (!req.userId) res.status(201).json({ message: "Unauthenticated" });
    const chats = await chatMessage.find().sort({ date: 1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/signin", async (req, res) => {
  const { email, pass } = req.body;
  try {
    const data = await User.findOne({ email });
    if (data !== null) {
      const ispasscorrect = await bcrypt.compare(pass, data.password);
      if (!ispasscorrect)
        res.status(404).json({ message: "invalid password !!" });
      else {
        const token = jwt.sign({ email: data.email, id: data._id }, "test", {
          expiresIn: "3h",
        });
        res.status(200).json({ result: data, token });
      }
    } else {
      res.status(404).json({ message: "invalid username !!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/signup", async (req, res) => {
  const { usrnm, email, pass, cpass } = req.body;
  try {
    var data = await User.findOne({ username: usrnm });
    if (data !== null) {
      res.status(201).json({ message: "Username not availaible !!" });
      return;
    }
    data = await User.findOne({ email });
    if (data !== null) {
      res.status(201).json({ message: "Email address already registered !!" });
      return;
    }
    else {
      const hashed_pass = await bcrypt.hash(pass, 12);
      const newUser = new User({
        username: usrnm,
        email,
        password: hashed_pass,
      });
      await newUser.save();
      const token = jwt.sign(
        { email: newUser.email, id: newUser._id },
        "test",
        {
          expiresIn: "3h",
        }
      );
      res.status(200).json({ result: newUser, token });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
