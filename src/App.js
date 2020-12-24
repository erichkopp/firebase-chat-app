import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useState, useRef } from 'react';

// APP INFO IN .env FILE ADDED TO .gitignore
!firebase.apps.length && 
  firebase.initializeApp({
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
  })

const auth = firebase.auth();
const firestore = firebase.firestore();




function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        {user && <SignOut />}
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}




function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}




function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}




function ChatRoom() {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt');

  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('')
  const dummy = useRef();


  const sendMessage = async(e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <div>
        {messages && messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy} style={{height: "10vh"}}></div>
      </div>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit">SEND</button>
      </form>
    </>
  )
}




function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = (uid === auth.currentUser.uid ? 'sent' : 'received');

  return (
    <div className={`message ${messageClass}`}>
      {photoURL ? <img src={photoURL} alt="user" /> : <img alt="" />}
      <p>{text}</p>
    </div>
  )
}

export default App;
// TUTORIAL FROM:
// https://www.youtube.com/watch?v=zQyrwxMPm88