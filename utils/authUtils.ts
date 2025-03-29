'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'

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