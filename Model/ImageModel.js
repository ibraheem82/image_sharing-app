import mongoose from "mongoose";

const { Schema } = mongoose

const ImageSchema = new Schema({
    title: String,
    imageUrl: String,
    public_id: String, // should be automatecally generated when uploading image to cloudinary.
})


const Image = mongoose.model('ImageCollection', ImageSchema)


export default Image