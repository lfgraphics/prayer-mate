import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react';

const page = () => {
    const { isLoaded, isSignedIn, user } = useUser()
    const [mosqId, setMosqId] = useState<string>('')
    if (!isLoaded || !isSignedIn) {
        return null
    }
    if (isSignedIn && isLoaded && user) {
        const role = user.publicMetadata.role;
        if (role !== "imam" && role !== "admin") {
            return <div>You're not authorized to view this page</div>
        }
        const userMowqId = user.publicMetadata.mosqId as string;
        setMosqId(userMowqId)
    }
    return (
        <div>

        </div>
    )
}

export default page
