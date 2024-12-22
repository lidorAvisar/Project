import { useMutation, useQueryClient } from "react-query";
import { addUser, createUserDoc } from "./firebase_config";
// import { useCurrentUser } from "./useCurerntUser";


export default function useCreateUser() {
    const queryClient = useQueryClient();
    // const [currentUser] = useCurrentUser();

    const handleRefetch = async () => {
        await queryClient.refetchQueries(['users']);
    }

    const { mutate: createUser, ...other } = useMutation({
        mutationKey: ['users'],
        mutationFn: async (userData) => {
            // Add user to Firebase Authentication
            if (!userData) {
                throw new Error("No user data present");
            }

            const data = await addUser(userData.email, userData.password);

            if (!data) {
                throw new Error("No success creating user");
            }

            const { localId: uid } = data;
            // Create Firestore document with the same UID
            return await createUserDoc({
                email: userData.email,
                displayName: userData.displayName,
                userId: userData.userId,
                departments: userData.departments,
                cycle: userData.cycle,
                user: userData.user,
                school: userData.school,
                uid: uid,  // Ensure the UID is passed to createUserDoc,
                practicalDriving: [],
            });
        },
        onSuccess: () => handleRefetch(),
    });


    const { mutate: createAdmin } = useMutation({
        mutationKey: ['users'],
        mutationFn: async (userData) => {
            // Add user to Firebase Authentication
            if (!userData) {
                throw new Error("No user data present");
            }

            const data = await addUser(userData.email, userData.password);

            if (!data) {
                throw new Error("No success creating user");
            }

            const { localId: uid } = data;

            // Create Firestore document with the same UID
            return await createUserDoc({
                email: userData.email,
                displayName: userData.displayName,
                departments: userData.departments,
                userId: userData.userId,
                cycle: userData.cycle,
                user: userData.user,
                uid: uid,
            });
        },
        onSuccess: () => handleRefetch(),
    });

    return { createUser, other, createAdmin }
}