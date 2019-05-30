var sql = require("mssql");

var dbConfig = {
    server: "asfd",
    database: "asfdf",
    user: "asfd",
    password: "asfdfsdfdasf!",
    port: 1433
};

var databases = {
    'APfsadfN':'asfd',
    'APPLIsafdtsDSN':'fasdf',
    'fasd.fasd':'asfdf',
    'safd.sfad': 'asfd'
}

 async function getCols(dbKey,table){
    var valid = [];
    if(Object.keys(databases).includes(dbKey)){
        dbConfig.database = databases[dbKey];
        document.getElementById('database').innerHTML =  dbKey + ' - ' + dbConfig.database;
        valid.push(true);
        
    }
    if(/^[a-zA-Z_0-9]+$/.test(table)){
       
        document.getElementById('table').innerHTML = table
        valid.push(true);
    }  
    if(valid.length === 2){
        return await getData(table,dbConfig);
    }

  
}

 

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
        
         await sql.close();
         return copyArr;
          
        }else{
            throw new Error('Input value of table');
        }
        
    } catch (err) {
        // ... error checks
        throw new Error('Some Error Occurred');
    }
}

module.exports = {
    getCols
};


