"use client"
import Image from "next/image";
import { useUser } from '@clerk/clerk-react';
import { useEffect } from "react";
// import { allowedRoutes } from "@/utils/authUtils";
import { useRouter } from "next/navigation";
import Loading from "./loading";

export default function Home() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded || !isSignedIn) {
    return null
  }

  // useEffect(() => {
  if (isSignedIn && isLoaded && user) {
    // const role = user.publicMetadata.role as keyof typeof allowedRoutes;
    // const redirectUrl = allowedRoutes[role][0] || "/profile";
    const redirectUrl = (user.publicMetadata.redirectUrl as string) || '/mosques'
    router.replace(redirectUrl)
    
    // window.open(`/dashboard`);
    // console.log(`${redirectUrl}`)
  }
  // }, [])
  //   useEffect(() => {
  //     if (!isLoaded) {
  //     } else {
  //       router.push("/login");
  //     }
  //   }
  // }, [isLoading, user, router]);
  /* 
  const userId = 'user_123'
  
  const response = await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
    example: 'metadata',
  },
  })
  */
  return (
    <>
      {!isLoaded && <Loading />}
      <div className="m-4">Checking your Login status please wait...</div>
    </>
  );
}
