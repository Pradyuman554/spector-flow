import cloudinary from "cloudinary";

import { GoogleGenerativeAI } from "@google/generative-ai";
// import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// async function fileToGenerativePart(file) {
//   const base64EncodedDataPromise = new Promise((resolve) => {
//     const reader = new FileReader();
//     reader.onloadend = () => resolve(reader.result.split(',')[1]);
//     reader.readAsDataURL(file);
//   });
//   return {
//     inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
//   };
// }

async function urlToGenerativePart(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const mimeType = response.headers["content-type"];
  const buffer = Buffer.from(response.data, "binary").toString("base64");
  return {
    inlineData: {
      data: buffer,
      mimeType
    }
  };
}

  

const geminiRes = async (req,res) => {
    try {
      
      // const{website,image}=req.body
        
      
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const {image} = req.files

        const cloudinaryRes = await cloudinary.uploader.upload(
          image.tempFilePath,{
            folder: 'darkPattern'
          }
      )
    
      
      if(!cloudinaryRes||cloudinaryRes.error){
        return res.json({
          success:false,
          message:"error from cloudinary",
          error:cloudinaryRes.error
        })
      }
      
      const imageUrl = cloudinaryRes.secure_url;
    

        const prompt = "What's this picture?";




        // const fileInputEl = `D:/R/web dev vs coding/spector-flow/spector-flow/backend/assets/image.png`;
        // const imageParts = await Promise.all(
        //   // [...fileInputEl.files].map(fileToGenerativePart)
        //   fileInputEl
        // );
      
        // const result = await model.generateContent([prompt, ...imageParts]);
        // const response = await result.response;
        // const text = response.text();
        // console.log(text);
      
        const imageParts = await urlToGenerativePart(imageUrl);
  
        // const result = await model.generateContent([prompt, image]);
        const result = await model.generateContent([prompt, imageParts]);
        const response = await result.response;
        const text = response.text();
        res.status(200).json({
            success: true,
            message: text
        });



    } catch (error) {
        res.status(500).json({
            success: false,
            message:" error while generating response from gemini",
            error:error.message
        });
        
    }
}


export default geminiRes



