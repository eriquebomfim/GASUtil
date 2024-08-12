
/** ===============================================================
 *             CHRON FOR GOOGLE SCRIPT
 *
 *  Creates dynamic trigger for your function. Useful when you need 
 *  synchronize execution or when you need split execution to overcome 
 *  the GAS execution timeout out
 * 
 *  @function <string> the function to call
 *  @params   <mixed>  a literal object of params
 *  @author ERIQUE BOMFIM <erique.bomfim@gmail.com>
 * 
 *  Chron.addTrigger(function, params);
 *
 *================================================================*/
var _self = this;

var Chron = {
  list:[],
  run(e){
      Chron.sync();
      let fn = Chron.list.filter(f=>f.sid == e.triggerUid)[0];
      if (fn){
        try{
          fn.params ? _self[fn.name](fn.params) : _self[fn.name]() ;
        } catch(_err){
          fn.params ? _self[fn.name](fn.params) : _self[fn.name]() ;
        }
        this.removeTrigger(fn.sid);
      }
  },
  sync(remove = false, eventId = false, triggers = false){
    if (remove){
      Chron.list =  Chron.list.filter(c=>c.sid != eventId);             // ok
      ScriptProperties.setProperty("cron",JSON.stringify(Chron.list));  // ok
      var trg = triggers.find(f=>f.getUniqueId() == eventId);
      if (trg){
          ScriptApp.deleteTrigger(trg);
      }
      return;
    }
    Chron.list =  JSON.parse(ScriptProperties.getProperty("cron")) || [];
  },
  addTrigger(fn, params = false,timer = 1){

    try{
      Chron.sync();
      var sid = ScriptApp
                .newTrigger("Chron.run")
                .timeBased()
                .after(1000 * timer)
                .create()
                .getUniqueId()

      Chron.list.push({name:fn,params:params,sid:sid});
      ScriptProperties.setProperty("cron",JSON.stringify(Chron.list));
    } catch(err){
      if(err.message.match(/many triggers/))
        Chron.removeTrigger(false,true,{functionName:fn, params: params});
    }
  
  },
  removeTrigger(eventId = false, forced = false, retry = false){

    var ss = SpreadsheetApp.getActive();
    var triggers = ScriptApp.getUserTriggers(ss);
    
    if (eventId){ Chron.sync(true, eventId, triggers); return; }

    if (!forced && Chron.list.length > 0) return;

    triggers.forEach((t,idx)=>{
      if (t.getHandlerFunction() == "Chron.run"){
        ScriptApp.deleteTrigger(t);
      }
    });
    Chron.reset();

    if (retry){
      Chron.addTrigger(retry.functionName, retry.params, 1);
    }
  },
  reset(){
    ScriptProperties.setProperty("cron",JSON.stringify([]));
  }
}