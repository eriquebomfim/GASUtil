/**
 * ALTERNATIVE SSUI (SpreadSheetApp.getUI)
 * 
 * This is a workaroud to save your application after Google change
 * the way we used alert and prompts from SpreadSheetsApp.getUI on Dec. 15 2025.
 * by adding this file to your application, you override SpresheetsApp.getUI methods
 * alert and prompt, and getting hid of that annoying black toast "Working..."
 * 
 *
 * You can call alert and prompt methods this way:
 * SpreadsheetApp.getUi().alert('This is a message');
 * SpreadsheetApp.getUi().prompt('This is a prompt');
 * 
 * To use this, copy and paste this code to your project.
 *
 * Note: If you are using .alert or .prompt within the onOpen event, you will need to move this logic
 * to a trigger. From the trigger, execute your target function to ensure proper functionality.
 *
 * @author Erique Bomfim
 * version 1.0.0
 *
 */

const _ui      = SpreadsheetApp.getUi;
const giveup  = 7;

SpreadsheetApp.getUi = function(){

  const _UI = _ui();
  
  return {
    ..._UI,
    getInterface(){

    let type      = 'alert'
    let buttonSet = 'OK'
    let body      = null
    let title     = ''
    let isPrompt  = false

    const args    = arguments;

    switch(true) {
      case args.length == 2 && !args[0]:
        type = 'alert'
        body = args[1]
      break;
      case args.length == 3 && !args[0]:
        type      = 'alert'  
        body      = args[1]
        buttonSet = args[2]
      break;
      case args.length == 4 && !args[0]:
        type      = 'alert'
        title     = args[1]  
        body      = args[2]
        buttonSet = args[3]
      break;      
      case args.length == 2 && args[0] == 'prompt':
        type = args[0]
        body = args[1]
        buttonSet = 'OK_CANCEL'
        isPrompt = true
      break;      
      default:
    }

    const buttons = {
      YES:    { type: 'primary' },
      OK:     { type: 'primary' },
      NO:     { type: 'cancel' },
      CANCEL: { type: 'cancel' }
    };

    const buttonsTemplate = buttonSet
                            .toString()
                            .split('_')
                            .reduce((rdx,btn)=>{
                              let btnProps = buttons[btn];
                              rdx += `                                              
                                <button type="button" 
                                class="btn btn-${btnProps.type}" 
                                onclick="${ !isPrompt ? `handleClose('${btn}')` : `handlePrompt()`}">
                                ${btn}
                                </button>`                                
                              return rdx;                          
                            },``)


    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <base target="_top">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Segoe UI', 'Roboto', -apple-system, sans-serif;
            }
            
            body {
                background: #f8f9fa;
                color: #202124;
                padding: 24px;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }
            
            .dialog-content {
                flex: 1;
                padding: 10px 0;
            }
            
            .message {
                font-size: 14px;
                line-height: 1.5;
                color: #3c4043;
                margin-bottom: 20px;
            }
            
            .input-container {
                margin-top: 20px;
            }
            
            .input-field {
                width: 100%;
                padding: 12px 16px;
                border: 1px solid #dadce0;
                border-radius: 4px;
                font-size: 14px;
                transition: all 0.2s;
                background: white;
            }
            
            .input-field:focus {
                outline: none;
                border-color: #1a73e8;
                box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
            }
            
            .dialog-footer {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                padding-top: 10px;
                border-top: 1px solid #e8eaed;
            }
            
            .btn {
                padding: 10px 24px;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                min-width: 80px;
            }
            
            .btn-cancel {
                background: white;
                color: #5f6368;
                border: 1px solid #dadce0;
            }
            
            .btn-cancel:hover {
                background: #f8f9fa;
                border-color: #d2e3fc;
            }
            
            .btn-primary {
                background: #1a73e8;
                color: white;
                border: 1px solid #1a73e8;
            }
            
            .btn-primary:hover {
                background: #0d62d9;
                border-color: #0d62d9;
            }
            
            .btn:focus {
                outline: none;
                box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
            }
        </style>
    </head>
    <body>
        <div class="dialog-content">
            <div class="message">${body}</div>
            ${/prompt/i.test(type) ? `
                <div class="input-container">
                    <input type="text" 
                          id="dePrompt" 
                          class="input-field" 
                          placeholder="Enter your response..."
                          autocomplete="off">
                </div>
            ` : ''}
        </div>
        
        <div class="dialog-footer">
         ${ buttonsTemplate }
        </div>
        
        <script>
            function handleClose(result = true) {
                google.script.run.withSuccessHandler(function() {
                    google.script.host.close();
                }).eAlert(result);
            }

            function handlePrompt() {
                const promptText = document.getElementById('dePrompt').value;
                google.script.run.withSuccessHandler(function() {
                    google.script.host.close();
                }).ePrompt(promptText);
            }
            
            // Focus on input field for prompt dialogs
            document.addEventListener('DOMContentLoaded', function() {
                const inputField = document.getElementById('dePrompt');
                if (inputField) {
                    inputField.focus();
                    // Add enter key support
                    inputField.addEventListener('keypress', function(e) {
                        if (e.key === 'Enter') {
                            handlePrompt();
                        }
                    });
                }
            });

            function ping(){
              google.script.run.ping()
            }

            setInterval(ping,5000)
            ping()

        </script>
    </body>
    </html>
    `;
      this.render = function(){
        const output =  HtmlService.createHtmlOutput(html).setHeight(230).setWidth(350)
        SpreadsheetApp.getUi().showModalDialog(output, title || ' ')
      }
      return this
    },
    release(){
      const SP = PropertiesService.getScriptProperties()
      SP.deleteProperty('ping')
      SP.deleteProperty('eAlert')
      SP.deleteProperty('ePrompt')
    },
    hold(parameter = 'eAlert'){
      
      let e    = null;
      PropertiesService.getScriptProperties().deleteProperty('ping')

      while(!e){

        const ping  = PropertiesService.getScriptProperties().getProperty('ping')
        if (ping && (new Date().getTime() - ping * 1) > (giveup < 7 ? 7 : giveup) * 1000){
          PropertiesService.getScriptProperties().deleteProperty('ping')
          e = /prompt/i.test(parameter) ? '' : false
          break;
        }

        e = PropertiesService.getScriptProperties().getProperty(parameter)
        Utilities.sleep(500)
      }
      this.release();
      return e
    },
    prompt(){
      this.getInterface('prompt',...arguments).render()
      const result = this.hold('ePrompt') || ''
      return {
        result,
        getResponseText(){
          return this.result
        }
      }
    },
    alert(){
      this.getInterface(undefined,...arguments).render()
      let response = this.hold()
      switch(true){
        case /cancel/i.test(response):
          return _UI.Button.CANCEL
        break;
        case /no/i.test(response):
          return _UI.Button.NO
        break;
        case /ok/i.test(response):
          return _UI.Button.OK   
        break;
        case /yes/i.test(response):
          return _UI.Button.YES
        break;
        default:
      }
    }
  }
}

function ping(){
  const now = new Date().getTime()
  PropertiesService.getScriptProperties().setProperty('ping',now)
}

function eAlert(result = true){
  PropertiesService.getScriptProperties().setProperty('eAlert',result)
  return true
}

function ePrompt(result = null){
  PropertiesService.getScriptProperties().setProperty('ePrompt',result)
  return true  
}