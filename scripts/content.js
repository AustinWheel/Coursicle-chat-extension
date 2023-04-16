var chat = 'default'
var username = 'default'
var pfpURL = 'default'
var chats = 'default'


chats = getUserChats()
chat = chats[chats.length-1]
var last_chat = chat
initializeUI(chats)
username = document.getElementById('username').textContent
pfpURL = document.getElementById('userPicture').getAttribute('src')
processData()
getUserChats()
setFormListener()
setChatListener()




function setChat() {
    var prevChat = document.getElementById(last_chat)
    var curChat = document.getElementById(chat)
    prevChat.style.backgroundColor = ""
    curChat.style.backgroundColor = "rgb(203, 236, 247, 0.4)"
    last_chat = chat
}

function updateChatGroup(group) {
    chat = group
    processData()
}


function setChatListener() {
    const chatButtons = document.getElementsByClassName('channel-item')
    for (let i = 0; i < chatButtons.length; i++) {
      chatButtons[i].addEventListener('click', function() {
        const group = chatButtons[i].textContent
        updateChatGroup(group)
        setChat()
      })
    }
  }

function getUserChats() {
    const allItems = document.getElementsByClassName('subjectAndNumberTag');
    const uniqueTexts = [];
    for (let i = 0; i < allItems.length; i++) {
    const itemText = allItems[i].textContent;
    if (!uniqueTexts.includes(itemText)) {
        uniqueTexts.push(itemText);
        }
    }
    return uniqueTexts;
}

function updateMessages(data) {
    if (data == 'empty') {
        console.log("DATA WAS EMPTY")
        const messageDiv = document.getElementsByClassName("messages-container")[0];
        messageDiv.innerHTML = '';
        const noMsgDiv = document.createElement('div')
        noMsgDiv.className = 'no-msg-div'
        noMsgDiv.textContent = 'No Messages for this chat yet! Be the first to say something!'
        messageDiv.appendChild(noMsgDiv)
        const noMsgDiv1 = document.createElement('div')
        noMsgDiv1.className = 'no-msg-div'
        noMsgDiv1.textContent = "You can refresh the page to see chats for classes you've added to your calendar!"
        messageDiv.appendChild(noMsgDiv1)
    } else {
        console.log("DATA:", data)
        const messageDiv = document.getElementsByClassName("messages-container")[0];
        messageDiv.innerHTML = '';
        for (let i = 0; i < data.length; i++) {
            if (data[i][0] == username) {
            const addMsg = document.createElement('div')
            addMsg.className = 'message-pool-i'

            const infoDiv = document.createElement('div')
            infoDiv.className = 'info-div-i'

            const pImg = document.createElement('img')
            pImg.setAttribute('src', data[i][2])
            pImg.className = 'profile-img-i'

            const uInfo = document.createElement('p')
            uInfo.textContent = data[i][0]
            uInfo.className = 'user-info-i'

            infoDiv.appendChild(pImg)
            infoDiv.appendChild(uInfo)

            const msgDiv = document.createElement('p')
            msgDiv.className = 'message-i'
            msgDiv.textContent = data[i][1]

            addMsg.appendChild(infoDiv)
            addMsg.appendChild(msgDiv)
            messageDiv.appendChild(addMsg)
            } else if (data[i][0]) {
                const addMsg = document.createElement('div')
                addMsg.className = 'message-pool'

                const infoDiv = document.createElement('div')
                infoDiv.className = 'info-div'
    
                const pImg = document.createElement('img')
                pImg.setAttribute('src', data[i][2])
                pImg.className = 'profile-img'
    
                const uInfo = document.createElement('p')
                uInfo.textContent = data[i][0]
                uInfo.className = 'user-info'
    
                infoDiv.appendChild(pImg)
                infoDiv.appendChild(uInfo)
    
                const msgDiv = document.createElement('p')
                msgDiv.className = 'message'
                msgDiv.textContent = data[i][1]
    
                addMsg.appendChild(infoDiv)
                addMsg.appendChild(msgDiv)
                messageDiv.appendChild(addMsg)
            }
        } 
        messageDiv.scrollTop = messageDiv.scrollHeight;
    }
}

async function processData() {
    const data = await getMessages();
    updateMessages(data);
}

async function getMessages() {
    return new Promise((resolve, reject) => {
        const curChat = chat;
        chrome.runtime.sendMessage({command: "fetch", category: 'msg', chat: curChat}, (response) => {
            console.log('success');
            if (response.data) {
                let data = response.data;
                data = data.split("{$}");
                console.log(data);
                for (let i = 0; i < data.length; i++) {
                    let blob = data[i];
                    blob = blob.split("|");
                    data[i] = blob;
                }
                console.log("DATA PIPELINE(getMessages): ", data);
                resolve(data);
            } else {
                console.log("DATA PIPELINE(getMessages): Error in background");
                resolve('empty');
            }
        });
    });
}

function setFormListener() {
    const messageForm = document.querySelector('#message-form'); // get the form element

    messageForm.addEventListener('submit', function(event) {
        event.preventDefault(); // prevent the default form submission behavior
        
        // get the input element
        const messageInput = document.querySelector('.message-input');

        // get the value of the input
        const messageText = messageInput.value;
        const curUser = username
        const curPfp = pfpURL
        const curChat = chat

        chrome.runtime.sendMessage({command: 'post', category: 'msg', msg: messageText, user: curUser, pfp: curPfp, chat: curChat}, (response) => {
            console.log(response.result)
        })

        processData()

        messageInput.value = ''; // clear the input field
    });
}


function initializeUI(groups) {
    
    const page = document.querySelector("body")
    if (page) {
        // Main container
        const body = document.createElement("div");
        body.className = "content-container"
        

        // Channel side pannel
        const channelGroup = document.createElement("div")
        channelGroup.className = "channel-sidebar"
        

        // Msg right side group:
        const msgGroup = document.createElement("div")
        msgGroup.className = "message-div"

        //form div:
        const formDiv = document.createElement('div')
        formDiv.className = 'form-div'

        // type form view:
        const form = document.createElement("form")
        form.className = "message-form"
        form.id = 'message-form'

        // input msg
        const input = document.createElement("input")
        input.type = "text";
        input.placeholder = "Type your message here..."
        input.className = "message-input"

        //post button
        const button = document.createElement("button")
        button.className = "message-button"
        button.type = "submit"


        form.appendChild(input)
        form.appendChild(button)

        formDiv.appendChild(form)

        groups.forEach((group) => {
            if (group) {
            let newChat = document.createElement("button")
            newChat.id = group
            newChat.className = 'channel-item'
            newChat.textContent = group
            channelGroup.appendChild(newChat)
            if (group == chat) { newChat.style.backgroundColor = "rgb(203, 236, 247, 0.4)" }

            }
        })

        // Button:
        const newGroup = document.createElement("button");
        newGroup.textContent = "Your Chats";
        newGroup.className = "new-channel"

        const messages = document.createElement("div")
        messages.className = 'messages-container'

        msgGroup.appendChild(messages)

        msgGroup.appendChild(formDiv)
        channelGroup.appendChild(newGroup)

        body.appendChild(channelGroup)
        body.appendChild(msgGroup)

        page.insertAdjacentElement("afterend", body)
    }
}