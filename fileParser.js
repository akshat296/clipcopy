//requiring path and fs modules
const {
walkSync,
showAllFileList,
waitAfterOneFileShow,
waitAfterOneCodeShow,
showFile,
showCodes,
codeParser,

} = require('./codeAnalysis')
//joining path of directory 

function finder()
{
  const directoryPath = document.getElementById('folderPath').value;
  //passsing directoryPath and callback function List all files in a directory in Node.js recursively in a synchronous fashion
  showAllFileList(directoryPath);
  }

document.getElementById('finder').onclick= finder;