// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqx8CFL6uYQOwCndrDnkvQNF5i-_Nr2zc",
  authDomain: "elevatehq-a2671.firebaseapp.com",
  projectId: "elevatehq-a2671",
  storageBucket: "elevatehq-a2671.firebasestorage.app",
  messagingSenderId: "387674963331",
  appId: "1:387674963331:web:d8fc388c757d7c56c30ab6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);

//function to upload file to firebase storage
export async function uploadFile(
  file: File,
  setProgress?: (progress: number) => void,
) {
  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      //gives the uploaded percentage
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          if (setProgress) setProgress(progress);

          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        },
      );
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}
