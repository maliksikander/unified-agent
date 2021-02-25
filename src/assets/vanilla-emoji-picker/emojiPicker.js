class EmojiPicker {
  constructor() {
    this.initiate();
  }

  initiate() {
    const emojiInputs = document.querySelectorAll('[data-emoji-picker="true"]');

    emojiInputs.forEach(element => {
      this.generateElements(element);
    });
  }

  generateElements(emojiInput) {
    const clickLink = event => {
      event.preventDefault();
      var caretPos = emojiInput.selectionStart;
      emojiInput.value =
        emojiInput.value.substring(0, caretPos) +
        " " +
        event.target.innerHTML +
        emojiInput.value.substring(caretPos);
      emojiPicker.style.display = "none";
      emojiInput.focus();

      //trigger ng-change for angular
      if (typeof angular !== "undefined") {
        angular.element(emojiInput).triggerHandler("change");
      }
    };

    emojiInput.style.width = "100%";

    const emojiContainer = document.createElement("div");
    emojiContainer.style.position = "relative";

    const parent = emojiInput.parentNode;
    parent.replaceChild(emojiContainer, emojiInput);
    emojiContainer.appendChild(emojiInput);

    const emojiPicker = document.createElement("div");
    emojiPicker.tabIndex = 0;

    emojiPicker.addEventListener(
      "blur",
      function(event) {
        emojiPicker.style.display = "none";
      },
      false
    );

    emojiPicker.id = "EmojiLink";
    emojiPicker.style.position = "absolute";
    emojiPicker.style.left = "2px";
    emojiPicker.style.outline = "none";
    emojiPicker.style.top = "-200px";
    emojiPicker.style.zIndex = "9";
    emojiPicker.style.display = "none";
    emojiPicker.style.width = "232px";
    emojiPicker.style.padding = "7px 7px 7px 7px";
    emojiPicker.style.marginTop = "5px";
    emojiPicker.style.overflow = "hidden";
    emojiPicker.style.background = "#fff";
    emojiPicker.style.height = "200px";
    emojiPicker.style.overflowY = "auto";
    emojiPicker.style.boxShadow = "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)";
    emojiPicker.style.borderRadius = "2px;";

    var emojiTrigger = document.createElement("a");
    emojiTrigger.style.position = "absolute";
    emojiTrigger.style.top = "16px";
    emojiTrigger.style.left = "10px";
    emojiTrigger.style.textDecoration = "none";
    emojiTrigger.setAttribute("href", "javascript:void(0)");
    emojiTrigger.innerHTML = '<i class="material-icons">sentiment_satisfied_alt</i>';
    emojiTrigger.classList.add('emoji-trigger');
    emojiTrigger.onclick = () => {
      if (emojiPicker.style.display === "none") {
        emojiPicker.style.display = "block";
      }
      emojiPicker.focus();
    };

    emojiContainer.appendChild(emojiTrigger);

    const emojiList = document.createElement("ul");
    emojiList.style.padding = "0";
    emojiList.style.margin = "0";
    emojiList.style.listStyle = "none";

    var emojis = [0x1f600, 0x1f603, 0x1f604, 0x1f601, 0x1f606, 0x1f605, 0x1f923, 0x1f602, 0x1f642, 0x1f643, 0x1f609, 0x1f60a, 0x1f607, 0x1f60d, 0x1f929, 0x1f618, 0x1f617, 0x1f61a, 0x1f619, 0x1f60b, 0x1f61b, 0x1f61c, 0x1f92a, 0x1f61d, 0x1f911, 0x1f917, 0x1f92d, 0x1f92b, 0x1f914, 0x1f910, 0x1f928, 0x1f610, 0x1f611, 0x1f636, 0x1f60f, 0x1f612, 0x1f607, 0x1f62c, 0x1f925, 0x1f60c, 0x1f614, 0x1f62a, 0x1f924, 0x1f634, 0x1f615, 0x1f61F, 0x1f641, 0x1f62e, 0x1f62f, 0x1f632, 0x1f633, 0x1f626, 0x1f627, 0x1f628, 0x1f630, 0x1f625, 0x1f622, 0x1f62d, 0x1f631, 0x1f616, 0x1f623, 0x1f61e];


    emojis.map(function (item) {
      var emojiLi = document.createElement("li");
      emojiLi.style.display = "inline-block";
      emojiLi.style.margin = "5px";

      var emojiLink = document.createElement("a");
      emojiLink.style.textDecoration = "none";
      emojiLink.style.margin = "5px";
      emojiLink.style.position = "initial";
      emojiLink.style.fontSize = "24px";
      emojiLink.style.width = "30px";
      emojiLink.style.display = "inline-block";
      emojiLink.style.textAlign = "center";
      emojiLink.setAttribute("href", "javascript:void(0)");
      emojiLink.innerHTML = String.fromCodePoint(item);
      emojiLink.onmousedown = clickLink;

      emojiList.appendChild(emojiLink);
    });

    emojiPicker.appendChild(emojiList);
    emojiContainer.appendChild(emojiPicker);
    return EmojiPicker;
    module.exports = EmojiPicker;
  }

}

