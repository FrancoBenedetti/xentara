import styles from "./page.module.css";
import Link from 'next/link';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>XENTARA</h1>
          <p className={styles.subtitle}>The Agentic Content-Studio Framework</p>
          
          <div className={styles.badge}>Phase 1: Infrastructure Ready</div>
        </div>

        <div className={styles.ctas}>
          <Link href="/dashboard" className={styles.primary}>
            Launch Curator Studio
          </Link>
          <a
            className={styles.secondary}
            href="https://github.com/FrancoBenedetti/xentara"
            target="_blank"
            rel="noopener noreferrer"
          >
            Access Repository
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 Xentara Architecture • Built for Community Intelligence</p>
      </footer>
    </div>
  );
}
