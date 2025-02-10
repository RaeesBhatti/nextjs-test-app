import styles from "./page.module.css";
import { headers } from "next/headers";
import Image from "next/image";
import testPic from "./test.png";

const getDate = async () => {
  "use server";
  const date = new Date().toISOString();
  console.log(
    "getDate called",
    date,
    "a really long string that should cause the line to wrap and be truncated",
    date,
    "Another really long string that should cause the line to wrap and be truncated",
    date,
  );

  return date;
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const date = await getDate();
  const headersList = await headers();
  const hostname = headersList.get("host");

  throw new Error("An error occurred");

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Welcome to my website</h1>
      <p className={styles.date}>Today is {date}</p>
      <p className={styles.hostname}>Hostname: {hostname}</p>
      <Image
        src={testPic}
        alt="Picture of the author"
        width={200}
        height={200}
        // blurDataURL="data:..." automatically provided
        // placeholder="blur" // Optional blur-up while loading
      />
    </div>
  );
}
