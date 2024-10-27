import styles from "./page.module.css";
import {headers} from "next/headers";

const getDate = async () => {
    "use server";
    console.log("getDate called");
    const date = new Date().toISOString();

    return date;
}

export const dynamic = 'force-dynamic'

export default async function Home() {
    const date = await getDate();
    const headersList = await headers()
    const hostname = headersList.get('host')

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Welcome to my website</h1>
            <p className={styles.date}>Today is {date}</p>
            <p className={styles.hostname}>Hostname: {hostname}</p>
        </div>
    );
}
