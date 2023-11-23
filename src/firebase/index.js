import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBWM1z770o7P_gubvi9G0F1OgAXPdc53Cs',
  authDomain: 'todo-list-e7ec5.firebaseapp.com',
  projectId: 'todo-list-e7ec5',
  storageBucket: 'todo-list-e7ec5.appspot.com',
  messagingSenderId: '582868984673',
  appId: '1:582868984673:web:7cd0dd4241b70599319b20'
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export {
    db
}