const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require("pdf-parse");
const fs = require('fs')
const WordExtractor = require("word-extractor");

const app = express();
app.use(cors()); // Allow request from any IP

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "files");
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  });

const upload = multer({ storage });

app.post('/multifiles', upload.array("files"), async function(req, res) {

    const extractor = new WordExtractor();
    const files = req.files;

    if (Array.isArray(files) && files.length > 0) {
        const getTextFromFile = async (file) => {
            let text = ""
            if (file.mimetype == "application/pdf"){
                let dataBuffer = fs.readFileSync(file.path);
                await pdfParse(dataBuffer).then(data => {
                    text = data.text
                })
            };
            if (file.mimetype == "application/msword" || file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                let dataBuffer = extractor.extract(file.path)
                await dataBuffer.then(doc => {
                    text = doc.getBody();
                })
            }
            return text;
        }
        let extractedWords = [];
        for (let i =0; i < files.length; i++) {
            const file = files[Object.keys(req.files)[i]]
            let text = await getTextFromFile(file)
            extractedWords.push(text)
        }
        console.log("final words is here: ", extractedWords)
        
        let finalString = ""
        for (content of extractedWords) {
            // feed content into LLM for summary
            finalString += content
        }
        res.send(finalString)
        // res.send(extractedWords[0])
        // res.json(files)
    } else {
        throw new Error("File upload unsucessful")
    }
 });

app.listen(8000, () => {console.log("Server started on port 8000")});
