import React, { useState } from 'react';
import axios from 'axios';

// const form = document.querySelector('form');

function App() {

  const [postContent, setPostContent] = useState(''); 

  const postMultipleFiles = async (filelist) => {
    const formData = new FormData();
    for(let i =0; i < filelist.length; i++) {
      const file = filelist[i];
      formData.append("files", file)
    }
    try {
      const result = await axios.post("/multifiles", formData);
      console.log(result.data);
      setPostContent(result.data)
      // resultText.value = result.data
    } catch (error) {
      console.error(error);
    } 
  }

  return (
    <div>
      <input type="file" multiple onChange={(event) => {
        const filelist = event.target.files;
        postMultipleFiles(filelist)
      }}></input>
      <textarea value={postContent} width="300" height="1000" id="resultText" placeholder='Your text will appear here'></textarea>
    </div>
  );
}

export default App;


