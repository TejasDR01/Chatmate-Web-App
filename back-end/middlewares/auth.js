import jwt from "jsonwebtoken";

export const auth = async (req,res,next) => {
    try{
        const token = req.headers.authorization;
        if(token){
            const decodedData = jwt.verify(token.split(" ")[1], "test");
            req.userId = decodedData?.id;
        }
        next();
    }catch(error){
        res.status(201).json(error.message);
    }
};
