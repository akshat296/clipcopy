//requiring path and fs modules
const path = require('path');
const fs = require('fs');
//joining path of directory 

function finder(){
const directoryPath = document.getElementById('folderPath').value;
//passsing directoryPath and callback function// List all files in a directory in Node.js recursively in a synchronous fashion
let filesList;
const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
  
      filelist = fs.statSync(path.join(dir, file)).isDirectory()
        ? walkSync(path.join(dir, file), filelist)
        : filelist.concat(path.join(dir, file));
  
    });
  return filelist;
  }
  filesList = walkSync(directoryPath);
  let strFilesList = filesList.reduce((a,v,i)=>a+v+"\n",'');

  document.getElementById('files').innerHTML = strFilesList;
  let contents;
  filesList.forEach((v)=>{
    contents = fs.readFileSync(v, 'utf8');
    setTimeout(()=>{
        document.getElementById('code').innerHTML = contents.replace(/&/g, '&amp;').replace(/</g, '&lt;').match('/<\s*a[^>]*>(.*?)<\s*/\s*a>/g')[0];
    },2000)


  })

}

document.getElementById('finder').onclick= finder;