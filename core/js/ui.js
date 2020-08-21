// General UI tools (progress bar, toast, prompt)

/// Handle progress bars
const Progress = {
  domElement : null, // the DOM element
  sticky : false, // Progress.show({..., sticky:true}) don't remove until Progress.hide({sticky:true})
  interval : undefined, // the interval used if Progress.show({percent:"animate"})
  percent : undefined, // the current progress percentage
  min : 0, // scaling for percentage
  max : 1, // scaling for percentage

  /* Show a Progress message
    Progress.show({
    sticky : bool  // keep showing text even when Progress.hide is called (unless Progress.hide({sticky:true}))
    percent : number | "animate"
    min : // minimum scale for percentage (default 0)
    max : // maximum scale for percentage (default 1)
  }) */
  show : function(options) {
    options = options||{};
    let text = options.title;
    if (options.sticky) Progress.sticky = true;
    if (options.min!==undefined) Progress.min = options.min;
    if (options.max!==undefined) Progress.max = options.max;
    let percent = options.percent;
    if (percent!==undefined)
      percent = Progress.min*100 + (Progress.max-Progress.min)*percent;
    if (!Progress.domElement) {
      if (Progress.interval) {
        clearInterval(Progress.interval);
        Progress.interval = undefined;
      }
      if (options.percent == "animate") {
        Progress.interval = setInterval(function() {
          Progress.percent += 2;
          if (Progress.percent>100) Progress.percent=0;
          Progress.show({percent:Progress.percent});
        }, 100);
        Progress.percent = percent = 0;
      }

      let toastcontainer = document.getElementById("toastcontainer");
      Progress.domElement = htmlElement(`<div class="toast">
      ${text ? `<div>${text}</div>`:``}
      <div class="bar bar-sm">
        <div class="bar-item" id="Progress.domElement" role="progressbar" style="width:${percent}%;" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
    </div>`);
      toastcontainer.append(Progress.domElement);
    } else {
      let pt=document.getElementById("Progress.domElement");
      pt.setAttribute("aria-valuenow",percent);
      pt.style.width = percent+"%";
    }
  },
  // Progress.hide({sticky:true}) undoes Progress.show({title:"title", sticky:true})
  hide : function(options) {
    options = options||{};
    if (Progress.sticky && !options.sticky)
      return;
    Progress.sticky = false;
    Progress.min = 0;
    Progress.max = 1;
    if (Progress.interval) {
      clearInterval(Progress.interval);
      Progress.interval = undefined;
    }
    if (Progress.domElement) Progress.domElement.remove();
    Progress.domElement = undefined;
  }
};

/// Add progress handler so we get nice uploads
Puck.writeProgress = function(charsSent, charsTotal) {
  if (charsSent===undefined) {
    Progress.hide();
    return;
  }
  let percent = Math.round(charsSent*100/charsTotal);
  Progress.show({percent: percent});
}

/// Show a 'toast' message for status
function showToast(message, type) {
  // toast-primary, toast-success, toast-warning or toast-error
  console.log("<TOAST>["+(type||"-")+"] "+message);
  let style = "toast-primary";
  if (type=="success")  style = "toast-success";
  else if (type=="error")  style = "toast-error";
  else if (type=="warning") style = "toast-warning";
  else if (type!==undefined) console.log("showToast: unknown toast "+type);
  let toastcontainer = document.getElementById("toastcontainer");
  let msgDiv = htmlElement(`<div class="toast ${style}"></div>`);
  msgDiv.innerHTML = message;
  toastcontainer.append(msgDiv);
  setTimeout(function() {
    msgDiv.remove();
  }, 5000);
}

/// Show a yes/no prompt
function showPrompt(title, text, buttons, shouldEscapeHtml) {
  if (!buttons) buttons={yes:1,no:1};
  if (typeof(shouldEscapeHtml) === 'undefined' || shouldEscapeHtml === null) shouldEscapeHtml = true;

  return new Promise((resolve,reject) => {
    let modal = htmlElement(`<div class="modal active">
      <!--<a href="#close" class="modal-overlay" aria-label="Close"></a>-->
      <div class="modal-container">
        <div class="modal-header">
          <a href="#close" class="btn btn-clear float-right" aria-label="Close"></a>
          <div class="modal-title h5">${escapeHtml(title)}</div>
        </div>
        <div class="modal-body">
          <div class="content">
            ${(shouldEscapeHtml) ? escapeHtml(text).replace(/\n/g,'<br/>') : text}
          </div>
        </div>
        <div class="modal-footer">
          <div class="modal-footer">
            ${buttons.yes?'<button class="btn btn-primary" isyes="1">Yes</button>':''}
            ${buttons.no?'<button class="btn" isyes="0">No</button>':''}
            ${buttons.ok?'<button class="btn" isyes="1">Ok</button>':''}
          </div>
        </div>
      </div>
    </div>`);
    document.body.append(modal);
    modal.querySelector("a[href='#close']").addEventListener("click",event => {
      event.preventDefault();
      reject("User cancelled");
      modal.remove();
    });
    htmlToArray(modal.getElementsByTagName("button")).forEach(button => {
      button.addEventListener("click",event => {
        event.preventDefault();
        let isYes = event.target.getAttribute("isyes")=="1";
        if (isYes) resolve();
        else reject("User cancelled");
        modal.remove();
      });
    });
  });
}
