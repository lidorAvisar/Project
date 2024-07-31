/* eslint-disable */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.deleteUserOnFirestoreDelete = functions.firestore
    .document('users/{userId}')
    .onDelete(async (snap, context) => {
        const userId = context.params.userId;

        try {
            await admin.auth().deleteUser(userId)
        }
        catch (error) {
            alert(error);
        }
    });

exports.changeEmail = functions.firestore.document('users/{userId}').onUpdate(async (snap, context) => {
    const userId = context.params.userId;
    const beforeChange = snap.before.data();
    const afterChange = snap.after.data();

    try {

        if (beforeChange.email !== afterChange.email) {
            await admin.auth().updateUser(userId, {
                email: afterChange.email
            })
            return {
                status: 'success',
                message: 'Email updated successfully'
            };
        }
        return {
            status: "success",
            message: "nothing to update"
        }

    } catch (err) {
        console.error('Error updating email:', err);
        return {
            status: 'error',
            message: 'Error updating email'
        };
    }
})


exports.changeUserPassword = functions.https.onCall(async (data, context) => {
    const { uid, newPassword } = data;
    try {
        // Update the user's password
        await admin.auth().updateUser(uid, {
            password: newPassword
        });
        return {
            status: 'success',
            message: 'Password updated successfully'
        };
    } catch (error) {
        console.error('Error updating password:', error);
        return {
            status: 'error',
            message: 'Error updating password'
        };
    }
});