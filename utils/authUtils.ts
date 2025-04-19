'use server'

import { auth, clerkClient, currentUser, User } from '@clerk/nextjs/server'

export const updateUserMetadata = async () => {
    const { userId } = await auth()

    if (!userId) {
        return { message: 'No Logged In User' }
    }

    const client = await clerkClient()

    try {
        const res = await client.users.updateUser(userId, {
            publicMetadata: {
                role: "user",
                redirectUrl: "/mosques"
            },
        })
        return { message: res.publicMetadata }
    } catch (err) {
        return { error: 'There was an error updating the user metadata.' }
    }
}

export const userInfo = async (): Promise<{ user: User | null, message: string }> => {
    const { userId } = await auth()

    if (!userId) {
        return {
            user: null,
            message: 'No Logged In User'
        }
    }

    const user = await currentUser();

    // Extract only the serializable properties we need
    const serializableUser = user ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        imageUrl: user.imageUrl,
        emailAddresses: user.emailAddresses.map(email => ({
            id: email.id,
            emailAddress: email.emailAddress,
        })),
        publicMetadata: user.publicMetadata
    } : null;

    return {
        user: serializableUser as User | null,
        message: 'Logged In'
    }
}