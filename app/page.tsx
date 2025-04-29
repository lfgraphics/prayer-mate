import { userInfo } from "@/utils/authUtils";
import Loading from "./loading";
import MosquesPage from "./mosques/page";


export default async function Home({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const userDetails = await userInfo();

  return (
    <>
      {!userDetails && <Loading />}
      <MosquesPage searchParams={searchParams} />
    </>
  );
}
