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
 * @author Erique Bomfim
 * version 1.0.0
 */

const ui      = SpreadsheetApp.getUi;
const giveup  = 7;

SpreadsheetApp.getUi = function(){

  const UI = ui();
  
  return {
    ...UI,
    getInterface(){

    const args = arguments;

    switch(true) {
      case args.length == 2 && !args[0]:
        var type = 'alert'
        var body = args[1]
      break;
      case args.length == 3 && !args[0]:
        var type  = 'alert'
        var title = args[1]  
        var body = args[2]
      break;
      case args.length == 4 && !args[0]:
        var type  = 'alert'
        var title = args[1]  
        var body  = args[2]
      break;      
      case args.length == 2 && args[0] == 'prompt':
        var type = args[0]
        var body = args[1]
      break;      
      default:
    }

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
              <button type="button" 
                      class="btn btn-cancel" 
                      onclick="handleClose(false)">
                  Cancel
              </button>
            ${/alert/i.test(type) ? `
                <button type="button" 
                        class="btn btn-primary" 
                        onclick="handleClose(true)">
                    OK
                </button>
            ` : `          
                <button type="button" 
                        class="btn btn-primary" 
                        onclick="handlePrompt()">
                    OK
                </button>
            `}
        </div>
        
        <script>
            function handleClose(result = true) {
               ${ type == 'prompt' 
               ? `
                handlePrompt();
                return true
               ` 
               :'' 
               }
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

            setInterval(function(){
              google.script.run.ping()
            },5000)

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
    hold(parameter = 'eAlert'){
      let e    = null;
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
      return e
    },
    prompt(){
      PropertiesService.getScriptProperties().deleteProperty('ePrompt')
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
      PropertiesService.getScriptProperties().deleteProperty('eAlert')
      this.getInterface(undefined,...arguments).render()
      return this.hold()
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
