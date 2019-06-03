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
      filesList.splice(2);
      filesList.reduce(async (acc,file)=>{
        let contents = await acc;
        let arrOfCfquery = codeAnalysis.codeParser(contents);
        await codeAnalysis.showCodes(arrOfCfquery,filesList[0]);
        return codeAnalysis.waitAfterOneFileShow(file)
        },
        Promise.resolve("init"));
    },
    showCodes: async (arrOfCfquery,file) =>{
        await arrOfCfquery.reduce(async (acc,query,i)=>{
        await acc;
        await codeAnalysis.waitAfterOneCodeShow(query);
        //await codeAnalysis.changeCode(query,file);
        await codeAnalysis.getColsAndModify(query,file);
      },Promise.resolve("init"))
    },
    codeParser: (contents)=>{
      let arrOfCfquery = (contents.match(/<cfquery\s*(name=[\"\']{0,1}[#]{0,1}[A-Za-z0-9_.]{0,}[#]{0,1}[\"\']{0,1}|)\s*(datasource=[\"\']{0,1}[#]{0,1}[A-Za-z0-9_.]{0,}[#]{0,1}[\"\']{0,1}|)>\s*select.*?<\s*\/\s*cfquery>/gis) || []).filter( v => v.indexOf('group')===-1 && v.indexOf('*')>=0);
      return arrOfCfquery;
    },
    getColsAndModify: async (contents,file)=>{
      let groupMatch = /<cfquery\s*(name=[\"\']{0,1}[#]{0,1}[A-Za-z0-9_.]{0,}[#]{0,1}[\"\']{0,1}|)\s*(datasource=[\"\']{0,1}[#]{0,1}([A-Za-z0-9_.]{0,})[#]{0,1}[\"\']{0,1}|)>\s*select ((.*|)\*).*from\s+([a-zA-Z0-9]{1,}).*<\s*\/\s*cfquery>/gis.exec(contents)
     // console.log(groupMatch,"Group Match");

      // 3 for database
      // 4 tables
      // 6 for star tables
      if(groupMatch != null){
        var db = {
          database: groupMatch[3],
          table: groupMatch[4],
          starTable: groupMatch[6]
        }
        let cols = ''; 
        let tables;
        if(groupMatch.length>0){
          if(db.database && db.table && db.starTable){
            if(db.table === "*"){
              cols = await getColumnsFromDb.getCols(db.database, db.table)
              await codeAnalysis.modifyCode(contents,cols,'star',file)
            }
            else{
              tables = db.table.split(",");
              tables.forEach(async tbl =>{
                if(tbl.indexOf("*")!==-1){
                  
                  tbl = tbl.substring(0, tbl.length-2);

                  cols = await getColumnsFromDb.getCols(db.database, tbl);
                  codeAnalysis.modifyCode(contents,cols,'nostar',file,tbl)
                }
              });
            }
           
          }
        }
      }
      
      return groupMatch;

    },
    modifyCode: (contents,cols,type,file,tbl) => {
      if(cols && contents && type){
        if(type === 'star'){
          let result = fs.readFileSync(file, 'utf8');
          var newContents = contents.replace('*',cols)
          result = result.replace(contents, newContents);
          
          fs.writeFileSync(file, result, 'utf8')
        }
        if(type === 'nostar'){
            let result = fs.readFileSync(file, 'utf8');
            var newContents = contents.replace(tbl+'.*',cols)
            result = result.replace(contents, newContents);
            fs.writeFileSync(file, result, 'utf8')
        }
      }
    }
  }

  module.exports = codeAnalysis;