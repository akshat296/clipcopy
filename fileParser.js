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
        : (file.slice(-4) === '.cfm' && filelist.concat(path.join(dir, file))) || filelist;
  
    });
  return filelist;
  }
  filesList = walkSync(directoryPath);
  //filesList = ['C:\\opalsUtility\\coldfusion\\folder2\\folder4\\abc.cfm']
  let strFilesList = filesList.reduce((a,v,i)=>a + v + "\n",'');
  //strlist = "C:\\opalsUtility\\coldfusion\\folder2\\folder4\\abc.cfm"
  document.getElementById('files').innerHTML = strFilesList;

  var codeAnalysis = {
    codeParser : function(contents){
      var regexForCfquery = RegExp('<cfquery[^>].*?<\s*\/\s*cfquery>','isg');
      let arrOfCfquery = contents.match(regexForCfquery)
      return arrOfCfquery || [];
    }
  }
 

  async function waitter(arrOfCfquery,idx){
    await arrOfCfquery.reduce(async (a,query,i)=>{
      const workers =  (q,id) => new Promise((res,rej)=>{
        setTimeout(()=>{
        document.getElementById('code').innerHTML = query.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        console.log(q);
        res(1)
        },10*(idx*100)*i)
      });
      
     
       
       await workers(query,i)
       await a;
    
    },Promise.resolve(1))
  }


  
  filesList.reduce(async (a,file,i)=>{
    
     await waitter(["1 file:"+i.toString(),"2","3","4"],i);





    // let contents;
    // contents = await a;
   
    
    // if(contents){
    //   let arrOfCfquery = codeAnalysis.codeParser(contents);
    //   if(contents === "init"){
    //     time = 0;
    //     return Promise.resolve(file)
    //   }
    //   else{
    //     time = arrOfCfquery.length
    //     await waitter(arrOfCfquery);
    //     const fileWorker = (file) => new Promise((res,rej)=>{
    //       setTimeout(()=>{
    //       //replacedFile()
    //       fs.readFile(file, 'utf8', function(err,data){
    //         if(err){
    //           rej(err);
    //         }
    //         document.getElementById('fileName').innerHTML = "<span style='font-weight:bold'>Current File: </span>"+file;
    //         res(data);
            
    //       });
  
         
    //       },1000*time);
    //   });
    //   return fileWorker(file); 
    //   }
     
     
    // }
    
    //
    }
    ,Promise.resolve("init"));
}

document.getElementById('finder').onclick= finder;