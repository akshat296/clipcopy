var sql = require("mssql");
var ncp = require("copy-paste");
const clipboard = require('electron-clipboard-extended')


var dbConfig = {
    server: "1fdsa1",
    database: "fsad",
    user: "sfad1",
    password: "sfda",
    port: 1433
};

var databases = {
    'APPLIfsdaN':'fasd',
    'sfda':'fsda',
    'APPLICAsfadN':'sfad',
    'sfad.fsda': 'fsda'
}

var table = 'Companies';
clipboard
.on('text-changed', () => {
    
    let currentText = clipboard.readText();
    document.getElementById('currentClipboard').innerHTML=currentText;
    if(Object.keys(databases).includes(currentText)){
        dbConfig.database = databases[currentText];
        document.getElementById('database').innerHTML = currentText + ' - ' + dbConfig.database
    }
    else if(/^[a-zA-Z_0-9]+$/.test(currentText)){
        table = currentText;
        document.getElementById('table').innerHTML = currentText
       
    }else{

    }

    
})
.startWatching();
 

document.getElementById('executeToClip').onclick = function (){
    getData(table,dbConfig);
}
// clipboard.off('text-changed');
 
// clipboard.stopWatching();


async function getData(table, dbConfig) {
   
    try {
        let pool;
        if(table){
        pool = await sql.connect(dbConfig)
        
        
        let result1 = await pool.request()
            .input('input_parameter', sql.NVarChar, table.trim())
            .query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME =  @input_parameter")

            let l = result1.recordset.length;
            l =l - 1;
        let copyArr = result1.recordset.reduce((a,v,i)=>{
            if(i === l)
            { 
                return a + "\t" + table +"." + v.COLUMN_NAME;
            }
            else if(i === 0){
                return a + table +"." + v.COLUMN_NAME +",\n";
            }
            else{
                return a + "\t" + table +"." + v.COLUMN_NAME +",\n";
            }
           
        },'');
        /* ncp paste expects a callback in which second parameter is value */
        // document.getElementById('database').innerHTML = ncp.paste()
        ncp.copy(copyArr, function () {
            console.log('done');
          });
          document.getElementById('copiedText').innerHTML = copyArr;
          sql.close();
          
        }else{
            throw new Error('Input value of table')
        }
        
    } catch (err) {
        // ... error checks
        console.log(err,"error")
        document.getElementById('copiedText').innerHTML = err
    }
}




