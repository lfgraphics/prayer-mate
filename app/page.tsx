"use client"
import { useUser } from '@clerk/clerk-react';
import { useRouter } from "next/navigation";
import Loading from "./loading";

export default function Home() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded || !isSignedIn) {
    return null
  }

  if (isSignedIn && isLoaded && user) {
    const redirectUrl = (user.publicMetadata.redirectUrl as string) || '/mosques'
    router.replace(redirectUrl)
  }
  return (
    <>
      {!isLoaded && <Loading />}
      <div className="m-4">Checking your Login status please wait...</div>
    </>
  );
}
