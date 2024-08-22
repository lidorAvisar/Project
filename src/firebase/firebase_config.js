import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, updatePassword, createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions, httpsCallable } from 'firebase/functions';


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};




// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


export const functions = getFunctions();

const changeUserPassword = httpsCallable(functions, "changeUserPassword")


//אוטנטיקציה למשתמש: הירשמות או כניסה
export const signUpWithEmailAndPassword = async (email, password) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res;
}

//מייצר לך משתמש , באמצעות יצירה של המ"פ
export const createUserDoc = async (data) => {
  const { uid, email, displayName, ...additional } = data;
  const userDocRef = doc(db, "users", uid);

  // Create the user document in Firestore
  await setDoc(userDocRef, {
    email,
    uid,
    displayName,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...additional,
  });

  return userDocRef;
};

export const addUserToAuth = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
}

export const addUser = async (email, password) => {
  const apiKey = firebaseConfig.apiKey;
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;

  const payload = {
    email: email,
    password: password,
    returnSecureToken: false
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    const data = await response.json();
    return data;
  }
  catch (error) {
    alert("שגיאה")
  }
};

//יצירת משתמש באמצעות הרשמה
export const createUserDocFromAuth = async (userAuth, additional = {}) => {
  const userDocRef = doc(db, "users", userAuth.uid);
  const userSnapshot = await getDoc(userDocRef)
  if (!userSnapshot.exists()) {
    const { email, uid, displayName } = userAuth;
    await setDoc(userDocRef,
      {
        email,
        uid,
        displayName,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        ...additional
      }
    )
  };
  return userDocRef;
};

//מחזיר מסמך מאוסף המשתשמשים בהתאם לid
export const getUserDoc = async (uid) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userDocRef);
    return userSnapshot.data();
  }
  catch (error) {
    alert("לא נמצא")
  }
}


//משיג את כל המשתמשים
export const getAccounts = async () => {
  const queryObject = query(collection(db, "users"));
  const userDocs = await getDocs(queryObject);
  if (userDocs.empty) {
    return [];
  }

  const usersData = userDocs.docs.map(doc => {
    return doc.data();  
  })

  return usersData;
}

//משיג את השיעורי נהיגה
export const getPracticalDriving = async () => {
  const queryObject = query(collection(db, "practical_driving"));
  const practical_drivingDocs = await getDocs(queryObject);
  if (practical_drivingDocs.empty) {
    return [];
  }

  const drivingData = practical_drivingDocs.docs.map(doc => {
    return doc.data();
  })

  return drivingData;
}


//מחיקת משתמש
export const deleteAccount = async (id) => {
  try {
    // Delete the user document from Firestore
    const userDocRef = doc(db, "users", id);
    await deleteDoc(userDocRef);
    return userDocRef;
  }
  catch (err) {
    throw err;
  }
}


// עדכון נתוני המשתמש
export const updateAccount = async (id, data) => {
  try {
    const userDocRef = doc(db, "users", id);
    if (data.hasOwnProperty("lessonId")) {
      const userDoc = await getDoc(userDocRef);
      await updateDoc(userDocRef, { ...data, lessons: [...userDoc.data().lessons, data.lessonId] });
    }
    else {
      await updateDoc(userDocRef, { ...data });
    }
    return userDocRef;
  }
  catch (error) {
    alert("שגיאה")
  }
}

//מאזין לשינויים באוטנטיקציה
export const onAuthStateChangedListener = async (callback) =>
  onAuthStateChanged(auth, callback);


//הוספת שיעור נהיגה 
export const addLesson = async (lessonId, data) => {
  const lessonDocRef = doc(db, "practical_driving", lessonId);
  const lessonSnapshot = await getDoc(lessonDocRef);

  if (lessonSnapshot.exists()) {
    throw new Error("Lesson already exists!");
  }
  await setDoc(lessonDocRef, { ...data, createdAt: Date.now(), updatedAt: Date.now(), uid: lessonId });
  return lessonDocRef;
}

// עדכון שיעור הנהיגה
export const updateLesson = async (lessonId, data) => {
  try {
    const lessonDocRef = doc(db, "practical_driving", lessonId);
    await updateDoc(lessonDocRef, { ...data });
    return lessonDocRef
  }
  catch (error) {
    alert("שגיאה")
  }
}

//מחיקת שיעור נהיגה
export const deleteLesson = async (lessonId) => {
  const lessonDocRef = doc(db, "practical_driving", lessonId);
  try {
    await deleteDoc(lessonDocRef);
    return lessonDocRef;
  } catch (err) {
    throw err;
  }
}
// מחיקת כל השיעורים של אותו תלמיד או מורה
export const deleteLessons = async (lessonIdList) => {
  if (!lessonIdList) {
    throw new Error("Provide lesson Ids");
  }

  for (const lessonId of lessonIdList) {
    const lessonDocRef = doc(db, "practical_driving", lessonId);
    try {
      await deleteDoc(lessonDocRef);
    } catch (err) {
      throw err;
    }
  }

  return { status: 200 };
}

export async function changePassword(uid, newPassword) {

  if (!uid || !newPassword) {
    throw new Error("Not all params has been met.");
  }
  try {
    const response = await changeUserPassword({ uid, newPassword });
  } catch (error) {
    alert("שגיאה")
  }
}