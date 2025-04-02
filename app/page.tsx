import { userInfo } from "@/utils/authUtils";
import Loading from "./loading";
import MosquesPage from "./mosques/page";


export default async function Home() {
  const userDetails = await userInfo();

  return (
    <>
      {!userDetails && <Loading />}
      <MosquesPage />
    </>
  );
}
