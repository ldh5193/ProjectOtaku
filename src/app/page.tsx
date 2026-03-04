import HomeClient from "@/components/HomeClient";
import type { Store } from "@/types/store";
import manualData from "../../public/data/stores-manual.json";
import naverData from "../../public/data/stores-naver.json";
import urlData from "../../public/data/stores-url.json";

const stores: Store[] = [
  ...(manualData as Store[]),
  ...(naverData as Store[]),
  ...(urlData as Store[]),
];

export default function Home() {
  return <HomeClient stores={stores} />;
}
