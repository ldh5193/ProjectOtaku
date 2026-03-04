import Header from "@/components/Header";
import HomeClient from "@/components/HomeClient";
import type { Store } from "@/types/store";
import manualData from "../../public/data/stores-manual.json";
import naverData from "../../public/data/stores-naver.json";

const stores: Store[] = [
  ...(manualData as Store[]),
  ...(naverData as Store[]),
];

export default function Home() {
  return (
    <>
      <Header />
      <HomeClient stores={stores} />
    </>
  );
}
