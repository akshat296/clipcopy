const path = require('path');
const fs = require('fs');
const getColumnsFromDb = require('./databases');

var codeChanged = [
  {
    file:'',
    queryChanged:'',
    queryOriginal:''
  }
]

var codeAnalysis = {
    walkSync: (dir, filelist = []) => {
      fs.readdirSync(dir).forEach(file => {
        filelist = fs.statSync(path.join(dir, file)).isDirectory()
          ? codeAnalysis.walkSync(path.join(dir, file), filelist)
          : (file.slice(-4) === '.cfm' && filelist.concat(path.join(dir, file))) || filelist;
    
      });
    return filelist;
    },

    showAllFileList: (directoryPath) => {
      let filesList = codeAnalysis.walkSync(directoryPath);
       /** Hack for last file */  
       filesList.push('C:\\opalsUtility\\dummy.txt')
      let strFilesList = filesList.reduce((a,v,i)=>a + v + "\n",'');
      document.getElementById('files').innerHTML = strFilesList;
      codeAnalysis.showFile(filesList)
    },

    waitAfterOneFileShow: (file) => new Promise((res,rej)=>{
      setTimeout(()=>{
      //replacedFile()
      fs.readFile(file, 'utf8', function(err,data){
        if(err){
          rej(err);
        }
        document.getElementById('fileName').innerHTML = "<span style='font-weight:bold'>Current File: </span>"+file;
        res(data);
      });
      },1500);
    }),

    waitAfterOneCodeShow: (query) => new Promise((res,rej)=>{
      setTimeout(()=>{
      document.getElementById('code').innerHTML = query.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      res(1)
      },1000)
     
    }),

    showFile: (filesList)=>{
      filesList.reduce(async (acc,file)=>{
        let contents = await acc;
        let arrOfCfquery = codeAnalysis.codeParser(contents);
        await codeAnalysis.showCodes(arrOfCfquery);
        return codeAnalysis.waitAfterOneFileShow(file)
        },Promise.resolve("init"));
    },
    showCodes: async (arrOfCfquery,file) =>{
        await arrOfCfquery.reduce(async (acc,query,i)=>{
        await acc;
        await codeAnalysis.waitAfterOneCodeShow(query);
        //await codeAnalysis.changeCode(query,file);
      },Promise.resolve("init"))
    },
    codeParser: (contents)=>{
      let arrOfCfquery = (contents.match(/<cfquery\s*(name=[\"\']{0,1}[#]{0,1}[A-Za-z0-9_.]{0,}[#]{0,1}[\"\']{0,1}|)\s*(datasource=[\"\']{0,1}[#]{0,1}[A-Za-z0-9_.]{0,}[#]{0,1}[\"\']{0,1}|)>\s*select.*?<\s*\/\s*cfquery>/gis) || []).filter( v => v.indexOf('group')===-1 && v.indexOf('*')>=0);
     // console.log(arrOfCfquery,"re")
      arrOfCfquery.forEach(v=>{
        codeAnalysis.modifiyCode(v)
      });
      return arrOfCfquery;
    },
    modifiyCode: async (contents)=>{
      let groupMatch = /<cfquery\s*(name=[\"\']{0,1}[#]{0,1}[A-Za-z0-9_.]{0,}[#]{0,1}[\"\']{0,1}|)\s*(datasource=[\"\']{0,1}[#]{0,1}([A-Za-z0-9_.]{0,})[#]{0,1}[\"\']{0,1}|)>\s*select ((.*|)\*).*from\s+([a-zA-Z0-9]{1,}).*<\s*\/\s*cfquery>/gis.exec(contents)
      console.log(groupMatch,"Group Match");

      // 3 for database
      // 4 tables
      // 6 for star tables
      var db = {
        database: groupMatch[3],
        table: groupMatch[4],
        starTable: groupMatch[6]
      }
      let tables;
      if(groupMatch.length>0){
        if(db.database && db.table && db.starTable){
          if(db.table === "*"){
            await getColumnsFromDb.getCols(db.database, db.table)
          }
          else{
            tables = db.table.split(",");
            tables.forEach(async tbl =>{
              if(tbl.indexOf("*")!==-1){
                

                tbl = tbl.subString(0, oldStr.length-2);
                await getColumnsFromDb.getCols(db.database, tbl)
              }
            })
          }
          
        }
      
      }
      return groupMatch;

    },
    writeCode: (query)=>{

      
    }
  }

  module.exports = codeAnalysis;