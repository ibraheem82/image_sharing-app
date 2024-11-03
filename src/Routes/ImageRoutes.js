import { Router } from "express";
import { v2 as cloudinary } from 'cloudinary';
import Image from "../../Model/ImageModel.js";


const imageRoute = Router();


/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a new image
 *     tags: [images]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Image was successfully uploaded
 *       400:
 *         description: Image was not provided
 *       500:
 *         description: Server Error
 */


imageRoute.post("/upload", async (req, res) => {
    try {
        const { image, title } = req.body;

        if (!image) {
            return res.status(400).json({ message: "Image not found" });
        }

        // Function to validate base64 image format directly from the image string
        const validateBase64Image = (image) => {
            const formats = {
                jpeg: "data:image/jpeg;base64,",
                png: "data:image/png;base64,"
            };

            // Check if image starts with any valid format prefix

            // Object.values(formats) retrieves an array of the values from the formats object, which contains the valid base64 prefixes for images (in this case, ["data:image/jpeg;base64,", "data:image/png;base64,"]).
            for (const prefix of Object.values(formats)) {

                // For each iteration, it checks if the image string begins with the current prefix using the startsWith method.
// image.startsWith(prefix) returns true if the string image starts with the specified prefix, indicating that the image format is valid and matches one of the supported formats (JPEG or PNG).
                if (image.startsWith(prefix)) {
                    return true;
                }
            }
            return false;
        };

        // Validate image format
        if (!validateBase64Image(image)) {
            return res.status(400).json({ message: "Invalid base64 image format" });
        }

        // Upload the image to Cloudinary using the upload_large method
        const result = await cloudinary.uploader.upload_large(image);

        console.log(result);

        // Save image information to the database
        await new Image({ title, imageUrl: result.secure_url, public_id: result.public_id }).save();

        res.status(200).json({ message: "Image successfully uploaded" });

    } catch (error) {
        res.status(500).json({ message: error.message || "Server error" });
    }
});


/**
 * @swagger
 * /api/allImages:
 *   get:
 *     summary: Get all images
 *     tags: [images]
 *     responses:
 *       200:
 *         description: A list of all images
 *       404:
 *         description: No images found
 *       500:
 *         description: Server Error
 */

imageRoute.get("/allImages", async (req, res) => {
    try {

        const AllImages = await Image.find()

        if (!AllImages.length) {
            return res.status(404).json({ message: "No Image not found" })
        }

        res.status(200).json(AllImages)


    } catch (error) {
        res.status(500).json({ message: error })
    }
})


/**
 * @swagger
 * /api/image/{id}:
 *   put:
 *     summary: Update image title
 *     tags: [images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: the image id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newTitle:
 *                 type: string
 *     responses:
 *       200:
 *         description: Image title updated successfully
 *       400:
 *         description: Invalid image id
 *       500:
 *         description: Server Error
 *    
 */

imageRoute.put("/image/:id", async (req, res) => {
    try {
        const id = req.params.id

        const { newTitle } = req.body

        // await Image.findByIdAndUpdate(...): This line uses Mongoose's findByIdAndUpdate method to search for the image by its ID and update its title with newTitle.
// The { new: true } option ensures that the updated document is returned, rather than the original document before the update.
        const updatedImage = await Image.findByIdAndUpdate(id, { title: newTitle }, { new: true })


        // This checks if updatedImage is null, which would mean no image was found with the provided ID. If so, it returns a 404 status code with a message indicating that the image was not found.
        if (updatedImage === null) {
            return res.status(404).json({ message: "Image not found" })
        }

        res.status(200).json({ message: "Image Title updated" })
    } catch (error) {
        res.status(500).json({ message: error })

    }
})


/**
 * @swagger
 * /api/image/{id}:
 *   delete:
 *     summary: Delete an image
 *     tags: [images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id of the image to be deleted
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       404:
 *         description: Image not found
 *       500:
 *         description: Server Error
 */

imageRoute.delete("/image/:id", async (req, res) => {
    try {

        const id = req.params.id

        const deletedImage = await Image.findByIdAndDelete(id)

        if (deletedImage === null) {
            return res.status(404).json({ message: "Image not found" })
        }


        // deletedImage.public_id is assumed to be the identifier for the image in the cloud storage, which allows for its removal.
        await cloudinary.uploader.destroy(deletedImage.public_id)

        res.status(200).json({ message: "Image deleted successfully" })

    } catch (error) {
        res.status(500).json({ message: error })

    }
})


export default imageRoute