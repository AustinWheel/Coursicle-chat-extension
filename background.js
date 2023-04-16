
var config = {
  // <YOUR CONFIG INFO>
};
firebase.initializeApp(config);

var db = firebase.firestore();

chrome.runtime.onMessage.addListener((msg, sender, resp) => {
  // We can either fetch the groups, or we can fetch the messages
  if (msg.command == "fetch"){

    // When we requests the groups:
    // 1. create [] to store all the groups
    // 2. add all the names of those groups into our response [].
    if (msg.category == "group") {
      var response = ""
      db.collection('groups').get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc)=> {
          response += doc.data().name + "{$}";
        })
        resp({ group: response })
      })
    }

    if (msg.category == "msg") {
      var response = ""
      console.log("DATA PIPELINE(background):Messages requested for group:", msg.chat);
      db.collection(msg.chat).orderBy('createdAt', 'asc')
      .get()
      .then((querySnapshot)=> {
        querySnapshot.forEach((item)=> {
          response += item.data().user + "|" + item.data().message + "|" + item.data().pfp + "{$}"
        })
        console.log("DATA PIPELINE(background): data to return to getMessages():", response)
        resp({ data: response})
      })
    }
  }

  if (msg.command == "post"){
    if (msg.category == "msg") {
      console.log("Messages requested for group:", msg.chat);
      db.collection(msg.chat).add({
        user: msg.user,
        chat: msg.chat,
        message: msg.msg,
        pfp: msg.pfp,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      })
      resp({ result: 'success' })
    }
  }

  return true;
})

