import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, updatePassword, createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions, httpsCallable } from 'firebase/functions';


const REQUESTS_LIMIT = 7;
const TIME_WINDOW = 10 * 1000;


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


//אוטנטיקציה למשתמש כניסה
export const signIn = async (email, password) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res;
}

//בfireStore מייצר לך משתמש
export const createUserDoc = async (data) => {
  const { uid, email, displayName, ...additional } = data;
  try {
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
  }
  catch (error) {
    console.log(error);

  }
};

// העברת נתוני התלמיד לארכיון
export const archiveStudent = async (studentDetails) => {
  const { uid } = studentDetails;
  const archiveDocRef = doc(db, "student_archive", uid);
  try {
    await setDoc(archiveDocRef, {
      ...studentDetails,
      archivedAt: new Date(),
    });
  }
  catch (error) {
    console.log(error);
  }
};

//לא משומש
// export const addUserToAuth = async (email, password) => {
//   return await createUserWithEmailAndPassword(auth, email, password);
// }

//יצירת משתמש לאוטנטיקציה
export const addUser = async (email, password) => {
  const apiKey = firebaseConfig.apiKey;
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;

  const payload = {
    email: email,
    password: password,
    returnSecureToken: true
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
    if (error.message === "EMAIL_EXISTS") {
      alert("המשתמש לא נוצר כי האימייל הזה כבר קיים במערכת.");
    } else {
      alert(" אנא נסה שוב,שגיאה ביצירת המשתמש.");
    }
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
    console.error(error)
  }
}


//משיג את כל המשתמשים
export const getAccounts = async () => {
  const now = Date.now();
  const requestLog = JSON.parse(localStorage.getItem("requestLog")) || [];

  // Remove any requests older than the current time window
  const updatedLog = requestLog.filter(timestamp => now - timestamp < TIME_WINDOW);
  updatedLog.push(now); // Add the current request timestamp

  localStorage.setItem("requestLog", JSON.stringify(updatedLog));

  // Check if the number of requests in the last minute exceeds the limit
  if (updatedLog.length > REQUESTS_LIMIT) {
    alert("עשית יותר מדי בקשות. אנא נסה שוב בעוד דקה.");
    return;
  }

  try {
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
  catch (error) {
    alert("לא נמצא")
    console.error(error)
  }
}

// משיג את כל התלמידים בארכיון
export const getArchiveAccounts = async () => {
  try {
    const queryObject = query(collection(db, "student_archive"));
    const userDocs = await getDocs(queryObject);
    if (userDocs.empty) {
      return [];
    }

    const usersData = userDocs.docs.map(doc => {
      return doc.data();
    })

    return usersData;
  }
  catch (error) {
    alert("לא מצליח להשיג את התלמידים")
  }
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
    await updateDoc(userDocRef, { ...data });
    return userDocRef;
  }
  catch (error) {
    alert("שגיאה")
  }
}

// הוספה ועדכון בוחן לתלמיד
export const createUserExam = async (uid, exam) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      // Create a new document if it doesn't exist
      await setDoc(userDocRef, { studentExams: [exam] });
    } else {
      // Document exists, append the new exam to the `studentExams` array
      const currentData = userSnapshot.data();
      const existingExams = currentData.studentExams || [];
      const updatedExams = [...existingExams, exam]; // Append the new exam

      await updateDoc(userDocRef, { studentExams: updatedExams });
    }
  } catch (error) {
    console.error("Error updating student exams:", error);
    alert("שגיאה");
  }
};


//מאזין לשינויים באוטנטיקציה
export const onAuthStateChangedListener = async (callback) =>
  onAuthStateChanged(auth, callback);


//משיג את השיעורי נהיגה
// export const getPracticalDriving = async () => {
//   try {
//     const queryObject = query(collection(db, "practical_driving"));
//     const practical_drivingDocs = await getDocs(queryObject);
//     if (practical_drivingDocs.empty) {
//       return [];
//     }

//     const drivingData = practical_drivingDocs.docs.map(doc => {
//       return doc.data();
//     })

//     return drivingData;
//   }

//   catch (error) {
//     alert("שגיאה")
//   }
// }

//הוספת שיעור נהיגה 
export const addLesson = async (userId, lessonData) => {
  const userDocRef = doc(db, "users", userId);

  try {
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      throw new Error("User not found!");
    }

    const userData = userSnapshot.data();

    // Ensure practicalDriving exists as an array
    const existingLessons = Array.isArray(userData.practicalDriving)
      ? userData.practicalDriving
      : [];

    // Generate a unique ID for the new lesson
    const lessonId = crypto.randomUUID();

    const newLesson = {
      uid: lessonId,
      ...lessonData,
      createdAt: Date.now(),
    };

    // Add the new lesson to the practicalDriving array
    const updatedLessons = [...existingLessons, newLesson];

    // Update the user's document with the new array
    await updateDoc(userDocRef, {
      practicalDriving: updatedLessons,
    });

    return userDocRef;
  } catch (error) {
    throw new Error(`Failed to add lesson: ${error.message}`);
  }
};

// עדכון שיעורי הנהיגה
export const updateLesson = async (userUid, updatedArray) => {
  try {
    const userDocRef = doc(db, "users", userUid);

    // Fetch existing practicalDriving array from Firestore
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      throw new Error("User document does not exist");
    }

    const currentArray = userDocSnap.data().practicalDriving || [];

    // Create a map for easier comparison by uid
    const updatedMap = new Map(updatedArray.map(item => [item.uid, item]));

    // Merge the updates into the current array
    const mergedArray = currentArray.map(item =>
      updatedMap.has(item.uid) ? { ...item, ...updatedMap.get(item.uid) } : item
    );
    console.log(mergedArray);

    //Write the merged array back to Firestore
    await updateDoc(userDocRef, {
      practicalDriving: mergedArray
    });

    return userDocRef;
  }
  catch (error) {
    console.error("Error updating lessons:", error);
    alert("שגיאה בעדכון השיעורים");
  }
};


//מחיקת שיעור נהיגה
export const deleteLesson = async (studentUid, lessonId) => {
  const studentDocRef = doc(db, "users", studentUid);

  try {
    // Fetch the current student document
    const studentSnapshot = await getDoc(studentDocRef);

    if (!studentSnapshot.exists()) {
      throw new Error("Student not found!");
    }

    const studentData = studentSnapshot.data();

    // Check if practicalDriving array exists
    const practicalDriving = Array.isArray(studentData.practicalDriving)
      ? studentData.practicalDriving
      : [];

    // Filter out the lesson with the specified lessonId
    const updatedPracticalDriving = practicalDriving.filter(
      lesson => lesson.uid !== lessonId
    );

    // Update the student's document with the modified practicalDriving array
    await updateDoc(studentDocRef, {
      practicalDriving: updatedPracticalDriving,
      updatedAt: Date.now(),
    });

    return studentDocRef;
  }
  catch (error) {
    throw new Error(`Failed to delete lesson: ${error.message}`);
  }
};

// מחיקת כל השיעורים של אותו תלמיד או מורה
// export const deleteLessons = async (lessonIdList) => {
//   if (!lessonIdList) {
//     throw new Error("Provide lesson Ids");
//   }

//   for (const lessonId of lessonIdList) {
//     const lessonDocRef = doc(db, "practical_driving", lessonId);
//     try {
//       await deleteDoc(lessonDocRef);
//     } catch (err) {
//       throw err;
//     }
//   }
//   return { status: 200 };
// }

//שינוי סיסמא
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

//משיכת כל המבחני תלמידים
export const getStudentsTests = async () => {
  try {
    const studentsTestsRef = collection(db, "students_tests");
    const querySnapshot = await getDocs(studentsTestsRef);

    const tests = querySnapshot.docs.map(doc => doc.data());

    return tests;
  }
  catch (error) {
    console.error("Error fetching student tests: ", error);
    throw new Error("Failed to fetch student tests");
  }
};

//הוספת מבחן לרשימת המבחנים דויד,האמר וכו
export const addStudentsTests = async (data) => {
  try {
    // Generate a new document reference with a specific ID
    const studentsTestsRef = doc(collection(db, "students_tests"));
    const newDocId = studentsTestsRef.id;  // This is the ID generated for the new document

    // Prepare the data with the generated ID as the uid
    const testData = {
      vehicleType: data.vehicleType,
      date: data.date,
      questions: data.questions,
      uid: newDocId,  // Set uid to match the document ID
      createdAt: new Date(),
    };

    // Create the document with setDoc, specifying the uid field
    await setDoc(studentsTestsRef, testData);

  }
  catch (error) {
    alert("שגיאה בהוספת מבחן")
    console.error("Error adding test: ", error);
    throw new Error("Failed to add test");
  }
}

//עדכון רשימת המבחנים
export const updateStudentsTests = async (data, uid) => {
  try {
    // Reference to the student's test document
    const testDocRef = doc(db, 'students_tests', uid);

    // Update the document in Firestore
    await updateDoc(testDocRef, data);

    console.log("Test data updated successfully!");
  }
  catch (error) {
    alert("Error updating test data: ")
  }
};